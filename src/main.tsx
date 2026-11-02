import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./fonts/fonts.css";
import "./index.css";
import App from "./App";
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
// Las páginas públicas llegan ya pintadas por el servidor (entry-server.tsx): se hidratan.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
