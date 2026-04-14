import { writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Netlify runs builds with NETLIFY=true. Without VITE_API_URL the bundle calls /api on Netlify (404). */
function assertNetlifyApiUrl() {
  if (process.env.NETLIFY !== "true") return;
  if (String(process.env.VITE_API_URL || "").trim()) return;
  throw new Error(
    "Set VITE_API_URL in Netlify → Environment variables to your backend origin (e.g. https://your-api.onrender.com), no trailing slash. " +
      "Save, then Deploys → Trigger deploy → Clear cache and deploy site. " +
      "The name must be exactly VITE_API_URL (not a 'server-only' secret key — any env var works; Vite only reads names starting with VITE_)."
  );
}

/** Netlify: proxy /api/* → backend so plain /api paths in public/*.html work; also enables same-origin API if you prefer. */
function netlifyRedirectsPlugin() {
  let outDir = "dist";
  return {
    name: "netlify-api-redirects",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const raw = String(process.env.VITE_API_URL || "")
        .trim()
        .replace(/\/$/, "");
      if (!raw) return;
      const lines = [`/api/*  ${raw}/api/:splat  200`, `/*  /index.html  200`];
      writeFileSync(resolve(outDir, "_redirects"), `${lines.join("\n")}\n`, "utf8");
    },
  };
}

export default defineConfig(({ mode }) => {
  assertNetlifyApiUrl();
  return {
  plugins: [react(), netlifyRedirectsPlugin()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/health": "http://localhost:4000",
    },
  },
  build: {
    sourcemap: false,
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
};
});
