import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const PROJECT_ROOT = import.meta.dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: path.resolve(PROJECT_ROOT, "client", "game"),
  publicDir: path.resolve(PROJECT_ROOT, "client", "game-public"),
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
    },
  },
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist", "selectah-showdown"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: { host: true },
});
