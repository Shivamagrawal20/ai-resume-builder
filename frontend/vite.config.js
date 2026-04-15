import { writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Netlify: optional /api/* proxy when VITE_API_URL is set at build time; always add SPA fallback for React Router.
 * Add VITE_API_URL in Netlify (Site → Environment variables) = your API origin, e.g. https://api.example.com — no trailing slash.
 */
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
      const lines = [];
      if (raw) {
        lines.push(`/api/*  ${raw}/api/:splat  200`);
      }
      lines.push("/*  /index.html  200");
      writeFileSync(resolve(outDir, "_redirects"), `${lines.join("\n")}\n`, "utf8");
    },
  };
}

export default defineConfig(({ mode }) => {
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
