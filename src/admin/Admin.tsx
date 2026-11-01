import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCalendar,
  IconCheck,
  IconExternalLink,
  IconHome,
  IconLanguage,
  IconLayoutDashboard,
  IconLogout,
  IconPhoto,
  IconSettings,
  IconStar,
  IconRipple,
  IconWorldUpload,
} from "@tabler/icons-react";
import {
  asset,
  bookings,
  clone,
  DEFAULT,
  history,
  KEYS,
  load,
  migrate,
  readStored,
  save,
  writeStored,
} from "../store";
import type { SiteData, User } from "../store";
import { ServicesEditor } from "./ServicesEditor";
import { GalleryEditor } from "./GalleryEditor";
import { BookingsEditor } from "./BookingsEditor";
import {
  HomeEditor,
  LanguagesEditor,
  ReviewsEditor,
  SettingsEditor,
} from "./ContentEditors";
import { missingCount, photoBytes } from "./utils";
import { Panel } from "./shared";
import "./admin.css";
const NAV = [
  { id: "dash", label: "Resumen", icon: IconLayoutDashboard },
  { id: "gallery", label: "Galería", icon: IconPhoto },
  { id: "bookings", label: "Reservas", icon: IconCalendar },
  { id: "services", label: "Servicios", icon: IconRipple },
  { id: "reviews", label: "Reseñas", icon: IconStar },
  { id: "home", label: "Textos del inicio", icon: IconHome },
  { id: "langs", label: "Idiomas", icon: IconLanguage },
  { id: "settings", label: "Ajustes", icon: IconSettings },
];
function diff(d: SiteData, l: SiteData) {
  const count = (a: { id: string }[], b: { id: string }[]) =>
    new Set([...a, ...b].map((v) => v.id)).size -
    [...new Set([...a, ...b].map((v) => v.id))].filter(
      (id) =>
        JSON.stringify(a.find((v) => v.id === id)) ===
        JSON.stringify(b.find((v) => v.id === id)),
    ).length;
  const services = count(d.services, l.services),
    gallery = count(d.gallery, l.gallery),
    other =
      ["home", "settings", "albums", "reviews"].filter(
        (k) =>
          JSON.stringify(d[k as keyof SiteData]) !==
          JSON.stringify(l[k as keyof SiteData]),
      ).length +
      Number(
        d.services.map((s) => s.id).join() !==
          l.services.map((s) => s.id).join(),
      ) +
      Number(
        d.gallery.map((g) => g.id).join() !== l.gallery.map((g) => g.id).join(),
      );
  return { services, gallery, other, total: services + gallery + other };
}
export default function Admin() {
  const [auth, setAuth] = useState<Omit<User, "pass"> | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("evo-auth3") || "null");
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(""),
    [pass, setPass] = useState(""),
    [loginError, setLoginError] = useState(false);
  const [data, setData] = useState<SiteData>(() => {
      try {
        return migrate(readStored(KEYS.draft, load()));
      } catch {
        return clone(DEFAULT);
      }
    }),
    [live, setLive] = useState(() => clone(load()));
  const [view, setView] = useState(() =>
      readStored<string>(
        "evo-admin3-view",
        localStorage.getItem("evo-admin3-view") || "dash",
      ),
    ),
    [notice, setNotice] = useState(""),
    [revision, setRevision] = useState(0),
    [mobileMenu, setMobileMenu] = useState(false);
  const [canUndo, setCanUndo] = useState(false),
    [canRedo, setCanRedo] = useState(false);
  const undo = useRef<SiteData[]>([]),
    redo = useRef<SiteData[]>([]),
    noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((s: string) => {
    setNotice(s);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 6500);
  }, []);
  useEffect(() => {
    document.documentElement.lang = "es";
    const listener = () => setRevision((v) => v + 1);
    window.addEventListener("storage", listener);
    window.addEventListener("evo-storage", listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("evo-storage", listener);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);
  function persist(next: SiteData) {
    try {
      writeStored(KEYS.draft, next);
      return true;
    } catch {
      notify(
        "Sin espacio en el navegador. Optimiza o elimina fotos. El cambio no se guardó.",
      );
      return false;
    }
  }
  function update(fn: (d: SiteData) => void) {
    const next = clone(data);
    fn(next);
    if (!persist(next)) return;
    undo.current = [...undo.current.slice(-39), clone(data)];
    redo.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setData(next);
  }
  function travel(back: boolean) {
    const from = back ? undo.current : redo.current,
      to = back ? redo.current : undo.current;
    if (!from.length) return;
    const next = from[from.length - 1];
    if (!persist(next)) return;
    from.pop();
    to.push(clone(data));
    setCanUndo(undo.current.length > 0);
    setCanRedo(redo.current.length > 0);
    setData(next);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName))
        return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        travel(!e.shiftKey);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  function go(v: string) {
    setView(v);
    try {
      localStorage.setItem("evo-admin3-view", v);
    } catch {
      /* La navegación sigue disponible sin almacenamiento. */
    }
    setMobileMenu(false);
    window.scrollTo(0, 0);
  }
  const changes = diff(data, live),
    isAdmin = auth?.role === "admin",
    canPublish = auth?.role !== "fotografo",
    isPhoto = auth?.role === "fotografo",
    activeView =
      (isPhoto && !["gallery", "dash"].includes(view)) ||
      (view === "settings" && !isAdmin)
        ? "gallery"
        : NAV.some((v) => v.id === view)
          ? view
          : "dash";
  const allBookings = bookings(),
    entries = history();
  void revision;
  function publish() {
    try {
      save(data);
      setLive(clone(data));
      const h = [
        {
          at: new Date().toISOString(),
          by: auth?.name || "Equipo",
          summary: {
            services: changes.services,
            gallery: changes.gallery,
            other: changes.other,
          },
          snap: {
            services: data.services,
            home: data.home,
            settings: data.settings,
            albums: data.albums,
            reviews: data.reviews,
          },
        },
        ...history(),
      ].slice(0, 8);
      try {
        writeStored(KEYS.history, h);
      } catch {
        try {
          writeStored(KEYS.history, h.slice(0, 2));
        } catch {
          notify("Publicado. No hay espacio para guardar el historial.");
          return;
        }
      }
      notify("Publicado en el sitio.");
    } catch {
      notify("No se pudo publicar: sin espacio en el navegador.");
    }
  }
  const shared = { data, update, notify };
  return (
    <div className="admin">
      <title>Panel del equipo | Evolushon</title>
      <meta name="robots" content="noindex,nofollow" />
      {!auth ? (
        <div className="admin-login">
          <div className="login-image">
            <img src={asset("src/assets/galeria-sesion-20.jpg")} alt="" />
            <div className="display">
              Evolushon
              <br />
              <span className="serif">panel del equipo</span>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const u = data.settings.users.find(
                (u) => u.user === user.trim() && u.pass === pass,
              );
              if (!u) {
                setLoginError(true);
                return;
              }
              const a = { name: u.name, user: u.user, role: u.role };
              sessionStorage.setItem("evo-auth3", JSON.stringify(a));
              setAuth(a);
              setPass("");
              if (u.role === "fotografo") go("gallery");
            }}
          >
            <img src={asset("src/assets/logo.jpg")} alt="Evolushon" />
            <h1>Iniciar sesión</h1>
            <label className="field">
              Usuario
              <input
                value={user}
                autoComplete="username"
                onChange={(e) => {
                  setUser(e.target.value);
                  setLoginError(false);
                }}
              />
            </label>
            <label className="field">
              Contraseña
              <input
                type="password"
                value={pass}
                autoComplete="current-password"
                onChange={(e) => {
                  setPass(e.target.value);
                  setLoginError(false);
                }}
              />
            </label>
            {loginError && (
              <p className="error" role="alert">
                Usuario o contraseña incorrectos.
              </p>
            )}
            <button className="admin-btn primary" type="submit">
              Entrar
            </button>
            <p className="muted">
              Demo · admin / evolushon · editor / editor · foto / foto
            </p>
          </form>
        </div>
      ) : (
        <div className="admin-shell">
          <aside className={"admin-sidebar " + (mobileMenu ? "open" : "")}>
            <div className="brand">
              <img src={asset("src/assets/logo.jpg")} alt="" />
              <div>
                Evolushon<small>Panel del equipo</small>
              </div>
            </div>
            <nav>
              {NAV.filter(
                (n) =>
                  (!isPhoto || n.id === "gallery" || n.id === "dash") &&
                  (isAdmin || n.id !== "settings"),
              ).map((n) => (
                <button
                  className={activeView === n.id ? "active" : ""}
                  key={n.id}
                  onClick={() => go(n.id)}
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                  {n.id === "bookings" &&
                    allBookings.filter((b) => b.status === "por verificar")
                      .length > 0 && (
                      <b>
                        {
                          allBookings.filter(
                            (b) => b.status === "por verificar",
                          ).length
                        }
                      </b>
                    )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <Link to="/es/">
                <IconExternalLink size={18} />
                Ver sitio publicado
              </Link>
              <div>
                <span className="avatar">{auth.name[0]}</span>
                <p>
                  <b>{auth.name}</b>
                  <small>
                    {auth.role === "admin"
                      ? "Administrador"
                      : auth.role === "editor"
                        ? "Editor"
                        : "Fotógrafo"}
                  </small>
                </p>
                <button
                  aria-label="Cerrar sesión"
                  onClick={() => {
                    sessionStorage.removeItem("evo-auth3");
                    setAuth(null);
                  }}
                >
                  <IconLogout size={20} />
                </button>
              </div>
            </div>
          </aside>
          <main className="admin-main">
            <header className="admin-toolbar">
              <button
                className="admin-menu-btn"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-expanded={mobileMenu}
              >
                Menú
              </button>
              <h1>{NAV.find((n) => n.id === activeView)?.label}</h1>
              <div className="flex gap-1">
                <button
                  className="round"
                  disabled={!canUndo}
                  onClick={() => travel(true)}
                  aria-label="Deshacer"
                >
                  <IconArrowBackUp size={18} />
                </button>
                <button
                  className="round"
                  disabled={!canRedo}
                  onClick={() => travel(false)}
                  aria-label="Rehacer"
                >
                  <IconArrowForwardUp size={18} />
                </button>
              </div>
              {changes.total > 0 ? (
                <div className="publish-actions">
                  <span className="change-badge">
                    {changes.total} cambios sin publicar
                  </span>
                  {canPublish && (
                    <>
                      <button
                        className="admin-btn"
                        onClick={() => {
                          if (
                            confirm(
                              "¿Descartar todos los cambios sin publicar?",
                            )
                          ) {
                            update((d) => Object.assign(d, clone(live)));
                            notify("Cambios descartados.");
                          }
                        }}
                      >
                        Descartar
                      </button>
                      <button className="admin-btn gold" onClick={publish}>
                        <IconWorldUpload size={17} />
                        Publicar
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <span className="published">
                  <IconCheck size={16} />
                  Todo publicado
                </span>
              )}
            </header>
            {activeView === "dash" && (
              <div className="admin-content">
                <div className="admin-greeting">
                  <p className="serif">Hola, {auth.name}.</p>
                  <small className="muted">
                    {entries[0]
                      ? "Última publicación: " +
                        new Date(entries[0].at).toLocaleString("es-PE")
                      : "Aún no hay publicaciones"}
                  </small>
                </div>
                <div className="admin-stats">
                  {[
                    {
                      label: "Servicios",
                      value: data.services.length,
                      sub:
                        data.services.filter((s) => s.active).length +
                        " visibles",
                      view: "services",
                    },
                    {
                      label: "Fotos",
                      value: data.gallery.length,
                      sub:
                        data.gallery.filter((g) => g.featured && !g.hidden)
                          .length + " destacadas",
                      view: "gallery",
                    },
                    {
                      label: "Sin texto alt",
                      value: data.gallery.filter((g) => !g.alt.es).length,
                      sub: "importante para SEO",
                      view: "gallery",
                    },
                    {
                      label: "Fotos pesadas",
                      value: data.gallery.filter(
                        (g) => photoBytes(g) > 350 * 1024,
                      ).length,
                      sub: "más de 350 KB",
                      view: "gallery",
                    },
                    {
                      label: "Idiomas pendientes",
                      value: missingCount(data),
                      sub: "EN · FR · DE",
                      view: "langs",
                    },
                    {
                      label: "Sin publicar",
                      value: changes.total,
                      sub: changes.total ? "revisa y publica" : "todo al día",
                      view: "services",
                    },
                  ]
                    .filter(
                      (s) =>
                        !isPhoto ||
                        ["Fotos", "Sin texto alt", "Fotos pesadas"].includes(
                          s.label,
                        ),
                    )
                    .map((s) => (
                      <button key={s.label} onClick={() => go(s.view)}>
                        <small>{s.label}</small>
                        <strong>{s.value}</strong>
                        <span>{s.sub}</span>
                      </button>
                    ))}
                </div>
                <div className="actions">
                  <button className="admin-btn" onClick={() => go("gallery")}>
                    Subir fotos
                  </button>
                  <button className="admin-btn" onClick={() => go("services")}>
                    Editar servicios
                  </button>
                  <Link className="admin-btn" to="/es/">
                    Ver sitio <IconExternalLink size={16} />
                  </Link>
                </div>
                <div className="admin-columns">
                  <Panel title="Pendiente de idioma">
                    {data.services
                      .filter((s) =>
                        ["en", "fr", "de"].some(
                          (l) => !s.name[l as "en"] || !s.desc[l as "en"],
                        ),
                      )
                      .slice(0, 4)
                      .map((s) => (
                        <div className="admin-row" key={s.id}>
                          <span>{s.name.es}</span>
                          <small>
                            {["en", "fr", "de"]
                              .filter(
                                (l) => !s.name[l as "en"] || !s.desc[l as "en"],
                              )
                              .join(" · ")
                              .toUpperCase()}
                          </small>
                        </div>
                      ))}
                    <button className="admin-btn" onClick={() => go("langs")}>
                      Ver todo
                    </button>
                  </Panel>
                  <Panel title="Últimas publicaciones">
                    {!entries.length && (
                      <p className="muted">Aún no hay publicaciones.</p>
                    )}
                    {entries.map((h, i) => (
                      <div className="history-row" key={h.at}>
                        <IconWorldUpload size={18} />
                        <div>
                          <b>
                            {new Date(h.at).toLocaleString("es-PE")} · {h.by}
                          </b>
                          <small>
                            {h.summary.services} servicios · {h.summary.gallery}{" "}
                            fotos · {h.summary.other} otros
                          </small>
                        </div>
                        {canPublish && (
                          <button
                            className="admin-btn"
                            onClick={() => {
                              if (
                                confirm(
                                  "¿Restaurar servicios, textos, reseñas y ajustes de esta versión al borrador? Las fotos actuales se conservan.",
                                )
                              ) {
                                update((d) => {
                                  const users = d.settings.users;
                                  Object.assign(d, clone(h.snap));
                                  d.settings.users = users;
                                });
                                notify(
                                  "Versión " +
                                    (i + 1) +
                                    " restaurada al borrador.",
                                );
                              }
                            }}
                          >
                            Restaurar
                          </button>
                        )}
                      </div>
                    ))}
                    <small className="muted">
                      El historial guarda hasta 8 publicaciones. Las imágenes no
                      se duplican en las versiones.
                    </small>
                  </Panel>
                </div>
              </div>
            )}
            {activeView === "services" && <ServicesEditor {...shared} />}
            {activeView === "gallery" && (
              <GalleryEditor {...shared} canDelete={!isPhoto} />
            )}
            {activeView === "bookings" && (
              <BookingsEditor {...shared} canConfigure={canPublish} />
            )}
            {activeView === "reviews" && <ReviewsEditor {...shared} />}
            {activeView === "home" && <HomeEditor {...shared} />}
            {activeView === "langs" && <LanguagesEditor {...shared} />}
            {activeView === "settings" && isAdmin && (
              <SettingsEditor {...shared} />
            )}
          </main>
          <nav className="admin-bottom-nav" aria-label="Panel del equipo">
            {NAV.filter(
              (n) =>
                (!isPhoto || n.id === "gallery" || n.id === "dash") &&
                (isAdmin || n.id !== "settings"),
            ).map((n) => (
              <button
                key={n.id}
                className={activeView === n.id ? "active" : ""}
                onClick={() => go(n.id)}
              >
                <n.icon size={21} />
                <span>
                  {n.id === "home"
                    ? "Textos"
                    : n.id === "dash"
                      ? "Inicio"
                      : n.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}
      {notice && (
        <div className="admin-toast" role="status">
          <span>{notice}</span>
          <button aria-label="Cerrar aviso" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
