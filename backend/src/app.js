import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/index.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

function corsMiddleware() {
  const list = env.corsOrigin
    ? env.corsOrigin
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
  if (list?.length) {
    return cors({
      origin: list,
      credentials: true,
    });
  }
  return cors({ origin: true, credentials: true });
}

export function createApp() {
  const app = express();
  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(corsMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
