import { kb } from "./utils";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  blank,
  clone,
  DEFAULT,
  download,
  isoDate,
  history,
  LANGS,
  migrate,
  UI,
} from "../store";
import type { Lang, Page, SiteData } from "../store";
import { SEO_DEFAULTS } from "../store/seo-defaults";
import {
  Check,
  Field,
  LangTabs,
  Panel,
  TextField,
  TranslateButton,
} from "./shared";
import type { Update } from "./shared";
type Props = { data: SiteData; update: Update; notify: (s: string) => void };
const HOMEKEYS = [
  ["kicker", "Antetítulo del hero"],
  ["heroTitle", "Título del hero"],
  ["heroSub", "Subtítulo del hero"],
  ["introTitle", "Título de presentación"],
  ["intro", "Texto de presentación"],
  ["servicesSub", "Bajada de servicios"],
  ["contactTitle", "Título de reserva"],
  ["contactSub", "Texto de reserva"],
  ["tag", "Lema"],
] as const;
export function HomeEditor({ data, update, notify }: Props) {
  const [lang, setLang] = useState<Lang>("es");
  return (
    <div className="admin-content">
      <div className="admin-heading">
        <p className="muted">
          Personaliza los textos del sitio. Un campo vacío usa el texto original
          del diseño.
        </p>
        <TranslateButton notify={notify} />
      </div>
      <LangTabs lang={lang} setLang={setLang} />
      <Panel title="Textos del inicio">
        {HOMEKEYS.map(([k, label]) => (
          <TextField
            key={k}
            label={label + " · " + lang.toUpperCase()}
            value={data.home[k]?.[lang] || ""}
            placeholder={UI[lang][k]}
            rows={k === "intro" ? 5 : 2}
            onChange={(v) =>
              update((d) => {
                d.home[k] ||= blank();
                d.home[k][lang] = v;
              })
            }
          />
        ))}
      </Panel>
      <Panel title="Vista previa">
        <small className="eyebrow">
          {data.home.kicker?.[lang] || UI[lang].kicker}
        </small>
        <p className="serif home-text-preview">
          {data.home.heroTitle?.[lang] || UI[lang].heroTitle}
        </p>
        <h2>{data.home.introTitle?.[lang] || UI[lang].introTitle}</h2>
        <p>{data.home.intro?.[lang] || UI[lang].intro}</p>
      </Panel>
    </div>
  );
}
export function ReviewsEditor({ data, update, notify }: Props) {
  const [lang, setLang] = useState<Lang>("es");
  const settings = data.settings.reviews;
  return (
    <div className="admin-content">
      <Panel title="Reseñas de Google">
        <p className="muted">
          Carga manual. Los ejemplos del prototipo están identificados como
          ejemplo en el sitio.
        </p>
        <div className="form-grid">
          <Field
            label="URL de Google Maps"
            value={settings.placeUrl}
            type="url"
            onChange={(v) =>
              update((d) => {
                d.settings.reviews.placeUrl = v;
              })
            }
          />
          <Field
            label="URL para escribir una reseña"
            value={settings.writeUrl}
            type="url"
            onChange={(v) =>
              update((d) => {
                d.settings.reviews.writeUrl = v;
              })
            }
          />
          <Field
            label="Puntuación global (opcional)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={settings.rating ?? ""}
            onChange={(v) =>
              update((d) => {
                d.settings.reviews.rating =
                  v === "" ? null : Math.max(0, Math.min(5, Number(v)));
              })
            }
          />
          <Field
            label="Cantidad de reseñas (opcional)"
            type="number"
            min="0"
            value={settings.count ?? ""}
            onChange={(v) =>
              update((d) => {
                d.settings.reviews.count =
                  v === "" ? null : Math.max(0, Number(v));
              })
            }
          />
        </div>
      </Panel>
      <div className="admin-heading">
        <LangTabs lang={lang} setLang={setLang} />
        <div className="actions">
          {data.reviews.some((r) => r.sample) && (
            <button
              className="admin-btn"
              onClick={() => {
                if (confirm("¿Quitar las reseñas de ejemplo?"))
                  update((d) => {
                    d.reviews = d.reviews.filter((r) => !r.sample);
                  });
              }}
            >
              Quitar ejemplos
            </button>
          )}
          <button
            className="admin-btn primary"
            onClick={() =>
              update((d) =>
                d.reviews.unshift({
                  id: "r-" + crypto.randomUUID(),
                  author: "",
                  rating: 5,
                  date: isoDate().slice(0, 7),
                  sample: false,
                  hidden: false,
                  text: blank(),
                }),
              )
            }
          >
            <IconPlus size={17} />
            Nueva reseña
          </button>
        </div>
      </div>
      {data.reviews.map((r) => (
        <Panel key={r.id} title={r.author || "Nueva reseña"}>
          <div className="form-grid">
            <Field
              label="Autor"
              value={r.author}
              onChange={(v) =>
                update((d) => {
                  const x = d.reviews.find((x) => x.id === r.id)!;
                  x.author = v;
                  x.sample = false;
                })
              }
            />
            <Field
              label="Puntuación"
              type="number"
              min="1"
              max="5"
              value={r.rating}
              onChange={(v) =>
                update((d) => {
                  d.reviews.find((x) => x.id === r.id)!.rating = Math.max(
                    1,
                    Math.min(5, Number(v)),
                  );
                })
              }
            />
            <Field
              label="Fecha"
              type="month"
              value={r.date.slice(0, 7)}
              onChange={(v) =>
                update((d) => {
                  d.reviews.find((x) => x.id === r.id)!.date = v;
                })
              }
            />
            <Check
              label="Oculta en el sitio"
              checked={r.hidden}
              onChange={(v) =>
                update((d) => {
                  d.reviews.find((x) => x.id === r.id)!.hidden = v;
                })
              }
            />
          </div>
          {r.sample && <span className="badge">Ejemplo</span>}
          <TextField
            label={"Reseña · " + lang.toUpperCase()}
            value={r.text[lang]}
            placeholder={r.text.es}
            onChange={(v) =>
              update((d) => {
                const x = d.reviews.find((x) => x.id === r.id)!;
                x.text[lang] = v;
                x.sample = false;
              })
            }
          />
          <div className="actions">
            <TranslateButton notify={notify} />
            <button
              className="admin-btn danger"
              onClick={() => {
                if (confirm("¿Eliminar esta reseña?"))
                  update((d) => {
                    d.reviews = d.reviews.filter((x) => x.id !== r.id);
                  });
              }}
            >
              Eliminar reseña
            </button>
          </div>
        </Panel>
      ))}
    </div>
  );
}
export function LanguagesEditor({ data, update, notify }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const serviceMissing = data.services.filter(
    (s) => !s.name[lang] || !s.desc[lang],
  );
  const photosMissing = data.gallery.filter((g) => !g.alt[lang]);
  return (
    <div className="admin-content">
      <Panel title="Cobertura de idiomas">
        <p>
          Las traducciones vacías usan español como fallback. Los textos
          originales de UI ya están disponibles en ES, EN, FR y DE.
        </p>
        <div className="language-stats">
          {LANGS.map((l) => {
            const total =
              data.services.length * 2 +
              data.gallery.length +
              data.albums.length;
            const filled =
              data.services.reduce(
                (a, s) => a + Number(!!s.name[l]) + Number(!!s.desc[l]),
                0,
              ) +
              data.gallery.filter((g) => g.alt[l]).length +
              data.albums.filter((a) => a.name[l]).length;
            return (
              <button
                key={l}
                className={l === lang ? "active" : ""}
                onClick={() => setLang(l)}
              >
                <strong>{l.toUpperCase()}</strong>
                <progress value={filled} max={total} />
                <small>
                  {filled} / {total} campos
                </small>
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="admin-heading">
        <LangTabs lang={lang} setLang={setLang} />
        <TranslateButton notify={notify} />
      </div>
      <Panel title={"Servicios pendientes · " + lang.toUpperCase()}>
        {!serviceMissing.length && (
          <p className="muted">
            Todos los nombres y descripciones están traducidos.
          </p>
        )}
        {serviceMissing.map((s) => (
          <div className="translation-row" key={s.id}>
            <b>{s.name.es}</b>
            <Field
              label="Nombre"
              value={s.name[lang]}
              placeholder={s.name.es}
              onChange={(v) =>
                update((d) => {
                  d.services.find((x) => x.id === s.id)!.name[lang] = v;
                })
              }
            />
            <TextField
              label="Descripción"
              value={s.desc[lang]}
              placeholder={s.desc.es}
              onChange={(v) =>
                update((d) => {
                  d.services.find((x) => x.id === s.id)!.desc[lang] = v;
                })
              }
            />
          </div>
        ))}
      </Panel>
      <Panel title="Álbumes">
        {data.albums.map((a) => (
          <Field
            key={a.id}
            label={a.name.es}
            value={a.name[lang]}
            placeholder={a.name.es}
            onChange={(v) =>
              update((d) => {
                d.albums.find((x) => x.id === a.id)!.name[lang] = v;
              })
            }
          />
        ))}
      </Panel>
      <Panel title="Textos del inicio">
        {HOMEKEYS.filter(
          ([k]) => data.home[k]?.es && !data.home[k]?.[lang],
        ).map(([k, label]) => (
          <TextField
            key={k}
            label={label}
            value={data.home[k]?.[lang] || ""}
            placeholder={data.home[k]?.es}
            onChange={(v) =>
              update((d) => {
                d.home[k][lang] = v;
              })
            }
          />
        ))}
      </Panel>
      <Panel title={"Fotos sin texto alternativo · " + photosMissing.length}>
        {photosMissing.map((g) => (
          <Field
            key={g.id}
            label={g.alt.es || g.id}
            value={g.alt[lang]}
            placeholder={g.alt.es}
            onChange={(v) =>
              update((d) => {
                d.gallery.find((x) => x.id === g.id)!.alt[lang] = v;
              })
            }
          />
        ))}
      </Panel>
    </div>
  );
}
export function SettingsEditor({ data, update, notify }: Props) {
  const entries = history();
  const [lang, setLang] = useState<Lang>("es");
  const [page, setPage] = useState<Page>("home");
  let usage = 0;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("evolushon"))
      .forEach((k) => {
        usage += (localStorage.getItem(k) || "").length * 2;
      });
  } catch {
    /* El formulario permanece accesible. */
  }
  async function importJson(file?: File) {
    if (!file) return;
    try {
      const next = migrate(JSON.parse(await file.text()));
      update((d) => {
        Object.keys(d).forEach(
          (k) => delete (d as unknown as Record<string, unknown>)[k],
        );
        Object.assign(d, next);
      });
      notify("Datos importados al borrador.");
    } catch {
      notify(
        "Archivo inválido. Se requiere un JSON Evolushon con services y gallery.",
      );
    }
  }
  return (
    <div className="admin-content">
      <Panel title="Datos del sitio">
        <div className="form-grid">
          <Field
            label="WhatsApp con código de país"
            value={data.settings.whatsapp}
            placeholder="519XXXXXXXX"
            onChange={(v) =>
              update((d) => {
                d.settings.whatsapp = v;
              })
            }
          />
          <Field
            label="Enlace corto WhatsApp (fallback)"
            value={data.settings.waLink}
            onChange={(v) =>
              update((d) => {
                d.settings.waLink = v;
              })
            }
          />
          <Field
            label="Dominio (HTTPS)"
            value={data.settings.domain}
            type="url"
            onChange={(v) =>
              update((d) => {
                d.settings.domain = v;
              })
            }
          />
          <Field
            label="Instagram"
            value={data.settings.instagram}
            type="url"
            onChange={(v) =>
              update((d) => {
                d.settings.instagram = v;
              })
            }
          />
          <Field
            label="TikTok"
            value={data.settings.tiktok}
            type="url"
            onChange={(v) =>
              update((d) => {
                d.settings.tiktok = v;
              })
            }
          />
        </div>
      </Panel>
      <Panel title="Compresión de imágenes">
        <p className="muted">
          Se aplica en el navegador al subir u optimizar una foto.
        </p>
        {(
          [
            {
              id: "max",
              name: "Máxima calidad",
              sub: "Hasta 2000 px · calidad 90% · ~300–500 KB",
            },
            {
              id: "balanced",
              name: "Equilibrada (recomendada)",
              sub: "Hasta 1600 px · calidad 82% · ~150–300 KB",
            },
            {
              id: "light",
              name: "Ligera",
              sub: "Hasta 1280 px · calidad 72% · ~80–160 KB",
            },
          ] as const
        ).map((p) => (
          <button
            className={
              "option " + (data.settings.img.preset === p.id ? "selected" : "")
            }
            key={p.id}
            onClick={() =>
              update((d) => {
                d.settings.img.preset = p.id;
              })
            }
          >
            <span>
              <strong>{p.name}</strong>
              <small>{p.sub}</small>
            </span>
          </button>
        ))}
        <label className="field">
          Formato
          <select
            value={data.settings.img.format}
            onChange={(e) =>
              update((d) => {
                d.settings.img.format = e.target.value as "webp" | "jpeg";
              })
            }
          >
            <option value="webp">WebP (JPEG si no es compatible)</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>
        <p className="muted">
          Uso del almacenamiento: {kb(usage)} de ~5 MB (borrador + publicado +
          historial). El tamaño final depende de la foto.
        </p>
      </Panel>
      <Panel title="SEO por página">
        <div className="admin-heading">
          <select
            aria-label="Página para SEO"
            value={page}
            onChange={(e) => setPage(e.target.value as Page)}
          >
            {(["home", "services", "gallery", "contact"] as const).map((p) => (
              <option key={p} value={p}>
                {UI.es[p]}
              </option>
            ))}
          </select>
          <LangTabs lang={lang} setLang={setLang} />
        </div>
        <Field
          label="Título"
          value={data.settings.seo[page]?.[lang]?.title || ""}
          placeholder={SEO_DEFAULTS[page][lang][0]}
          onChange={(v) =>
            update((d) => {
              d.settings.seo[page] ||= {};
              d.settings.seo[page]![lang] ||= { title: "", desc: "" };
              d.settings.seo[page]![lang]!.title = v;
            })
          }
        />
        <TextField
          label="Meta descripción"
          value={data.settings.seo[page]?.[lang]?.desc || ""}
          placeholder={SEO_DEFAULTS[page][lang][1]}
          onChange={(v) =>
            update((d) => {
              d.settings.seo[page] ||= {};
              d.settings.seo[page]![lang] ||= { title: "", desc: "" };
              d.settings.seo[page]![lang]!.desc = v;
            })
          }
        />
      </Panel>
      <Panel title="Equipo (solo demo)">
        <p className="muted">
          Usuarios locales del prototipo. Administrador publica y configura;
          editor edita borradores; fotógrafo gestiona la galería.
        </p>
        {data.settings.users.map((u, i) => (
          <div className="user-editor" key={i}>
            <Field
              label="Nombre"
              value={u.name}
              onChange={(v) =>
                update((d) => {
                  d.settings.users[i].name = v;
                })
              }
            />
            <Field
              label="Usuario"
              value={u.user}
              onChange={(v) =>
                update((d) => {
                  d.settings.users[i].user = v;
                })
              }
            />
            <Field
              label="Clave demo"
              type="password"
              autoComplete="new-password"
              value={u.pass}
              onChange={(v) =>
                update((d) => {
                  d.settings.users[i].pass = v;
                })
              }
            />
            <label className="field">
              Rol
              <select
                value={u.role}
                onChange={(e) => {
                  const value = e.target.value as typeof u.role;
                  if (
                    u.role === "admin" &&
                    data.settings.users.filter((u) => u.role === "admin")
                      .length < 2 &&
                    value !== "admin"
                  ) {
                    notify("Debe quedar al menos un administrador.");
                    return;
                  }
                  update((d) => {
                    d.settings.users[i].role = value;
                  });
                }}
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="fotografo">Fotógrafo</option>
              </select>
            </label>
            <button
              className="admin-btn danger"
              onClick={() => {
                if (
                  u.role === "admin" &&
                  data.settings.users.filter((u) => u.role === "admin").length <
                    2
                ) {
                  notify("Debe quedar al menos un administrador.");
                  return;
                }
                update((d) => {
                  d.settings.users.splice(i, 1);
                });
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          className="admin-btn"
          onClick={() =>
            update((d) =>
              d.settings.users.push({
                name: "Nuevo",
                user: "usuario" + (d.settings.users.length + 1),
                pass: "",
                role: "editor",
              }),
            )
          }
        >
          Añadir usuario
        </button>
      </Panel>
      <Panel title="Respaldo y almacenamiento">
        <div className="actions">
          <button
            className="admin-btn"
            onClick={() =>
              download(
                "evolushon-datos-" + isoDate() + ".json",
                JSON.stringify(data, null, 2),
                "application/json",
              )
            }
          >
            Exportar JSON
          </button>
          <label className="admin-btn file-btn">
            Importar JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                void importJson(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button
            className="admin-btn danger"
            onClick={() => {
              if (
                confirm("¿Reemplazar el borrador por los datos originales?")
              ) {
                const def = clone(DEFAULT);
                def.settings.users = data.settings.users;
                update((d) => Object.assign(d, def));
                notify("Datos originales restaurados en el borrador.");
              }
            }}
          >
            Restaurar originales
          </button>
        </div>
        <p className="muted">
          Exporta una copia antes de borrar los datos del navegador. Publicar
          modifica solo este navegador, no los archivos de Hostinger.
        </p>
      </Panel>
      <Panel title="Historial de publicaciones">
        <p className="muted">
          Restaura servicios, textos y ajustes al borrador. La galería actual se
          conserva.
        </p>
        {!entries.length && <p className="muted">Aún no hay publicaciones.</p>}
        {entries.map((h) => (
          <div className="history-row" key={h.at}>
            <div>
              <b>
                {new Date(h.at).toLocaleString("es-PE")} · {h.by}
              </b>
              <small>
                {h.summary.services} servicios · {h.summary.gallery} fotos ·{" "}
                {h.summary.other} otros
              </small>
            </div>
            <button
              className="admin-btn"
              onClick={() => {
                if (confirm("¿Restaurar esta versión como borrador?")) {
                  update((d) => {
                    const users = d.settings.users;
                    Object.assign(d, clone(h.snap));
                    d.settings.users = users;
                  });
                  notify("Versión restaurada como borrador.");
                }
              }}
            >
              Restaurar
            </button>
          </div>
        ))}
      </Panel>
    </div>
  );
}
