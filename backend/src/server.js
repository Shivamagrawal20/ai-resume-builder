import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { User, Resume } from "./models.js";

// --- config (read from .env) ---
function reqEnv(name) {
  const v = process.env[name];
  if (v == null || v === "") throw new Error(`Missing env: ${name}`);
  return v;
}

const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: reqEnv("MONGODB_URI"),
  jwtSecret: reqEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  openaiKey: process.env.OPENAI_API_KEY ?? "",
};

let openaiClient;
function getOpenAI() {
  if (!env.openaiKey) {
    const e = new Error("Set OPENAI_API_KEY for AI");
    e.statusCode = 503;
    throw e;
  }
  openaiClient ??= new OpenAI({ apiKey: env.openaiKey });
  return openaiClient;
}

// --- db ---
async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
}

// --- auth helpers ---
const BCRYPT_ROUNDS = 10;

function signToken(userId) {
  return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn });
}

function publicUser(doc) {
  return { id: doc._id.toString(), email: doc.email, name: doc.name ?? "" };
}

async function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select("_id email name");
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function errHandler(err, _req, res, _next) {
  const status = err.statusCode ?? err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message ?? "Server error" });
}

// --- app ---
function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  const api = express.Router();

  // Auth
  api.post(
    "/auth/register",
    asyncH(async (req, res) => {
      const { email, password, name } = req.body ?? {};
      if (!email || !password || password.length < 8) {
        return res.status(400).json({ error: "email and password (min 8 chars) required" });
      }
      if (await User.findOne({ email: String(email).toLowerCase() })) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await User.create({ email: String(email).toLowerCase(), passwordHash, name });
      res.status(201).json({ user: publicUser(user), token: signToken(user._id) });
    })
  );

  api.post(
    "/auth/login",
    asyncH(async (req, res) => {
      const { email, password } = req.body ?? {};
      if (!email || !password) return res.status(400).json({ error: "email and password required" });
      const user = await User.findOne({ email: String(email).toLowerCase() });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ user: publicUser(user), token: signToken(user._id) });
    })
  );

  api.get("/auth/me", requireAuth, (req, res) => res.json({ user: req.user }));

  // Resumes (protected)
  api.get(
    "/resumes",
    requireAuth,
    asyncH(async (req, res) => {
      const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
      res.json({ resumes });
    })
  );

  api.get(
    "/resumes/:id",
    requireAuth,
    asyncH(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad id" });
      const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).lean();
      if (!resume) return res.status(404).json({ error: "Not found" });
      res.json({ resume });
    })
  );

  api.post(
    "/resumes",
    requireAuth,
    asyncH(async (req, res) => {
      const { title, content } = req.body ?? {};
      if (!title || !String(title).trim()) return res.status(400).json({ error: "title required" });
      const r = await Resume.create({ userId: req.user._id, title: String(title).trim(), content: content ?? {} });
      res.status(201).json({ resume: r.toObject() });
    })
  );

  api.patch(
    "/resumes/:id",
    requireAuth,
    asyncH(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad id" });
      const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
      if (!resume) return res.status(404).json({ error: "Not found" });
      const { title, content } = req.body ?? {};
      if (title !== undefined) resume.title = title;
      if (content !== undefined) resume.content = content;
      await resume.save();
      res.json({ resume: resume.toObject() });
    })
  );

  api.delete(
    "/resumes/:id",
    requireAuth,
    asyncH(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad id" });
      const r = await Resume.deleteOne({ _id: req.params.id, userId: req.user._id });
      if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    })
  );

  // AI (protected)
  api.post(
    "/ai/suggest",
    requireAuth,
    asyncH(async (req, res) => {
      const { section, context } = req.body ?? {};
      if (!section || context == null || context === "") {
        return res.status(400).json({ error: "section and context required" });
      }
      const openai = getOpenAI();
      const ctx =
        typeof context === "string" ? context : JSON.stringify(context, null, 2);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise professional resume coach. Plain text or short bullets only.",
          },
          {
            role: "user",
            content: `Section: ${section}\nContext:\n${ctx}\nSuggest improved content.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      });
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      res.json({ suggestion: text });
    })
  );

  app.use("/api", api);
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errHandler);
  return app;
}

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => console.log(`http://localhost:${env.port}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
