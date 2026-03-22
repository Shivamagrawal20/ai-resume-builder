const TOKEN_KEY = "arb_token";

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

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  listResumes: () => request("/api/resumes"),
  getResume: (id) => request(`/api/resumes/${id}`),
  createResume: (body) => request("/api/resumes", { method: "POST", body: JSON.stringify(body) }),
  updateResume: (id, body) =>
    request(`/api/resumes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteResume: (id) => request(`/api/resumes/${id}`, { method: "DELETE" }),
  aiSuggest: (body) => request("/api/ai/suggest", { method: "POST", body: JSON.stringify(body) }),
};
