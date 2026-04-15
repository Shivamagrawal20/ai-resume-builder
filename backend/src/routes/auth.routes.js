import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

/** Align with UI; bcrypt also effectively caps at 72 bytes for hashing. */
const PASSWORD_MAX_LENGTH = 10;

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8, max: PASSWORD_MAX_LENGTH }),
    body("name").optional().trim(),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 1, max: PASSWORD_MAX_LENGTH }),
  ],
  validate,
  authController.login
);

router.get("/me", requireAuth, authController.me);

export default router;
