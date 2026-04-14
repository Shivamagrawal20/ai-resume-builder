# AI Resume Builder

A small full-stack app: a **React** web UI talks to a **Node.js** API that stores resumes in **MongoDB** and can call **Google Gemini** for section suggestions.

## What’s in this repo

| Folder | Role |
|--------|------|
| **`backend/`** | REST API: auth (JWT), resume CRUD, AI suggest endpoint |
| **`frontend/`** | React + Vite SPA: login/register, edit resumes, AI suggest UI |

See **`backend/README.md`** and **`frontend/README.md`** for how each part works and how to talk about them in demos or interviews.

## Function reference (all source functions)

There are **29** named functions in the backend and **15** in the frontend (**44** total), each documented with file links and a one-line description:

| Part | Document |
|------|----------|
| Backend | [Backend function reference](backend/README.md#backend-function-reference) |
| Frontend | [Frontend function reference](frontend/README.md#frontend-function-reference) |

Routes (`auth.routes.js`, `resume.routes.js`, `ai.routes.js`, `routes/index.js`) **do not define named functions**; they only wire URLs, validators, and controller handlers.

## Architecture (high level)

```text
Browser (React)
    │  HTTPS / fetch (dev: Vite proxies /api → backend)
    ▼
Express API (Node) — layered: routes → controllers → services → models
    ├── JWT + bcrypt for auth
    ├── Mongoose → MongoDB (users + resumes)
    └── Google Generative AI (Gemini) (optional) for /api/ai/suggest
```

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** running locally or a connection string (e.g. MongoDB Atlas)
- **Gemini API key** (optional; only needed for AI suggestions — [Google AI Studio](https://aistudio.google.com/apikey))

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and optionally GEMINI_API_KEY
npm install
npm run dev
```

API listens on **http://localhost:4000** by default (`GET /health` to verify).

### 2. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). In development, the Vite dev server **proxies** `/api` to the backend so the UI can call `/api/...` without CORS issues.

### 3. Production build (frontend)

```bash
cd frontend
npm run build
```

Serve the `frontend/dist/` static files with any static host. Set **`VITE_API_URL`** to your API’s public URL (see `frontend/README.md`).

## How to explain the project (short)

**One sentence:**  
“It’s a resume builder where users sign in, save resume data as JSON in MongoDB, and optionally get AI-suggested text for a section using Google Gemini.”

**Thirty seconds:**  
“Frontend is React with Vite; it stores a JWT after login and calls REST endpoints. Backend is Express with a normal layered structure—routes, controllers, services, models—plus MongoDB for users and resumes. The AI route calls the Gemini API when `GEMINI_API_KEY` is configured.”

**Two minutes:**  
Walk through: **auth** (register → hash password, login → JWT), **resumes** (CRUD only for the logged-in user), **AI** (POST with section + context → model returns suggestion). Mention **security** (JWT + HTTPS in production, secrets in env) and **what you’d add next** (rate limits, PDF export, password reset).

## License

Private / your choice — add a `LICENSE` file if you open-source the repo.
