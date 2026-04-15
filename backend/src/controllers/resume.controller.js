import { asyncHandler } from "../utils/asyncHandler.js";
import * as resumeService from "../services/resume.service.js";


export const list = asyncHandler(async (req, res) => {
  const items = await resumeService.listResumes(req.user._id);
  res.json({ resumes: items });
});

export const getOne = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResume(req.user._id, req.params.id);
  res.json({ resume });
});

export const create = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume(req.user._id, req.body);
  res.status(201).json({ resume });
});

export const update = asyncHandler(async (req, res) => {
  const resume = await resumeService.updateResume(req.user._id, req.params.id, req.body);
  res.json({ resume });
});

export const remove = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);
  res.status(204).send();
});
