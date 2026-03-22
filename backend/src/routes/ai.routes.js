import { Router } from "express";
import { body } from "express-validator";
import * as aiController from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/suggest",
  [body("section").trim().notEmpty(), body("context").exists()],
  validate,
  aiController.suggest
);

export default router;
