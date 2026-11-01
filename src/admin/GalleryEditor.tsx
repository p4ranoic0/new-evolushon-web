import { kb, move, photoBytes } from "./utils";
import { useState, useRef } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconPhotoPlus,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { asset, blank, clone, LANGS } from "../store";
import type { Lang, Photo, SiteData } from "../store";
import { Check, Field, LangTabs, Panel, TranslateButton } from "./shared";
import type { Update } from "./shared";
import { compressImage, processFile } from "./images";
export function GalleryEditor({
  data,
  update,
  notify,
  canDelete = true,
}: {
  canDelete?: boolean;
  data: SiteData;
  update: Update;
  notify: (s: string) => void;
}) {
  const [album, setAlbum] = useState("all"),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [photo, setPhoto] = useState<string | null>(null),
    [lang, setLang] = useState<Lang>("es"),
    [albumsOpen, setAlbumsOpen] = useState(false),
    [progress, setProgress] = useState(""),
    [preview, setPreview] = useState(false),
    [drag, setDrag] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const lastSelected = useRef<string | null>(null);
  const shown = data.gallery.filter(
    (g) =>
      (album === "all" || g.album === album) &&
      (filter === "all" ||
        (filter === "featured" && g.featured) ||
        (filter === "hidden" && g.hidden) ||
        (filter === "visible" && !g.hidden) ||
        (filter === "noalt" && !g.alt.es) ||
        (filter === "heavy" && photoBytes(g) > 350 * 1024) ||
        (filter === "missing" && LANGS.some((l) => !g.alt[l]))) &&
      (!query ||
        [...Object.values(g.alt), g.id]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  function toggleSelection(id: string, shift = false) {
    if (shift && lastSelected.current) {
      const ids = shown.map((g) => g.id),
        a = ids.indexOf(lastSelected.current),
        b = ids.indexOf(id);
      if (a >= 0 && b >= 0) {
        setSelected([
          ...new Set([
            ...selected,
            ...ids.slice(Math.min(a, b), Math.max(a, b) + 1),
          ]),
        ]);
        return;
      }
    }
    setSelected(
      selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id],
    );
    lastSelected.current = id;
  }
  const p = data.gallery.find((g) => g.id === photo);
  function change(fn: (p: Photo) => void) {
    update((d) => {
      const g = d.gallery.find((g) => g.id === photo);
      if (g) fn(g);
    });
  }
  function bulk(fn: (g: Photo) => void) {
    update((d) => d.gallery.filter((g) => selected.includes(g.id)).forEach(fn));
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const added: Photo[] = [];
    let original = 0,
      compressed = 0;
    try {
      for (const [i, f] of Array.from(files).entries()) {
        setProgress("Comprimiendo " + (i + 1) + " / " + files.length);
        const out = await processFile(f, data.settings.img);
        added.push({
          id: "g-" + crypto.randomUUID(),
          src: out.src,
          album: album === "all" ? data.albums[0].id : album,
          featured: false,
          hidden: false,
          alt: blank(),
          focus: "50% 50%",
          originalBytes: f.size,
          bytes: out.bytes,
        });
        original += f.size;
        compressed += out.bytes;
      }
      update((d) => d.gallery.push(...added));
      notify(
        added.length +
          " imágenes procesadas: " +
          kb(original) +
          " → " +
          kb(compressed) +
          ".",
      );
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setProgress("");
    }
  }
  async function optimize(ids: string[]) {
    setProgress("Optimizando imágenes…");
    try {
      const results = await Promise.all(
        data.gallery
          .filter((g) => ids.includes(g.id))
          .map(async (g) => ({
            id: g.id,
            ...(await compressImage(g.src, data.settings.img)),
          })),
      );
      update((d) =>
        results.forEach((r) => {
          const g = d.gallery.find((g) => g.id === r.id)!;
          g.src = r.src;
          g.bytes = r.bytes;
        }),
      );
      notify("Imágenes optimizadas en el borrador.");
    } catch (e) {
      notify("No se pudo optimizar: " + (e as Error).message);
    } finally {
      setProgress("");
    }
  }
  return (
    <div className="admin-content">
      <div className="admin-heading">
        <div className="chips">
          {[{ id: "all", name: { es: "Todas" } }, ...data.albums].map((a) => (
            <button
              key={a.id}
              className={album === a.id ? "active" : ""}
              onClick={() => {
                setAlbum(a.id);
                setSelected([]);
              }}
            >
              {a.name.es}{" "}
              <span>
                {
                  data.gallery.filter((g) => a.id === "all" || g.album === a.id)
                    .length
                }
              </span>
            </button>
          ))}
        </div>
        <button
          className="admin-btn"
          onClick={() => setAlbumsOpen(!albumsOpen)}
        >
          Gestionar álbumes
        </button>
      </div>
      {albumsOpen && (
        <Panel title="Álbumes">
          {data.albums.map((a) => (
            <div className="album-editor" key={a.id}>
              {LANGS.map((l) => (
                <Field
                  key={l}
                  label={l.toUpperCase()}
                  value={a.name[l]}
                  onChange={(v) =>
                    update((d) => {
                      d.albums.find((x) => x.id === a.id)!.name[l] = v;
                    })
                  }
                />
              ))}
              <button
                className="admin-btn danger"
                disabled={data.albums.length < 2}
                onClick={() => {
                  const target = data.albums.find((x) => x.id !== a.id)!;
                  if (
                    confirm(
                      "¿Eliminar el álbum? Sus fotos pasan a " +
                        target.name.es +
                        ".",
                    )
                  ) {
                    update((d) => {
                      d.gallery.forEach((g) => {
                        if (g.album === a.id) g.album = target.id;
                      });
                      d.albums = d.albums.filter((x) => x.id !== a.id);
                    });
                    if (album === a.id) setAlbum("all");
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
          <div className="actions">
            <button
              className="admin-btn"
              onClick={() =>
                update((d) =>
                  d.albums.push({
                    id: "album-" + Date.now(),
                    name: { ...blank(), es: "Nuevo álbum" },
                  }),
                )
              }
            >
              Nuevo álbum
            </button>
            <TranslateButton notify={notify} />
          </div>
        </Panel>
      )}
      <div
        className="upload-zone"
        onDragOver={(e) => {
          if (!drag) e.preventDefault();
        }}
        onDrop={(e) => {
          if (drag) return;
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        <IconPhotoPlus size={32} />
        <div>
          <b>Arrastra tus fotos aquí</b>
          <p className="muted">
            Se comprimen antes de guardar. JPEG, PNG, WebP, AVIF o GIF.
          </p>
        </div>
        <label className="admin-btn primary file-btn">
          {progress || "Subir fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!!progress}
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="admin-heading">
        <input
          className="gallery-search"
          type="search"
          placeholder="Buscar por texto alternativo…"
          aria-label="Buscar fotos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="actions">
          <select
            aria-label="Filtrar fotos"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="featured">Destacadas</option>
            <option value="visible">Visibles</option>
            <option value="noalt">Sin alt</option>
            <option value="heavy">Pesadas (&gt;350 KB)</option>
            <option value="hidden">Ocultas</option>
            <option value="missing">Sin traducción</option>
          </select>
          <button
            className="admin-btn"
            onClick={() => {
              setSelectMode(!selectMode);
              setSelected([]);
            }}
          >
            {selectMode ? "Listo" : "Seleccionar"}
          </button>
          <button className="admin-btn" onClick={() => setPreview(!preview)}>
            {preview ? "Volver a editar" : "Vista del sitio"}
          </button>
        </div>
      </div>
      {selected.length > 0 && (
        <div className="bulk-actions">
          <b>{selected.length} seleccionadas</b>
          <button
            className="admin-btn"
            onClick={() => setSelected(shown.map((g) => g.id))}
          >
            Seleccionar todas
          </button>
          <button className="admin-btn" onClick={() => setSelected([])}>
            Quitar selección
          </button>
          <button
            className="admin-btn"
            onClick={() =>
              bulk((g) => {
                g.featured = true;
              })
            }
          >
            Destacar
          </button>
          <button
            className="admin-btn"
            onClick={() =>
              bulk((g) => {
                g.featured = false;
              })
            }
          >
            Quitar destacadas
          </button>
          <button
            className="admin-btn"
            onClick={() =>
              bulk((g) => {
                g.hidden = true;
              })
            }
          >
            Ocultar
          </button>
          <button
            className="admin-btn"
            onClick={() =>
              bulk((g) => {
                g.hidden = false;
              })
            }
          >
            Mostrar
          </button>
          <select
            aria-label="Mover selección al álbum"
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v)
                bulk((g) => {
                  g.album = v;
                });
            }}
          >
            <option value="">Mover a álbum…</option>
            {data.albums.map((a) => (
              <option value={a.id} key={a.id}>
                {a.name.es}
              </option>
            ))}
          </select>
          <button
            className="admin-btn"
            disabled={!!progress}
            onClick={() => void optimize(selected)}
          >
            Optimizar
          </button>
          <button
            className="admin-btn danger"
            disabled={!canDelete}
            onClick={() => {
              if (confirm("¿Eliminar " + selected.length + " fotos?")) {
                update((d) => {
                  d.gallery = d.gallery.filter((g) => !selected.includes(g.id));
                });
                setSelected([]);
              }
            }}
          >
            Eliminar
          </button>
        </div>
      )}
      <div className={"gallery-editor-layout " + (p ? "with-detail" : "")}>
        <div>
          <div className={preview ? "bento admin-bento" : "admin-photo-grid"}>
            {shown
              .filter((g) => !preview || !g.hidden)
              .map((g) => (
                <div
                  className={
                    "admin-photo " +
                    (g.hidden ? "hidden-photo" : "") +
                    (selected.includes(g.id) ? " selected-photo" : "")
                  }
                  key={g.id}
                  draggable={
                    !preview && !selectMode && !query && filter === "all"
                  }
                  onDragStart={() => setDrag(g.id)}
                  onDragEnd={() => setDrag(null)}
                  onDragOver={(e) => {
                    if (drag) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (!drag || drag === g.id) return;
                    e.preventDefault();
                    update((d) => {
                      const i = d.gallery.findIndex((g) => g.id === drag);
                      const [item] = d.gallery.splice(i, 1);
                      const j = d.gallery.findIndex((v) => v.id === g.id);
                      d.gallery.splice(j, 0, item);
                    });
                    setDrag(null);
                  }}
                >
                  <button
                    className="photo-open"
                    onClick={(e) => {
                      if (selectMode || e.shiftKey) {
                        setSelectMode(true);
                        toggleSelection(g.id, e.shiftKey);
                      } else setPhoto(g.id);
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={asset(g.src)}
                      alt={g.alt.es || "Foto sin texto alternativo"}
                      style={{ objectPosition: g.focus }}
                    />
                  </button>
                  {!preview && (
                    <>
                      <input
                        type="checkbox"
                        style={{ display: selectMode ? undefined : "none" }}
                        aria-label={"Seleccionar " + g.id}
                        checked={selected.includes(g.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, g.id]
                              : selected.filter((id) => id !== g.id),
                          )
                        }
                      />
                      <button
                        className="photo-feature"
                        aria-label={
                          g.featured ? "Quitar destacada" : "Destacar foto"
                        }
                        onClick={() =>
                          update((d) => {
                            d.gallery.find((v) => v.id === g.id)!.featured =
                              !g.featured;
                          })
                        }
                      >
                        {g.featured ? (
                          <IconStarFilled size={18} />
                        ) : (
                          <IconStar size={18} />
                        )}
                      </button>
                      <div className="photo-caption">
                        <span>
                          {g.hidden
                            ? "Oculta"
                            : g.alt.es || "Sin texto alternativo"}
                        </span>
                        <small>{photoBytes(g) ? kb(photoBytes(g)) : "…"}</small>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
          {!shown.length && (
            <Panel>
              <p>
                No hay fotos con este filtro. Sube una imagen o cambia de álbum.
              </p>
            </Panel>
          )}
          <p className="muted">
            {shown.length} fotos · Arrastra una foto sobre otra para cambiar el
            orden.
          </p>
        </div>
        {p && (
          <aside className="photo-inspector">
            <div className="admin-heading">
              <h2>Editar foto</h2>
              <button
                className="icon-btn"
                aria-label="Cerrar editor de foto"
                onClick={() => setPhoto(null)}
              >
                ×
              </button>
            </div>
            <div
              className="cover-focus"
              title="Haz clic para definir el punto focal"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                change((g) => {
                  g.focus =
                    Math.round(((e.clientX - r.left) / r.width) * 100) +
                    "% " +
                    Math.round(((e.clientY - r.top) / r.height) * 100) +
                    "%";
                });
              }}
            >
              <img
                src={asset(p.src)}
                alt={p.alt.es}
                style={{ objectPosition: p.focus }}
              />
              <span
                className="focus-point"
                style={{
                  left: p.focus.split(" ")[0],
                  top: p.focus.split(" ")[1],
                }}
              />
            </div>
            <small className="muted">
              Haz clic para ajustar el encuadre. {p.focus}
            </small>
            <label className="field">
              Álbum
              <select
                value={p.album}
                onChange={(e) =>
                  change((g) => {
                    g.album = e.target.value;
                  })
                }
              >
                {data.albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name.es}
                  </option>
                ))}
              </select>
            </label>
            <LangTabs lang={lang} setLang={setLang} />
            <Field
              label={"Texto alternativo · " + lang.toUpperCase()}
              value={p.alt[lang]}
              placeholder={p.alt.es}
              onChange={(v) =>
                change((g) => {
                  g.alt[lang] = v;
                })
              }
            />
            <TranslateButton notify={notify} />
            <Check
              label="Destacada en inicio"
              checked={p.featured}
              onChange={(v) =>
                change((g) => {
                  g.featured = v;
                })
              }
            />
            <Check
              label="Oculta en el sitio"
              checked={p.hidden}
              onChange={(v) =>
                change((g) => {
                  g.hidden = v;
                })
              }
            />
            <div className="actions">
              <button
                className="admin-btn"
                disabled={!!progress}
                onClick={() => void optimize([p.id])}
              >
                Optimizar
              </button>
              <button
                className="admin-btn"
                onClick={() => {
                  const copy = clone(p);
                  copy.id = "g-" + crypto.randomUUID();
                  update((d) => d.gallery.push(copy));
                }}
              >
                Duplicar
              </button>
            </div>
            <div className="actions">
              <button
                className="admin-btn"
                aria-label="Subir foto"
                onClick={() =>
                  update((d) =>
                    move(
                      d.gallery,
                      d.gallery.findIndex((g) => g.id === p.id),
                      -1,
                    ),
                  )
                }
              >
                <IconArrowUp size={17} />
              </button>
              <button
                className="admin-btn"
                aria-label="Bajar foto"
                onClick={() =>
                  update((d) =>
                    move(
                      d.gallery,
                      d.gallery.findIndex((g) => g.id === p.id),
                      1,
                    ),
                  )
                }
              >
                <IconArrowDown size={17} />
              </button>
              <button
                className="admin-btn danger"
                disabled={!canDelete}
                onClick={() => {
                  if (confirm("¿Eliminar esta foto?")) {
                    update((d) => {
                      d.gallery = d.gallery.filter((g) => g.id !== p.id);
                    });
                    setPhoto(null);
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
