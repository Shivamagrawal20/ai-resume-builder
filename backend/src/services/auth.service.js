import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { User } from "../models/User.js";

const SALT_ROUNDS = 10;

export async function registerUser({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash, name });
  return { user: toPublicUser(user), token: signToken(user._id) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  return { user: toPublicUser(user), token: signToken(user._id) };
}

function signToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: String(userId),
    expiresIn: env.jwtExpiresIn,
  });
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name ?? "",
  };
}
