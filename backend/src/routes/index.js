import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resumeRoutes from "./resume.routes.js";
import aiRoutes from "./ai.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/resumes", resumeRoutes);
apiRouter.use("/ai", aiRoutes);
