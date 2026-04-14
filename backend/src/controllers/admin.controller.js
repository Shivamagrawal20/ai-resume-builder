import { asyncHandler } from "../utils/asyncHandler.js";
import * as adminService from "../services/admin.service.js";

export const stats = asyncHandler(async (req, res) => {
  const data = await adminService.getUsersWithResumeCounts();
  res.json(data);
});
