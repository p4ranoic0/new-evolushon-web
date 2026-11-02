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
import { asset, clone, preference, setPreference } from "../store";
import { api, onUnauthorized } from "../store/api";
import { ContentActions, useAdminContent } from "../store/admin-remote";
import { useBookings } from "../store/bookings";
import { Modal } from "../components/Modal";
import { useHead } from "../components/useHead";
import { diff } from "../../shared/diff";
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
export default function Admin() {
  useHead({ title: "Panel del equipo | Evolushon", robots: "noindex,nofollow" });
  const [auth, setAuth] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(""), [pass, setPass] = useState(""), [loginError,setLoginError]=useState("");
  const [view,setView]=useState(()=>preference("evo-admin-view","dash")), [notice,setNotice]=useState(""), [mobileMenu,setMobileMenu]=useState(false);
  const [undoGeneration,setUndoGeneration]=useState(0);
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
  const remote = useAdminContent(auth, notify);
  const {data,live,entries,persist,saveState}=remote;
  const {items:allBookings}=useBookings(!!auth && auth.role!=="fotografo");
  useEffect(()=>{
    onUnauthorized(()=>{setAuth(null);});
    api.get<User>("/auth/me").then(setAuth).catch(()=>setAuth(null)).finally(()=>setChecking(false));
    return ()=>{onUnauthorized();if(noticeTimer.current)clearTimeout(noticeTimer.current);};
  },[]);
  useEffect(()=>{undo.current=[];redo.current=[];},[remote.generation]);
  function update(fn: (d: SiteData) => void) {
    const previous = clone(remote.current());
    const next = clone(previous);
    fn(next);
    if (!persist(next)) return;
    setUndoGeneration(remote.generation);
    undo.current = [...undo.current.slice(-39), previous];
    redo.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }
  function travel(back: boolean) {
    const from = back ? undo.current : redo.current,
      to = back ? redo.current : undo.current;
    if (!from.length) return;
    const previous=clone(remote.current());
    const next = from[from.length - 1];
    if (!persist(next)) return;
    from.pop();
    to.push(previous);
    setUndoGeneration(remote.generation);
    setCanUndo(undo.current.length > 0);
    setCanRedo(redo.current.length > 0);
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
    setPreference("evo-admin-view", v);
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
  async function publish() { try { await remote.publish(); } catch { /* El hook muestra el error. */ } }
  const shared = { data, update, notify };
  if(checking || (auth && !remote.loaded && !remote.loadError)) return <main className="loading">Evolushon · Cargando panel…</main>;
  if(auth && remote.loadError) return <main className="loading"><p role="alert">{remote.loadError}</p><button onClick={()=>void remote.reload()}>Reintentar</button></main>;
  return (
    <ContentActions.Provider value={{importData:remote.importData,restore:remote.restore}}>
    <div className="admin">
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
              void api.post<User>("/auth/login",{user:user.trim(),pass}).then((u)=>{setAuth(u);setPass("");setLoginError("");if(u.role==="fotografo")go("gallery");}).catch((error)=>setLoginError(error.message));
            }}
          >
            <img src={asset("src/assets/logo.jpg")} alt="Evolushon" />
            <h1>Iniciar sesión</h1>
            <label className="field">
              Usuario o correo
              <input
                value={user}
                autoComplete="username"
                onChange={(e) => {
                  setUser(e.target.value);
                  setLoginError("");
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
                  setLoginError("");
                }}
              />
            </label>
            {loginError && (
              <p className="error" role="alert">
                {loginError}
              </p>
            )}
            <button className="admin-btn primary" type="submit">
              Entrar
            </button>
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
                    void remote.prepareLogout().then(()=>api.post("/auth/logout")).then(()=>setAuth(null)).catch((error)=>{notify(error.message);remote.resumeSession();});
                  }}
                >
                  <IconLogout size={20} />
                </button>
              </div>
            </div>
          </aside>
          <main className="admin-main" aria-busy={remote.busy}>
            <fieldset disabled={remote.busy} className="admin-editor-fields">
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
                  disabled={!canUndo || undoGeneration!==remote.generation}
                  onClick={() => travel(true)}
                  aria-label="Deshacer"
                >
                  <IconArrowBackUp size={18} />
                </button>
                <button
                  className="round"
                  disabled={!canRedo || undoGeneration!==remote.generation}
                  onClick={() => travel(false)}
                  aria-label="Rehacer"
                >
                  <IconArrowForwardUp size={18} />
                </button>
              </div>
              <span aria-live="polite">{saveState === "saving" ? "Guardando…" : saveState === "error" ? "Sin guardar — reintentar" : "Borrador guardado"}</span>
              {saveState === "error" && <button className="admin-btn" onClick={()=>void remote.retry().catch(()=>{})}>Reintentar</button>}
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
                            void remote.discard().catch(()=>{});
                          }
                        }}
                      >
                        Descartar
                      </button>
                      <button className="admin-btn gold" onClick={()=>void publish()} disabled={saveState!=="saved"}>
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
                    {entries.map((h) => (
                      <div className="history-row" key={h.at}>
                        <IconWorldUpload size={18} />
                        <div>
                          <b>
                            {new Date(h.at).toLocaleString("es-PE")} · {h.by}
                          </b>
                          <small>
                            {h.summary?.services ?? 0} servicios · {h.summary?.gallery ?? 0}{" "}
                            fotos · {h.summary?.other ?? 0} otros
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
                                if(h.id)void remote.restore(h.id).catch(()=>{});
                              }
                            }}
                          >
                            Restaurar
                          </button>
                        )}
                      </div>
                    ))}
                    <small className="muted">
                      El historial guarda hasta 20 publicaciones. Las imágenes no
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
            </fieldset>
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
      {remote.conflict && <Modal label="Otro usuario modificó el borrador" onClose={()=>{}} className="admin-dialog"><section className="admin-panel"><h2 id="draft-conflict">Otro usuario modificó el borrador</h2><p>Elige qué versión conservar. Sobrescribir reemplaza los cambios del otro usuario por tu borrador.</p><button className="admin-btn" onClick={()=>void remote.resolveConflict(false)}>Cargar el suyo</button><button className="admin-btn danger" onClick={()=>void remote.resolveConflict(true).catch(()=>{})}>Sobrescribir</button></section></Modal>}
      {remote.recovery && <Modal label="Recuperar borrador local" onClose={remote.dismissRecovery} className="admin-dialog"><section className="admin-panel"><h2 id="draft-recovery">Recuperar borrador local</h2><p>Hay una copia local más reciente que el borrador del servidor.</p><button className="admin-btn" onClick={remote.recover}>Recuperar</button><button className="admin-btn" onClick={remote.dismissRecovery}>Conservar servidor</button></section></Modal>}
    </div>
    </ContentActions.Provider>
  );
}
