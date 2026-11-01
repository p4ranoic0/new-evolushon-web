import { lazy, Suspense } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { PUBLIC_UI, LANGS, pathFor, slugs, useSiteData } from "./store";
import type { Lang, Page } from "./store";
import { PublicSite } from "./components/PublicSite";
import { useHead } from "./components/useHead";
const Admin = lazy(() => import("./admin/Admin"));
function LocalizedSite() {
  const { lang, section, slug } = useParams();
  const d = useSiteData();
  const location = useLocation();
  if (!LANGS.includes(lang as Lang)) return <NotFound />;
  const l = lang as Lang;
  const page: Page | undefined = !section
    ? "home"
    : (Object.keys(slugs) as Exclude<Page, "home">[]).find(
        (p) => slugs[p][l] === section,
      );
  const service =
    slug && page === "services"
      ? d.services.find((s) => s.active && (s.seo.slug || s.id) === slug)
      : undefined;
  if (!page || (slug && !service)) return <NotFound />;
  return (
    <PublicSite
      key={location.pathname + location.search}
      data={d}
      lang={l}
      page={page}
      service={service}
    />
  );
}
function NotFound() {
  const { lang } = useParams();
  const l: Lang = LANGS.includes(lang as Lang) ? (lang as Lang) : "es";
  useHead({ title: "404 | Evolushon", lang: l, robots: "noindex" });
  return (
    <main className="not-found">
      <span className="serif">Evolushon Surf Experience</span>
      <h1>404</h1>
      <p>{PUBLIC_UI.notFound[l]}</p>
      <Link className="btn gold" to={pathFor("es")}>
        {PUBLIC_UI.backHome[l]}
      </Link>
    </main>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/es/" replace />} />
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <main className="loading">Evolushon · Cargando panel…</main>
            }
          >
            <Admin />
          </Suspense>
        }
      />
      {[
        ["/clases/surf", "/es/servicios?category=surf"],
        ["/clases/surfskate", "/es/servicios?category=surfskate"],
        ["/surftrips", "/es/servicios?category=trip"],
        ["/galeria", "/es/galeria"],
        ["/contacto", "/es/contacto"],
      ].map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      <Route path="/:lang/" element={<LocalizedSite />} />
      <Route path="/:lang/:section" element={<LocalizedSite />} />
      <Route path="/:lang/:section/:slug" element={<LocalizedSite />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
