import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub Pages serves from a subpath (/betterbodies-web/); Netlify and the
// custom domain serve from root (/). The Pages workflow sets DEPLOY_TARGET=pages;
// every other build (Netlify, local) defaults to root.
const base = process.env.DEPLOY_TARGET === "pages" ? "/betterbodies-web/" : "/";

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
