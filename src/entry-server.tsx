// Render en el servidor de las páginas públicas. Lo compila `vite build --ssr` a
// server-dist/ssr/entry-server.js y lo usa server/routes/static.ts. El navegador
// hidrata este HTML (main.tsx), así que los datos deben ser los mismos que
// recibe el cliente en #evo-data.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { migrate } from "../shared/index";
import { primeSiteData } from "./store/remote";

export function render(url: string, publicData: unknown): string {
  // Mismo camino que el cliente: JSON → migrate().
  primeSiteData(migrate(JSON.parse(JSON.stringify(publicData))));
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
