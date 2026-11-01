import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: { proxy: Object.fromEntries(["/api", "/uploads", "/healthz", "/sitemap.xml", "/robots.txt"].map((path) => [path, "http://localhost:3000"])) },
});
