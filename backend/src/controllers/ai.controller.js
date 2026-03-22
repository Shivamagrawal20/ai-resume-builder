import { asyncHandler } from "../utils/asyncHandler.js";
import * as aiService from "../services/ai.service.js";

export const suggest = asyncHandler(async (req, res) => {
  const { section, context } = req.body;
  const result = await aiService.suggestResumeSection({ section, context });
  res.json(result);
});
