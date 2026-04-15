import { Resume } from "../models/Resume.js";
import { User } from "../models/User.js";
import { getLimits, normalizePlan } from "../config/plans.js";

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Ensure user has room for another resume (throws 403 with RESUME_LIMIT if not).
 */
export async function assertCanCreateResume(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }
  const plan = normalizePlan(user.plan);
  const lim = getLimits(plan);
  if (lim.maxResumes == null) return;
  const count = await Resume.countDocuments({ userId });
  if (count >= lim.maxResumes) {
    const err = new Error(
      `Resume limit reached (${lim.maxResumes} on ${plan} plan). Upgrade or delete a resume.`
    );
    err.statusCode = 403;
    err.code = "RESUME_LIMIT";
    throw err;
  }
}

/**
 * Check monthly AI quota without consuming (call before Gemini).
 */
export async function assertAiQuotaAvailable(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }
  const plan = normalizePlan(user.plan);
  const lim = getLimits(plan);
  if (lim.maxAiPerMonth == null) return;
  const month = currentMonthKey();
  let used = user.aiUsageCount ?? 0;
  if (user.aiUsageMonth !== month) used = 0;
  if (used >= lim.maxAiPerMonth) {
    const err = new Error(
      `Monthly AI limit reached (${lim.maxAiPerMonth} on ${plan} plan). Upgrade or wait until next month.`
    );
    err.statusCode = 403;
    err.code = "AI_LIMIT";
    throw err;
  }
}

/**
 * Increment AI usage after a successful suggestion.
 */
export async function recordAiGeneration(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  const month = currentMonthKey();
  if (user.aiUsageMonth !== month) {
    user.aiUsageMonth = month;
    user.aiUsageCount = 0;
  }
  user.aiUsageCount = (user.aiUsageCount ?? 0) + 1;
  await user.save();
}

export async function buildMePayload(userDoc) {
  const user = await User.findById(userDoc._id).lean();
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }
  const plan = normalizePlan(user.plan);
  const lim = getLimits(plan);
  const month = currentMonthKey();
  let aiCount = user.aiUsageCount ?? 0;
  if (user.aiUsageMonth !== month) aiCount = 0;
  const resumeCount = await Resume.countDocuments({ userId: user._id });
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name ?? "",
      isAdmin: !!user.isAdmin,
      plan,
    },
    usage: {
      resumes: { count: resumeCount, max: lim.maxResumes },
      aiThisMonth: { count: aiCount, max: lim.maxAiPerMonth },
    },
    features: {
      watermarkPdf: lim.watermarkPdf,
      sharedTemplateLibrary: !!lim.sharedTemplateLibrary,
    },
  };
}
