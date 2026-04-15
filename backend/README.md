# Backend — AI Resume Builder API

Node.js **Express** API with **MongoDB** (Mongoose) and optional **Google Gemini** (`@google/generative-ai`). The code uses a **layered layout** (routes → controllers → services → models) so you can explain each responsibility clearly. A few folders hold **placeholder files only** (comments, no logic yet) to show where growth would go.

## Folder structure

```text
backend/src/
├── server.js                 # Entry: connect DB, start HTTP
├── app.js                    # Express app, middleware, mount /api
├── config/
│   ├── index.js              # Env (MONGODB_URI, JWT_SECRET, …)
│   └── db.js                 # Mongoose connect
├── models/
│   ├── User.js
│   └── Resume.js
├── routes/
│   ├── index.js              # Mounts /auth, /resumes, /ai
│   ├── auth.routes.js
│   ├── resume.routes.js
│   └── ai.routes.js
├── controllers/              # HTTP in/out (thin)
├── services/                 # Business logic + Gemini (ai.service.js)
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── validate.middleware.js
│   └── rateLimit.middleware.js   # placeholder (empty)
├── utils/
│   └── asyncHandler.js
├── constants/index.js        # placeholder (comment only)
├── jobs/index.js             # placeholder (comment only)
└── validators/
    └── validators.placeholder.js  # placeholder (comment only)
```

## How a request flows

1. **`server.js`** loads **`.env`**, calls **`connectDb()`**, builds the app with **`createApp()`**, listens on **`PORT`**.
2. **`app.js`** applies **Helmet**, **CORS**, JSON parsing, **`/health`**, then **`/api`** from **`routes/index.js`**.
3. **Routes** attach **express-validator** rules and **`validate`**, then call **controllers**.
4. **Controllers** call **services** and send JSON responses.
5. **Services** use **models** (and **Gemini** in `ai.service.js`).
6. **Protected routes** use **`requireAuth`** (JWT in `Authorization: Bearer`).

## Implemented vs placeholder

| Area | Status |
|------|--------|
| Auth, resumes, AI suggest | Implemented end-to-end |
| `constants/`, `jobs/`, `validators/…placeholder`, `rateLimit.middleware.js` | Intentionally empty stubs for future features |

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `PORT` | No | Default `4000` |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `GEMINI_API_KEY` | No | Needed for `POST /api/ai/suggest` |
| `GEMINI_MODEL` | No | Default `gemini-2.5-flash` (`gemini-1.5-*` returns 404 — retired) |

## Scripts

```bash
npm install
npm run dev    # node --watch
npm start
```

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Liveness |
| `POST` | `/api/auth/register` | No | `{ user, token }` |
| `POST` | `/api/auth/login` | No | `{ user, token }` |
| `GET` | `/api/auth/me` | Yes | `{ user, usage, features }` — `user.plan` is `free` \| `pro` \| `team`; `usage` has resume & monthly AI counts vs plan caps; `features.watermarkPdf` is true on Free (PDF watermark in live editor). Set `plan` in MongoDB until billing is wired. |
| `GET` | `/api/resumes` | Yes | List resumes |
| `GET` | `/api/resumes/:id` | Yes | One resume |
| `POST` | `/api/resumes` | Yes | Create — enforces max resumes by plan (`403` + `RESUME_LIMIT`). |
| `PATCH` | `/api/resumes/:id` | Yes | Update |
| `DELETE` | `/api/resumes/:id` | Yes | Delete |
| `POST` | `/api/ai/suggest` | Yes | `{ section, context }` → `{ suggestion }` — enforces monthly AI quota by plan (`403` + `AI_LIMIT`). |

**Plans (field `users.plan`):** `free` — 10 resumes, 15 AI/month, watermarked PDF; `pro` — 40 resumes, 50 AI/month, no watermark; `team` — unlimited resumes & AI, shared library flag in `features`.

## How to explain the backend (demos / interviews)

- **“Why layers?”**  
  Routes define URLs and validation; controllers handle HTTP; services hold rules and external calls (Gemini); models define data. That keeps each file small and testable.

- **“What is the ~30% code idea?”**  
  The **full architecture** is visible in folders and filenames; the **core product path** is implemented (auth + resumes + AI). Placeholder files show where rate limits, jobs, and extra validators would live without bloating the demo.

- **“How do you protect data?”**  
  Bcrypt for passwords, JWT for API access, every resume query scoped by **`userId`** from the token.

## Troubleshooting

- **`Missing required env: MONGODB_URI`** — Set `.env` from `.env.example`.
- **Mongo errors** — DB running or Atlas URI/firewall correct.
- **AI 503** — Set `GEMINI_API_KEY` and restart.

---

## Backend function reference

**29** named functions across `src/`. Paths below are relative to the [`backend/`](.) folder (e.g. [`src/server.js`](src/server.js)). **Routes** files only register middleware and handlers—they contain **no** standalone named functions.

### Entry & app

| Function | File | What it does |
|----------|------|----------------|
| [`main`](src/server.js) | [`server.js`](src/server.js) | Loads env via `dotenv`, connects MongoDB, calls `createApp()`, starts listening on `env.port`. Exits the process on failure. |
| [`createApp`](src/app.js) | [`app.js`](src/app.js) | Builds the Express app: Helmet, CORS, JSON body parser, `GET /health`, mounts [`apiRouter`](src/routes/index.js) at `/api`, then 404 + global error handler. |

### Config

| Function | File | What it does |
|----------|------|----------------|
| [`required`](src/config/index.js) | [`config/index.js`](src/config/index.js) | Throws if a required env var is missing or empty; used when building `env`. |
| [`connectDb`](src/config/db.js) | [`config/db.js`](src/config/db.js) | Sets Mongoose `strictQuery`, connects with `env.mongodbUri`. |

### Middleware

| Function | File | What it does |
|----------|------|----------------|
| [`notFoundHandler`](src/middleware/error.middleware.js) | [`error.middleware.js`](src/middleware/error.middleware.js) | Sends `404` JSON `{ error: "Not found" }` for unknown routes. |
| [`errorHandler`](src/middleware/error.middleware.js) | [`error.middleware.js`](src/middleware/error.middleware.js) | Reads `err.statusCode` / `status` or defaults to `500`; logs server errors; sends JSON `{ error: message }`. |
| [`requireAuth`](src/middleware/auth.middleware.js) | [`auth.middleware.js`](src/middleware/auth.middleware.js) | Reads `Authorization: Bearer`, verifies JWT with `env.jwtSecret`, loads [`User`](src/models/User.js) by `sub`, sets `req.user`, or responds `401`. |
| [`validate`](src/middleware/validate.middleware.js) | [`validate.middleware.js`](src/middleware/validate.middleware.js) | Runs `validationResult(req)` from express-validator; returns `400` with `errors` array if invalid; else `next()`. |

### Utils

| Function | File | What it does |
|----------|------|----------------|
| [`asyncHandler`](src/utils/asyncHandler.js) | [`asyncHandler.js`](src/utils/asyncHandler.js) | Wraps an async route handler so rejected promises call `next(err)` for the error middleware. |

### Controllers (HTTP adapters)

| Function | File | What it does |
|----------|------|----------------|
| [`register`](src/controllers/auth.controller.js) | [`auth.controller.js`](src/controllers/auth.controller.js) | Reads body → [`registerUser`](src/services/auth.service.js) → `201` + `{ user, token }`. |
| [`login`](src/controllers/auth.controller.js) | [`auth.controller.js`](src/controllers/auth.controller.js) | Reads body → [`loginUser`](src/services/auth.service.js) → `200` + `{ user, token }`. |
| [`me`](src/controllers/auth.controller.js) | [`auth.controller.js`](src/controllers/auth.controller.js) | Returns `{ user: req.user }` (set by `requireAuth`). |
| [`list`](src/controllers/resume.controller.js) | [`resume.controller.js`](src/controllers/resume.controller.js) | [`listResumes`](src/services/resume.service.js)(`req.user._id`) → `{ resumes }`. |
| [`getOne`](src/controllers/resume.controller.js) | [`resume.controller.js`](src/controllers/resume.controller.js) | [`getResume`](src/services/resume.service.js)(user, `req.params.id`) → `{ resume }`. |
| [`create`](src/controllers/resume.controller.js) | [`resume.controller.js`](src/controllers/resume.controller.js) | [`createResume`](src/services/resume.service.js)(user, body) → `201` + `{ resume }`. |
| [`update`](src/controllers/resume.controller.js) | [`resume.controller.js`](src/controllers/resume.controller.js) | [`updateResume`](src/services/resume.service.js)(user, id, body) → `{ resume }`. |
| [`remove`](src/controllers/resume.controller.js) | [`resume.controller.js`](src/controllers/resume.controller.js) | [`deleteResume`](src/services/resume.service.js) → `204` empty. |
| [`suggest`](src/controllers/ai.controller.js) | [`ai.controller.js`](src/controllers/ai.controller.js) | [`suggestResumeSection`](src/services/ai.service.js)(body) → `{ suggestion }`. |

### Services (business logic & external APIs)

| Function | File | What it does |
|----------|------|----------------|
| [`registerUser`](src/services/auth.service.js) | [`auth.service.js`](src/services/auth.service.js) | Rejects duplicate email (`409`), bcrypt-hashes password, creates [`User`](src/models/User.js), returns public user + JWT via [`signToken`](src/services/auth.service.js). |
| [`loginUser`](src/services/auth.service.js) | [`auth.service.js`](src/services/auth.service.js) | Finds user by email, compares password with bcrypt, or `401`; returns public user + JWT. |
| [`signToken`](src/services/auth.service.js) | [`auth.service.js`](src/services/auth.service.js) | `jwt.sign` with `subject` = user id + `env.jwtExpiresIn`. |
| [`toPublicUser`](src/services/auth.service.js) | [`auth.service.js`](src/services/auth.service.js) | Maps mongoose user to `{ id, email, name }`. |
| [`listResumes`](src/services/resume.service.js) | [`resume.service.js`](src/services/resume.service.js) | [`Resume`](src/models/Resume.js).find({ userId }) newest first, lean. |
| [`getResume`](src/services/resume.service.js) | [`resume.service.js`](src/services/resume.service.js) | Finds one resume by id + userId; `404` if missing. |
| [`createResume`](src/services/resume.service.js) | [`resume.service.js`](src/services/resume.service.js) | Creates resume with title + content (default `{}`). |
| [`updateResume`](src/services/resume.service.js) | [`resume.service.js`](src/services/resume.service.js) | Patches title/content on owned document; `404` if missing. |
| [`deleteResume`](src/services/resume.service.js) | [`resume.service.js`](src/services/resume.service.js) | `deleteOne` by id + userId; `404` if nothing deleted. |
| [`getModel`](src/services/ai.service.js) | [`ai.service.js`](src/services/ai.service.js) | Lazy Gemini model (`GoogleGenerativeAI` + `getGenerativeModel`); `503` if `GEMINI_API_KEY` unset. |
| [`suggestResumeSection`](src/services/ai.service.js) | [`ai.service.js`](src/services/ai.service.js) | `generateContent` with system instruction + section/context; returns trimmed suggestion text. |

### Models (`User.js`, `Resume.js`)

Schemas only—**no** named functions. See [`User.js`](src/models/User.js) and [`Resume.js`](src/models/Resume.js).
