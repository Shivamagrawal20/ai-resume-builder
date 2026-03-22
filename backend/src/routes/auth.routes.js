import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("name").optional().trim(),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  authController.login
);

router.get("/me", requireAuth, authController.me);

export default router;
