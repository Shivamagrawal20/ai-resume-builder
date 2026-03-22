import { Router } from "express";
import { body, param } from "express-validator";
import * as resumeController from "../controllers/resume.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", resumeController.list);

router.get("/:id", [param("id").isMongoId()], validate, resumeController.getOne);

router.post(
  "/",
  [body("title").trim().notEmpty(), body("content").optional()],
  validate,
  resumeController.create
);

router.patch(
  "/:id",
  [param("id").isMongoId(), body("title").optional().trim(), body("content").optional()],
  validate,
  resumeController.update
);

router.delete("/:id", [param("id").isMongoId()], validate, resumeController.remove);

export default router;
