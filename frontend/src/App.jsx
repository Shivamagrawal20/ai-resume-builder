import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "./api.js";

function LandingPage({ user }) {
  const [activeBuilderTab, setActiveBuilderTab] = useState("Personal");
  const [navOpen, setNavOpen] = useState(false);
  const marqueeItems = [
    "MERN Stack",
    "AI Resume Builder",
    "Claude API",
    "MongoDB Atlas",
    "React.js",
    "Node.js",
    "ATS Optimization",
    "JWT Auth",
    "Express.js",
    "Mongoose ODM",
    "PDF Export",
    "NLP",
  ];

  useEffect(() => {
    document.title = "LetsResume — AI Resume Builder & ATS Checker";
  }, []);

  useEffect(() => {
    const cursor = document.querySelector(".cursor");
    const ring = document.querySelector(".cursor-ring");
    const moveCursor = (e) => {
      if (cursor) {
        cursor.style.left = `${e.clientX - 6}px`;
        cursor.style.top = `${e.clientY - 6}px`;
      }
      if (ring) {
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", moveCursor);

    const reveals = Array.from(document.querySelectorAll(".reveal"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const statEls = Array.from(document.querySelectorAll("[data-count]"));
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.getAttribute("data-count") || 0);
          let start = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              start = target;
              clearInterval(interval);
            }
            if (target >= 1000) el.textContent = `${Math.floor(start / 1000)}K+`;
            else if (target <= 10) el.textContent = `${Math.floor(start)}x`;
            else el.textContent = `${Math.floor(start)}`;
          }, 16);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );
    statEls.forEach((el) => counterObserver.observe(el));

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <div className="cursor" />
      <div className="cursor-ring" />
      <header className="home-nav">
        <div className="nav-logo">
          Lets<span>Resume</span>
        </div>
        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={navOpen}
          aria-controls="nav-links"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          onClick={() => setNavOpen((o) => !o)}
        >
          Menu
        </button>
        <ul className={`nav-links${navOpen ? " nav-open" : ""}`} id="nav-links">
          <li><a href="#how" onClick={() => setNavOpen(false)}>How it works</a></li>
          <li><a href="#features" onClick={() => setNavOpen(false)}>Features</a></li>
          <li><a href="#builder" onClick={() => setNavOpen(false)}>Builder</a></li>
          <li><a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a></li>
          <li><a href="/docs.html" onClick={() => setNavOpen(false)}>Documentation</a></li>
        </ul>
        <Link className="nav-cta" to={user ? "/app" : "/auth"}>Start for free →</Link>
      </header>
      {navOpen && (
        <button type="button" className="nav-menu-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />
      )}
      <main id="main-content">
      <section id="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
          <div className="hero-blob b3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">AI-Powered · ATS-Optimized · MERN Stack</div>
          <h1 className="hero-h1">Your resume,<br /><em>reimagined</em> by<br /><span className="strike">guesswork</span> AI</h1>
          <p className="hero-sub">
            LetsResume uses cutting-edge AI to transform your raw experience into polished, ATS-beating resumes. Create your resume online, run our ATS checker, and apply with confidence.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" to={user ? "/app" : "/auth"}>Build my resume <span>→</span></Link>
            <a className="btn-secondary" href="#how">See how it works</a>
          </div>
        </div>
      </section>
      <div className="marquee-section"><div className="marquee-track">{[...marqueeItems, ...marqueeItems].map((item, idx) => <span className="marquee-item" key={`${item}-${idx}`}>{item}<span className="marquee-dot" /></span>)}</div></div>
      <section id="how">
        <div className="reveal"><span className="section-label">Process</span></div>
        <div className="reveal reveal-delay-1"><h2 className="section-title">Four steps to<br />your dream job</h2></div>
        <div className="reveal reveal-delay-2"><p className="section-sub">From raw inputs to job-ready resume in under 5 minutes.</p></div>
        <div className="steps-grid reveal reveal-delay-3">
          <div className="step-card"><div className="step-num">01</div><div className="step-title">Create your account</div><div className="step-desc">Sign up securely with JWT authentication.</div></div>
          <div className="step-card"><div className="step-num">02</div><div className="step-title">Fill your details</div><div className="step-desc">Enter your experience, education, and skills quickly.</div></div>
          <div className="step-card"><div className="step-num">03</div><div className="step-title">Let AI enhance it</div><div className="step-desc">AI rewrites each section professionally.</div></div>
          <div className="step-card"><div className="step-num">04</div><div className="step-title">Export & apply</div><div className="step-desc">Download and use role-specific resume versions.</div></div>
        </div>
      </section>
      <section id="features">
        <div className="features-layout">
          <div>
            <div className="reveal"><span className="section-label">Features</span></div>
            <div className="reveal reveal-delay-1"><h2 className="section-title">Everything you need to stand out</h2></div>
            <div className="reveal reveal-delay-2"><p className="section-sub">Backed by MERN and AI integrations for job seekers.</p></div>
            <div className="features-list" style={{ marginTop: "40px" }}>
              {["AI Content Generation", "ATS Score Analyzer", "Persistent Storage", "Multiple Templates", "PDF Export"].map((feature) => (
                <div className="feature-item reveal reveal-delay-3" key={feature}>
                  <div className="feature-icon">✨</div>
                  <div className="feature-text"><h3>{feature}</h3><p>Professional experience designed for modern hiring workflows.</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="features-visual reveal reveal-delay-2"><div className="visual-ui"><div className="visual-header"><div className="vdot r" /><div className="vdot y" /><div className="vdot g" /><span className="visual-title">AI Resume Assistant</span></div><div className="ai-typing"><div className="ai-label">✦ AI is writing your summary</div><div className="ai-text">Results-driven full-stack developer with 2+ years building scalable MERN applications.<span className="ai-cursor" /></div></div></div></div>
        </div>
      </section>
      <section id="builder">
        <div className="reveal"><span className="section-label">Live Builder</span></div>
        <div className="reveal reveal-delay-1"><h2 className="section-title">Build in real time</h2></div>
        <div className="reveal reveal-delay-2"><p className="section-sub">Type your details, hit AI, and improve each section instantly.</p></div>
        <div className="builder-mockup reveal reveal-delay-3">
          <div className="builder-topbar">
            <div className="builder-tabs">
              {["Personal", "Experience", "Education", "Skills", "Projects"].map((tab) => (
                <button type="button" key={tab} className={`btab ${activeBuilderTab === tab ? "active" : ""}`} onClick={() => setActiveBuilderTab(tab)}>{tab}</button>
              ))}
            </div>
            <div className="builder-actions"><button className="bact ai">✦ AI Enhance</button><button className="bact export">↓ Export PDF</button></div>
          </div>
          <div className="builder-body"><div className="builder-form"><div className="form-section-title">Personal Information</div><div className="form-group"><label className="form-label">Full Name</label><input className="form-field" value="Shivam Agrawal" readOnly /></div><div className="form-group"><label className="form-label">Job Title</label><input className="form-field" value="Full Stack Developer" readOnly /></div><button className="ai-suggest-btn">✦ Rewrite with AI → professional & ATS-optimized</button></div><div className="builder-preview"><div className="preview-paper"><div className="preview-name">Shivam Agrawal</div><div className="preview-role">Full Stack Developer — React · Node.js · MongoDB</div></div></div></div>
        </div>
      </section>
      <section id="stats" style={{ padding: 0 }}><div className="stats-grid"><div className="stat-item reveal"><div className="stat-num" data-count="50000">0</div><div className="stat-label">Resumes Built</div></div><div className="stat-item reveal reveal-delay-1"><div className="stat-num" data-count="87">0</div><div className="stat-label">Avg ATS Score</div></div><div className="stat-item reveal reveal-delay-2"><div className="stat-num" data-count="3">0</div><div className="stat-label">x More Interviews</div></div><div className="stat-item reveal reveal-delay-3"><div className="stat-num" data-count="5">0</div><div className="stat-label">Minute Setup Time</div></div></div></section>
      <section id="testimonials"><div style={{ textAlign: "center" }}><div className="reveal"><span className="section-label">Reviews</span></div><div className="reveal reveal-delay-1"><h2 className="section-title">What job seekers say</h2></div></div><div className="testi-grid"><div className="testi-card reveal reveal-delay-1"><div className="testi-stars">★★★★★</div><div className="testi-text">I got more interviews after optimizing with AI suggestions.</div></div><div className="testi-card reveal reveal-delay-2"><div className="testi-stars">★★★★★</div><div className="testi-text">Best resume workflow I have used this year.</div></div><div className="testi-card reveal reveal-delay-3"><div className="testi-stars">★★★★★</div><div className="testi-text">Fast, polished, and great for role-specific versions.</div></div></div></section>
      <section id="pricing">
        <div style={{ textAlign: "center" }}>
          <div className="reveal"><span className="section-label">Pricing</span></div>
          <div className="reveal reveal-delay-1"><h2 className="section-title">Simple, honest pricing</h2></div>
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal reveal-delay-1">
            <div className="price-plan">Free</div>
            <div className="price-amount">₹0</div>
            <div className="price-period">Forever free</div>
            <ul className="price-features">
              <li>Up to 10 resumes</li>
              <li>15 AI generations / month</li>
              <li>PDF download with watermark</li>
              <li>ATS score checker</li>
            </ul>
          </div>
          <div className="price-card featured reveal reveal-delay-2">
            <div className="price-badge">Most Popular</div>
            <div className="price-plan">Pro</div>
            <div className="price-amount">₹105</div>
            <div className="price-period">per month</div>
            <ul className="price-features">
              <li>Up to 40 resumes</li>
              <li>50 AI generations / month</li>
              <li>Clean PDF export (no watermark)</li>
              <li>Everything in Free</li>
            </ul>
          </div>
          <div className="price-card reveal reveal-delay-3">
            <div className="price-plan">Team</div>
            <div className="price-amount">₹799</div>
            <div className="price-period">per month</div>
            <ul className="price-features">
              <li>Unlimited resumes</li>
              <li>Unlimited AI generations</li>
              <li>Shared template library</li>
              <li>Priority support</li>
              <li>Multiple seats (coming soon)</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="cta"><div className="cta-bg-text">LetsResume</div><div className="cta-content reveal"><h2 className="cta-title">Ready to land your<br /><em>dream job?</em></h2><p className="cta-sub">Join 50,000+ job seekers who write better resumes with AI.</p><div className="cta-form"><input className="cta-input" type="email" placeholder="Enter your email address" /><Link className="btn-cta" to={user ? "/app" : "/auth"}>Start free →</Link></div><p className="cta-note">No credit card required · Free plan available · Setup in 60 seconds</p></div></section>
      </main>
      <footer><div className="footer-grid"><div><div className="footer-brand">Lets<span style={{ color: "var(--accent)" }}>Resume</span></div><p className="footer-desc">AI-powered resume builder and ATS checker — MERN stack app at letsresume.netlify.app.</p></div><div><div className="footer-col-title">Product</div><ul className="footer-links"><li><a href="#how">How it works</a></li><li><a href="#features">Features</a></li><li><a href="#builder">Builder</a></li></ul></div><div><div className="footer-col-title">Resources</div><ul className="footer-links"><li><a href="/docs.html">Documentation</a></li><li><a href="#pricing">Pricing</a></li><li><a href="/auth">Support</a></li></ul></div><div><div className="footer-col-title">Company</div><ul className="footer-links"><li><a href="/auth">About</a></li><li><a href="/auth">Contact</a></li></ul></div></div><div className="footer-bottom">
          <span>
            © 2026 @letsresume by{" "}
            <a href="https://learnershut.com" target="_blank" rel="noopener noreferrer">learnershut.com</a>
            {" "}
            — made by Shivam Agrawal
          </span>
          <span>
            Built with <span className="footer-accent">♥</span> by{" "}
            <a href="https://github.com/Shivamagrawal20" target="_blank" rel="noopener noreferrer">Shivam Agrawal</a>
          </span>
        </div></footer>
    </div>
  );
}

const PASSWORD_MAX_LENGTH = 10;

function AuthPage({ onAuthSuccess, user }) {
  useEffect(() => {
    document.title = "Sign in | LetsResume — Resume Builder & ATS Checker";
  }, []);

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      const fn = tab === "register" ? api.register : api.login;
      const body = tab === "register" ? { email, password, name: name || undefined } : { email, password };
      const data = await fn(body);
      onAuthSuccess(data);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="back-home">
        ← Back to LetsResume
      </Link>
      <div className="auth-card">
        <h1>Welcome to LetsResume</h1>
        <p>Sign in to create and manage AI-assisted resumes.</p>
        <div className="tabs">
          <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
            Log in
          </button>
          <button type="button" className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
            Register
          </button>
        </div>

        <form onSubmit={handleAuth}>
          {tab === "register" && (
            <div className="field">
              <label>Name (optional)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label>{tab === "register" ? "Password (8–10 characters)" : "Password"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={tab === "register" ? 8 : undefined}
              maxLength={PASSWORD_MAX_LENGTH}
              autoComplete={tab === "register" ? "new-password" : "current-password"}
            />
          </div>
          <button type="submit" className="button primary wide" disabled={busy}>
            {busy ? "Please wait..." : tab === "register" ? "Create account" : "Log in"}
          </button>
          {authError && <p className="error">{authError}</p>}
        </form>
      </div>
    </main>
  );
}

function BuilderPage({ user, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard | LetsResume";
  }, []);

  useEffect(() => {
    if (!user) return;
    window.location.href = "/dashboard.html";
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;
  return (
    <main className="builder-page">
      <p className="muted">Opening dashboard...</p>
      <button className="button ghost" onClick={() => { onLogout(); navigate("/auth"); }}>Log out</button>
    </main>
  );
}

export default function App() {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const loadMe = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    (async () => {
      try {
        await loadMe();
      } catch {
        setToken("");
        setTokenState(null);
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    })();
  }, [token, loadMe]);

  function handleAuthSuccess(data) {
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  }

  function handleLogout() {
    setToken("");
    setTokenState(null);
    setUser(null);
  }

  if (!authReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} user={user} />} />
      <Route path="/app" element={<BuilderPage user={user} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
