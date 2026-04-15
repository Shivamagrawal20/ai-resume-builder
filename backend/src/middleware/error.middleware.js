import { env } from "../config/index.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode ?? err.status ?? 500;
  let message = err.message ?? "Internal server error";
  if (status >= 500) {
    console.error(err);
    if (env.nodeEnv === "production") {
      message = "Internal server error";
    }
  }
  const body = { error: message };
  if (err.code) body.code = err.code;
  res.status(status).json(body);
}
