import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
