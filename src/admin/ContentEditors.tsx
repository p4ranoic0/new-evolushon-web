import { useState } from "react";
import { ServerStorage, UsersManager } from "./ServerSettings";
import { IconPlus } from "@tabler/icons-react";
import {
  blank,
  isoDate,
  LANGS,
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
  const [lang, setLang] = useState<Lang>("es");
  const [page, setPage] = useState<Page>("home");
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
          Calidad WebP del servidor. Las fotos se reducen antes de subir para ahorrar datos.
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
        <p className="muted">Las fotos se guardan como WebP en tres tamaños, sin metadatos de ubicación.</p>
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
      <UsersManager notify={notify}/>
      <ServerStorage notify={notify}/>
    </div>
  );
}
