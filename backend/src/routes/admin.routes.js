import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireDbAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/stats", requireAuth, requireDbAdmin, adminController.stats);

export default router;
