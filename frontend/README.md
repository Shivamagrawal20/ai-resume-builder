# Frontend — AI Resume Builder (React + Vite)

Single-page app that calls the **backend REST API** for authentication, resume CRUD, and AI suggestions.

## How it works

1. **`src/main.jsx`** — Mounts React on the page and loads `App.jsx` + styles.
2. **`src/api.js`** — Central place for HTTP calls:
   - Reads/writes the JWT in **`localStorage`** (`arb_token`).
   - Sends `Authorization: Bearer <token>` on requests that need auth.
   - Base URL: if **`VITE_API_URL`** is set, requests go to that origin; otherwise paths are **relative** (e.g. `/api/...`).
3. **`src/App.jsx`** — UI state and flows:
   - **Not logged in:** login / register forms.
   - **Logged in:** resume list, editor (title + **JSON** `content`), create/save/delete, and **AI suggest** (section name + context).
4. **`src/App.css`** — Layout and styling (dark theme).

**Session restore:** On load, if a token exists but user info is not yet loaded, the app shows a short “Loading…” state while `GET /api/auth/me` runs. After a successful login/register, the user object is set immediately so there is no extra flash.

## Development server and proxy

`vite.config.js` proxies **`/api`** and **`/health`** to **`http://localhost:4000`**.

So during **`npm run dev`** you:

- Run the **backend** on port 4000 (see `backend/README.md`).
- Run the **frontend** on port 5173 (default Vite).
- The browser calls **`/api/...`** on the same origin as Vite; Vite forwards those requests to the API.

You do **not** need `VITE_API_URL` for typical local dev.

## Production / hosted API

When you build static files (`npm run build`), there is no Vite proxy. You must either:

- Serve the SPA and API **under the same origin** (reverse proxy), or  
- Set **`VITE_API_URL`** at build time to your API’s full URL, e.g. `https://api.example.com` (no trailing slash).

Create a `.env` file in `frontend/` (see `.env.example`) and rebuild after changing it.

## Scripts

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # output to dist/
npm run preview  # serve dist/ locally to test production build
```

## How to explain the frontend (for demos / interviews)

- **“What stack?”**  
  React for UI, Vite for dev server and bundling, fetch API for HTTP (no extra client library).

- **“How does auth work?”**  
  After login/register, the JWT is stored in `localStorage` and attached to protected requests. Logout clears it.

- **“Why JSON for resume content?”**  
  The backend stores `content` as flexible JSON; the UI uses a textarea so you can demo any structure (sections, bullets, etc.) without a fixed form schema.

- **“How does AI work in the UI?”**  
  User enters a section label and context (text or JSON). The app calls `POST /api/ai/suggest`; the response is shown on the page. Saving that text into the resume is manual (copy into JSON or extend the UI later).

## Troubleshooting

- **API errors / network errors** — Ensure the backend is running on port 4000 and MongoDB is reachable.
- **CORS in dev** — Usually unnecessary because of the Vite proxy; if you call a full API URL from the browser, the backend must allow that origin.
- **401 after refresh** — Token invalid or expired; log in again.

---

## Frontend function reference

**15** named functions. Paths are relative to [`frontend/`](.) (e.g. [`src/App.jsx`](src/App.jsx)). [`App.css`](src/App.css) has **no** functions.

### [`src/api.js`](src/api.js)

| Function | What it does |
|----------|----------------|
| [`getToken`](src/api.js) | Reads JWT from `localStorage` key `arb_token`. |
| [`setToken`](src/api.js) | Saves or removes the JWT in `localStorage`. |
| [`url`](src/api.js) | If `VITE_API_URL` is set, prefixes API paths with that origin; otherwise returns the path (relative, for Vite proxy in dev). |
| [`request`](src/api.js) | `fetch` wrapper: JSON headers, attaches `Authorization` when a token exists, parses JSON (skips body on `204`), throws on non-OK with `err.message` from API. |

### [`src/App.jsx`](src/App.jsx)

| Function | What it does |
|----------|----------------|
| [`App`](src/App.jsx) | Root component: auth state, resume list/editor, AI panel; routes between login UI and main UI. |
| [`loadMe`](src/App.jsx) | `useCallback`: calls `api.me()`, sets `user`. |
| [`loadResumes`](src/App.jsx) | `useCallback`: calls `api.listResumes()`, sets `resumes`. |
| [`handleAuth`](src/App.jsx) | Form submit: register or login via `api`, stores token + user, refreshes resume list. |
| [`logout`](src/App.jsx) | Clears token, user, resumes, selection, AI output. |
| [`openResume`](src/App.jsx) | Fetches one resume by id, fills title/editor and AI context. |
| [`saveResume`](src/App.jsx) | Parses `contentJson`; if invalid JSON shows error; else create or PATCH resume. |
| [`newResume`](src/App.jsx) | Clears selection and resets title/content to a new draft. |
| [`removeResume`](src/App.jsx) | Confirms delete, calls `api.deleteResume`, reloads list, resets draft. |
| [`runAi`](src/App.jsx) | Tries `JSON.parse` on AI context; on failure uses raw string; calls `api.aiSuggest`, shows suggestion. |

### [`src/main.jsx`](src/main.jsx)

No named functions—only `ReactDOM.createRoot(...).render(...)` with [`App`](src/App.jsx) inside `StrictMode`.
