import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";

export default function App() {
  const [token, setTokenState] = useState(() => getToken());
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);

  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [contentJson, setContentJson] = useState("{}");
  const [section, setSection] = useState("Experience");
  const [aiContext, setAiContext] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadMe = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
  }, []);

  const loadResumes = useCallback(async () => {
    const data = await api.listResumes();
    setResumes(data.resumes || []);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    (async () => {
      try {
        await loadMe();
        await loadResumes();
      } catch {
        setToken("");
        setTokenState(null);
        setUser(null);
      }
    })();
  }, [token, loadMe, loadResumes]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      const fn = tab === "register" ? api.register : api.login;
      const body =
        tab === "register"
          ? { email, password, name: name || undefined }
          : { email, password };
      const data = await fn(body);
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      await loadResumes();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken("");
    setTokenState(null);
    setUser(null);
    setResumes([]);
    setSelectedId(null);
    setSuggestion("");
  }

  async function openResume(id) {
    setMsg("");
    setSuggestion("");
    const { resume } = await api.getResume(id);
    setSelectedId(id);
    setTitle(resume.title);
    setContentJson(JSON.stringify(resume.content ?? {}, null, 2));
    setAiContext(JSON.stringify(resume.content ?? {}, null, 2));
  }

  async function saveResume() {
    setMsg("");
    let content;
    try {
      content = JSON.parse(contentJson || "{}");
    } catch {
      setMsg("Content must be valid JSON.");
      return;
    }
    setBusy(true);
    try {
      if (!selectedId) {
        const { resume } = await api.createResume({ title, content });
        setSelectedId(resume._id);
        await loadResumes();
        setMsg("Created.");
      } else {
        await api.updateResume(selectedId, { title, content });
        await loadResumes();
        setMsg("Saved.");
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function newResume() {
    setSelectedId(null);
    setTitle("My resume");
    setContentJson("{}");
    setAiContext("{}");
    setSuggestion("");
    setMsg("");
  }

  async function removeResume() {
    if (!selectedId || !confirm("Delete this resume?")) return;
    setBusy(true);
    try {
      await api.deleteResume(selectedId);
      await loadResumes();
      newResume();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function runAi() {
    setMsg("");
    setSuggestion("");
    let context = aiContext;
    try {
      const parsed = JSON.parse(aiContext);
      context = parsed;
    } catch {
      /* use as string */
    }
    setBusy(true);
    try {
      const data = await api.aiSuggest({ section, context });
      setSuggestion(data.suggestion || "");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (token && !user) {
    return (
      <div className="app">
        <p className="sub">Loading…</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="app">
        <h1>AI Resume Builder</h1>
        <p className="sub">Sign in to create and edit resumes. Backend runs on port 4000.</p>
        <div className="panel">
          <div className="tabs">
            <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
              Log in
            </button>
            <button
              type="button"
              className={tab === "register" ? "active" : ""}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleAuth}>
            {tab === "register" && (
              <div style={{ marginBottom: "0.75rem" }}>
                <label>Name (optional)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div style={{ marginBottom: "0.75rem" }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label>Password (min 8 characters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={tab === "register" ? "new-password" : "current-password"}
              />
            </div>
            <button type="submit" disabled={busy}>
              {busy ? "…" : tab === "register" ? "Create account" : "Log in"}
            </button>
            {authError && <p className="error">{authError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="row" style={{ marginBottom: "1rem" }}>
        <div>
          <h1>AI Resume Builder</h1>
          <p className="sub" style={{ margin: 0 }}>
            {user.email}
          </p>
        </div>
        <button type="button" className="secondary" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="row" style={{ marginBottom: "0.75rem" }}>
            <strong>Your resumes</strong>
            <button type="button" className="secondary" onClick={newResume}>
              New
            </button>
          </div>
          <ul className="list">
            {resumes.length === 0 && <li style={{ color: "var(--muted)" }}>No resumes yet.</li>}
            {resumes.map((r) => (
              <li key={r._id}>
                <button type="button" className="link" onClick={() => openResume(r._id)}>
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: "0.75rem" }} />
          <label>Content (JSON)</label>
          <textarea value={contentJson} onChange={(e) => setContentJson(e.target.value)} />
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={saveResume} disabled={busy}>
              {selectedId ? "Save" : "Create"}
            </button>
            {selectedId && (
              <button type="button" className="danger" onClick={removeResume} disabled={busy}>
                Delete
              </button>
            )}
          </div>
          {msg && <p className="hint">{msg}</p>}
        </div>
      </div>

      <div className="panel">
        <strong>AI suggest</strong>
        <p className="hint">Requires OPENAI_API_KEY on the server. Uses your context below.</p>
        <div className="grid-2" style={{ marginTop: "0.75rem" }}>
          <div>
            <label>Section name</label>
            <input value={section} onChange={(e) => setSection(e.target.value)} />
          </div>
          <div>
            <label>Context (JSON or text)</label>
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              style={{ minHeight: "100px" }}
            />
          </div>
        </div>
        <button type="button" style={{ marginTop: "0.75rem" }} onClick={runAi} disabled={busy}>
          Get suggestion
        </button>
        {suggestion && (
          <div className="suggestion">
            <strong>Suggestion</strong>
            {suggestion}
          </div>
        )}
      </div>
    </div>
  );
}
