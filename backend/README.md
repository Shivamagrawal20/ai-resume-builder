# Backend — AI Resume Builder API

Node.js **Express** server with **MongoDB** (via **Mongoose**) and optional **OpenAI** for text suggestions.

## How it works

1. **`src/server.js`** — Single entry file: loads **`.env`**, connects to MongoDB, creates the Express app, defines all routes, and starts the HTTP server.
2. **`src/models.js`** — Defines two Mongoose models:
   - **User** — `email`, `passwordHash`, optional `name`
   - **Resume** — `title`, `content` (flexible JSON), `userId` (owner)
3. **Auth** — Passwords are hashed with **bcrypt**. Successful login/register returns a **JWT** signed with `JWT_SECRET`. Protected routes read `Authorization: Bearer <token>` and attach the user to the request.
4. **Resumes** — All resume routes require a valid JWT. Queries always filter by `userId` so one user cannot read or change another’s resumes.
5. **AI** — `POST /api/ai/suggest` sends a `section` name plus `context` to **OpenAI** (`gpt-4o-mini`) and returns `{ suggestion: "..." }`. If `OPENAI_API_KEY` is missing, the route fails with a clear error.

Security middleware: **Helmet** (HTTP headers), **CORS** (allows cross-origin requests; tighten in production if needed).

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (use a long random string) |
| `PORT` | No | Server port (default `4000`) |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default `7d`) |
| `OPENAI_API_KEY` | No | Required only for `/api/ai/suggest` |

## Scripts

```bash
npm install
npm run dev    # node --watch: restarts on file changes
npm start      # production-style run (no watch)
```

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Liveness check |
| `POST` | `/api/auth/register` | No | Create account, returns `{ user, token }` |
| `POST` | `/api/auth/login` | No | Login, returns `{ user, token }` |
| `GET` | `/api/auth/me` | Yes | Current user |
| `GET` | `/api/resumes` | Yes | List current user’s resumes |
| `GET` | `/api/resumes/:id` | Yes | Get one resume |
| `POST` | `/api/resumes` | Yes | Body: `{ title, content? }` |
| `PATCH` | `/api/resumes/:id` | Yes | Body: `{ title?, content? }` |
| `DELETE` | `/api/resumes/:id` | Yes | Delete resume |
| `POST` | `/api/ai/suggest` | Yes | Body: `{ section, context }` (context string or JSON) |

## How to explain the backend (for demos / interviews)

- **“Why two files?”**  
  `models.js` holds data shape; `server.js` holds routing and logic so the whole API is easy to read in one place.

- **“How do you protect user data?”**  
  Passwords are hashed; APIs that need identity require a JWT; resume queries always include `userId` from the token.

- **“Where does AI fit?”**  
  Only the `/api/ai/suggest` path calls OpenAI. The client sends section + context; the server returns plain suggestion text—no requirement to store AI output unless the client saves it via the resume endpoints.

- **“What would you add in production?”**  
  Rate limiting (especially on AI), input size limits, structured logging, centralized config validation, tests, and rotating secrets.

## Troubleshooting

- **`Missing env: MONGODB_URI`** — Create `.env` from `.env.example` and set variables.
- **Mongo connection errors** — Ensure MongoDB is running or the Atlas URI/network access is correct.
- **AI returns 503 / “Set OPENAI_API_KEY”** — Add `OPENAI_API_KEY` to `.env` and restart the server.
