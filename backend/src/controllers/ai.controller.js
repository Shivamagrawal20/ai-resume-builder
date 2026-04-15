import { asyncHandler } from "../utils/asyncHandler.js";
import * as aiService from "../services/ai.service.js";
import * as usage from "../services/usage.service.js";
import { scoreResumeForAts } from "../services/ats.service.js";


export const suggest = asyncHandler(async (req, res) => {
  const { section, context } = req.body;
  await usage.assertAiQuotaAvailable(req.user._id);
  const result = await aiService.suggestResumeSection({ section, context });
  await usage.recordAiGeneration(req.user._id);
  res.json(result);
});

export const atsScore = asyncHandler(async (req, res) => {
  const { content, jobDescription } = req.body;
  const result = scoreResumeForAts({ content, jobDescription });
  res.json(result);
});
