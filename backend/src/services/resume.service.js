import { Resume } from "../models/Resume.js";

export async function listResumes(userId) {
  return Resume.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function getResume(userId, resumeId) {
  const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
  if (!resume) {
    const err = new Error("Resume not found");
    err.statusCode = 404;
    throw err;
  }
  return resume;
}

export async function createResume(userId, { title, content }) {
  const resume = await Resume.create({ userId, title, content: content ?? {} });
  return resume.toObject();
}

export async function updateResume(userId, resumeId, { title, content }) {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    const err = new Error("Resume not found");
    err.statusCode = 404;
    throw err;
  }
  if (title !== undefined) resume.title = title;
  if (content !== undefined) resume.content = content;
  await resume.save();
  return resume.toObject();
}

export async function deleteResume(userId, resumeId) {
  const result = await Resume.deleteOne({ _id: resumeId, userId });
  if (result.deletedCount === 0) {
    const err = new Error("Resume not found");
    err.statusCode = 404;
    throw err;
  }
}
