import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.env");
// Shell can set GEMINI_API_KEY= (empty); dotenv default does not override existing keys.
dotenv.config({
  path: envPath,
  override: process.env.NODE_ENV !== "production",
});

function required(name, value) {
  if (value == null || value === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  /** Comma-separated list. If empty, CORS reflects the request origin (ok for local dev). Set in production to your frontend URL(s). */
  corsOrigin: (process.env.CORS_ORIGIN ?? "").trim(),
  /** Set to `1` when behind a reverse proxy (Railway, Render, etc.) so `req.ip` and secure cookies behave. */
  trustProxy: process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true",
  mongodbUri: required("MONGODB_URI", process.env.MONGODB_URI),
  jwtSecret: required("JWT_SECRET", process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  geminiApiKey: (process.env.GEMINI_API_KEY ?? "").trim(),
  /** @see https://ai.google.dev/gemini-api/docs/models/gemini — 1.5-* IDs are retired (404); use 2.5+ */
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
};


