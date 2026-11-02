import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Recursos que el HTML no declara (los pide el bundle) pero que se ven al cargar:
// se precargan para no esperar a que baje y corra el JavaScript.
const PRELOADS: { file: string; as: "font" | "image"; media?: string }[] = [
  { file: "figtree-normal-latin.woff2", as: "font" },
  // Frase del hero (elemento LCP en celular). Bricolage (131 KB) no se precarga:
  // en redes lentas le quita ancho de banda al JavaScript.
  { file: "instrument-serif-italic-latin.woff2", as: "font" },
];
// La foto del hero móvil (115 KB) NO se precarga: el LCP en celular es la frase
// del hero (texto que pinta el JS) y la precarga le quitaba ancho de banda al JS.

function preloadCritical(): Plugin {
  return {
    name: "evo-preload-critical",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const assets = Object.values(ctx.bundle ?? {}).filter((item) => item.type === "asset");
        return PRELOADS.flatMap(({ file, as, media }) => {
          const hit = assets.find((item) => item.originalFileNames?.some((name) => name.endsWith("/" + file)));
          if (!hit) throw new Error(`preload: no se encontró ${file} en el bundle`);
          const attrs: Record<string, string | boolean> = { rel: "preload", href: "/" + hit.fileName, as };
          if (as === "font") Object.assign(attrs, { type: "font/woff2", crossorigin: true });
          else Object.assign(attrs, { fetchpriority: "high", ...(media ? { media } : {}) });
          return [{ tag: "link", attrs, injectTo: "head" as const }];
        });
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadCritical()],
  base: "/",
  server: { proxy: Object.fromEntries(["/api", "/uploads", "/healthz", "/sitemap.xml", "/robots.txt"].map((path) => [path, "http://localhost:3000"])) },
});
