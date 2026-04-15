const TOKEN_KEY = "arb_token";
const DEMO_USER_KEY = "arb_demo_user";
const DEMO_RESUMES_KEY = "arb_demo_resumes";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function url(path) {
  const base = import.meta.env.VITE_API_URL;
  if (base) return `${base.replace(/\/$/, "")}${path}`;
  return path;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url(path), { ...options, headers });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

function getDemoUser() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setDemoUser(user) {
  if (user) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(DEMO_USER_KEY);
}

function getDemoResumes() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_RESUMES_KEY) || "[]");
  } catch {
    return [];
  }
}

function setDemoResumes(resumes) {
  localStorage.setItem(DEMO_RESUMES_KEY, JSON.stringify(resumes));
}

const DEMO_AI_KEY = "arb_demo_ai";

function getDemoAiMonthState() {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const raw = localStorage.getItem(DEMO_AI_KEY);
    const o = raw ? JSON.parse(raw) : { month, count: 0 };
    if (o.month !== month) return { month, count: 0 };
    return o;
  } catch {
    return { month, count: 0 };
  }
}

function setDemoAiMonthState(o) {
  localStorage.setItem(DEMO_AI_KEY, JSON.stringify(o));
}

function demoDelay() {
  return new Promise((resolve) => setTimeout(resolve, 120));
}

const realApi = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  listResumes: () => request("/api/resumes"),
  getResume: (id) => request(`/api/resumes/${id}`),
  createResume: (body) => request("/api/resumes", { method: "POST", body: JSON.stringify(body) }),
  updateResume: (id, body) => request(`/api/resumes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteResume: (id) => request(`/api/resumes/${id}`, { method: "DELETE" }),
  aiSuggest: (body) => request("/api/ai/suggest", { method: "POST", body: JSON.stringify(body) }),
};

const demoApi = {
  async register(body) {
    await demoDelay();
    const user = {
      id: crypto.randomUUID(),
      email: body.email,
      name: body.name || "Demo User",
    };
    setDemoUser(user);
    setToken("demo-token");
    return { user, token: "demo-token" };
  },
  async login(body) {
    await demoDelay();
    const existing = getDemoUser();
    const user = existing || { id: crypto.randomUUID(), email: body.email, name: "Demo User" };
    setDemoUser(user);
    setToken("demo-token");
    return { user, token: "demo-token" };
  },
  async me() {
    await demoDelay();
    const user = getDemoUser();
    if (!user) throw new Error("Session expired");
    const resumes = getDemoResumes();
    const ai = getDemoAiMonthState();
    return {
      user: { ...user, plan: "free" },
      usage: {
        resumes: { count: resumes.length, max: 10 },
        aiThisMonth: { count: ai.count, max: 15 },
      },
      features: { watermarkPdf: true, sharedTemplateLibrary: false },
    };
  },
  async listResumes() {
    await demoDelay();
    return { resumes: getDemoResumes() };
  },
  async getResume(id) {
    await demoDelay();
    const resume = getDemoResumes().find((r) => r._id === id);
    if (!resume) throw new Error("Resume not found");
    return { resume };
  },
  async createResume(body) {
    await demoDelay();
    const resumes = getDemoResumes();
    if (resumes.length >= 10) {
      throw new Error("Resume limit reached (10 on free plan). Upgrade or delete a resume.");
    }
    const resume = {
      _id: crypto.randomUUID(),
      title: body.title || "My resume",
      content: body.content || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    resumes.unshift(resume);
    setDemoResumes(resumes);
    return { resume };
  },
  async updateResume(id, body) {
    await demoDelay();
    const resumes = getDemoResumes();
    const idx = resumes.findIndex((r) => r._id === id);
    if (idx < 0) throw new Error("Resume not found");
    resumes[idx] = {
      ...resumes[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    setDemoResumes(resumes);
    return { resume: resumes[idx] };
  },
  async deleteResume(id) {
    await demoDelay();
    const resumes = getDemoResumes().filter((r) => r._id !== id);
    setDemoResumes(resumes);
    return null;
  },
  async aiSuggest(body) {
    await demoDelay();
    const ai = getDemoAiMonthState();
    if (ai.count >= 15) {
      throw new Error("Monthly AI limit reached (15 on free plan). Upgrade or wait until next month.");
    }
    ai.count += 1;
    setDemoAiMonthState(ai);
    const section = body?.section || "Section";
    return {
      suggestion: `Demo suggestion for ${section}: Quantified impact, used action verbs, and aligned to target role keywords.`,
    };
  },
};

async function withFallback(fn) {
  return fn(realApi);
}

export const api = {
  register: (body) => withFallback((client) => client.register(body)),
  login: (body) => withFallback((client) => client.login(body)),
  me: () => withFallback((client) => client.me()),
  listResumes: () => withFallback((client) => client.listResumes()),
  getResume: (id) => withFallback((client) => client.getResume(id)),
  createResume: (body) => withFallback((client) => client.createResume(body)),
  updateResume: (id, body) => withFallback((client) => client.updateResume(id, body)),
  deleteResume: (id) => withFallback((client) => client.deleteResume(id)),
  aiSuggest: (body) => withFallback((client) => client.aiSuggest(body)),
};
