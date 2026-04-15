/** Subscription tiers — enforced on resume create and AI suggest. */
export const PLANS = {
  free: {
    maxResumes: 10,
    maxAiPerMonth: 15,
    watermarkPdf: true,
  },
  pro: {
    maxResumes: 40,
    maxAiPerMonth: 50,
    watermarkPdf: false,
  },
  team: {
    maxResumes: null,
    maxAiPerMonth: null,
    watermarkPdf: false,
    sharedTemplateLibrary: true,
  },
};

export function normalizePlan(plan) {
  if (plan === "pro" || plan === "team") return plan;
  return "free";
}

export function getLimits(plan) {
  return PLANS[normalizePlan(plan)];
}
