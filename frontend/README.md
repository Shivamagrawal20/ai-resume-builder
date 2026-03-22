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
