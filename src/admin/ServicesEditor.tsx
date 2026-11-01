import { move } from "./utils";
import { useState } from "react";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconCopy,
  IconPlus,
} from "@tabler/icons-react";
import {
  asset,
  blank,
  blankList,
  CATS,
  clone,
  effectivePrice,
  money,
  pathFor,
  tr,
} from "../store";
import type { Category, Lang, Service, SiteData } from "../store";
import {
  Check,
  Field,
  LangTabs,
  Panel,
  TextField,
  TranslateButton,
} from "./shared";
import type { Update } from "./shared";
import { uploadImage } from "./image-pipeline";
export function ServicesEditor({
  data,
  update,
  notify,
}: {
  data: SiteData;
  update: Update;
  notify: (s: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [lang, setLang] = useState<Lang>("es"),
    [newOpen, setNewOpen] = useState(false),
    [mobile, setMobile] = useState(false),
    [pick, setPick] = useState(false),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState<Category | "all">("all");
  const s = data.services.find((s) => s.id === selected),
    catNames = { surf: "Surf", surfskate: "Surfskate", trip: "Surftrips" };
  function change(fn: (s: Service) => void) {
    update((d) => {
      const svc = d.services.find((x) => x.id === selected);
      if (svc) fn(svc);
    });
  }
  function add(cat: Category) {
    const id = cat + "-" + crypto.randomUUID().slice(0, 8);
    const svc: Service = {
      id,
      cat,
      active: false,
      cover: data.gallery[0]?.src || "src/assets/banner-principal.jpg",
      coverFocus: "50% 50%",
      currency: cat === "trip" ? "$" : "S/",
      price: null,
      packages: [],
      name: { ...blank(), es: "Nuevo servicio" },
      desc: blank(),
      duration: blank(),
      distance: blank(),
      includes: blankList(),
      excludes: blankList(),
      bring: blankList(),
      seo: { title: blank(), desc: blank(), slug: "" },
      offer: { on: false, price: null, from: "", to: "", label: blank() },
    };
    update((d) => d.services.push(svc));
    setSelected(id);
    setLang("es");
    setNewOpen(false);
  }
  function duplicate(service: Service) {
    const copy = clone(service);
    copy.id = service.cat + "-" + crypto.randomUUID().slice(0, 8);
    copy.active = false;
    copy.name.es += " (copia)";
    copy.seo.slug = "";
    update((d) => d.services.push(copy));
    setSelected(copy.id);
    notify("Servicio duplicado como borrador.");
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await uploadImage(file,data.settings.img,"portada",s?.name.es||file.name);
      change((s) => {
        s.cover = result.src;
        s.coverFocus = "50% 50%";
      });
      notify("Portada subida y guardada en el borrador.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-content">
      {!s ? (
        <>
          <div className="admin-heading">
            <p className="muted">
              Precios, paquetes, contenido y SEO de cada experiencia.
            </p>
            <button
              className="admin-btn primary"
              onClick={() => setNewOpen(!newOpen)}
            >
              <IconPlus size={17} />
              Nuevo servicio
            </button>
          </div>
          {newOpen && (
            <Panel title="¿Qué vas a ofrecer?">
              <div className="actions">
                {CATS.map((c) => (
                  <button key={c} className="admin-btn" onClick={() => add(c)}>
                    {catNames[c]}
                  </button>
                ))}
              </div>
            </Panel>
          )}
          <div className="chips">
            {(["all", ...CATS] as const).map((c) => (
              <button
                key={c}
                className={filter === c ? "active" : ""}
                onClick={() => setFilter(c)}
              >
                {c === "all" ? "Todos" : catNames[c]}
              </button>
            ))}
          </div>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Orden</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.services
                  .map((svc, i) => ({ svc, i }))
                  .filter(({ svc }) => filter === "all" || svc.cat === filter)
                  .map(({ svc, i }) => (
                    <tr key={svc.id}>
                      <td>
                        <button
                          className="table-service"
                          onClick={() => {
                            setSelected(svc.id);
                            setLang("es");
                          }}
                        >
                          <img
                            src={asset(svc.cover)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                          <b>{svc.name.es}</b>
                        </button>
                      </td>
                      <td>{catNames[svc.cat]}</td>
                      <td>{money(svc.currency, svc.price) || "Consultar"}</td>
                      <td>
                        <button
                          className={"status " + (svc.active ? "green" : "")}
                          onClick={() =>
                            update((d) => {
                              d.services.find((s) => s.id === svc.id)!.active =
                                !svc.active;
                            })
                          }
                        >
                          {svc.active ? "Activo" : "Oculto"}
                        </button>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="icon-btn"
                            aria-label="Subir servicio"
                            disabled={i === 0}
                            onClick={() =>
                              update((d) => move(d.services, i, -1))
                            }
                          >
                            <IconArrowUp size={17} />
                          </button>
                          <button
                            className="icon-btn"
                            aria-label="Bajar servicio"
                            disabled={i === data.services.length - 1}
                            onClick={() =>
                              update((d) => move(d.services, i, 1))
                            }
                          >
                            <IconArrowDown size={17} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="admin-btn"
                            onClick={() => setSelected(svc.id)}
                          >
                            Editar
                          </button>
                          <button
                            className="icon-btn"
                            aria-label="Duplicar servicio"
                            onClick={() => duplicate(svc)}
                          >
                            <IconCopy size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="admin-heading">
            <button
              className="admin-btn"
              onClick={() => {
                setSelected(null);
                setPick(false);
              }}
            >
              <IconArrowLeft size={16} />
              Todos los servicios
            </button>
            <div className="actions">
              <TranslateButton notify={notify} />
              <button className="admin-btn" onClick={() => duplicate(s)}>
                Duplicar
              </button>
              <Check
                label="Visible en el sitio"
                checked={s.active}
                onChange={(v) =>
                  change((s) => {
                    s.active = v;
                  })
                }
              />
            </div>
          </div>
          <LangTabs lang={lang} setLang={setLang} />
          <div className="service-edit-layout">
            <div className="editor-fields">
              <Panel title="Información">
                <div className="form-grid">
                  <label className="field">
                    Categoría
                    <select
                      value={s.cat}
                      onChange={(e) =>
                        change((s) => {
                          s.cat = e.target.value as Category;
                        })
                      }
                    >
                      {CATS.map((c) => (
                        <option key={c} value={c}>
                          {catNames[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="ID" value={s.id} readOnly onChange={() => {}} />
                </div>
                <Field
                  label={"Nombre · " + lang.toUpperCase()}
                  value={s.name[lang]}
                  placeholder={s.name.es}
                  onChange={(v) =>
                    change((s) => {
                      s.name[lang] = v;
                    })
                  }
                />
                <TextField
                  label={"Descripción · " + lang.toUpperCase()}
                  value={s.desc[lang]}
                  placeholder={s.desc.es}
                  rows={5}
                  onChange={(v) =>
                    change((s) => {
                      s.desc[lang] = v;
                    })
                  }
                />
              </Panel>
              <Panel title="Portada">
                <div
                  className="cover-focus"
                  title="Haz clic para definir el punto focal"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = Math.round(
                        ((e.clientX - r.left) / r.width) * 100,
                      ),
                      y = Math.round(((e.clientY - r.top) / r.height) * 100);
                    change((s) => {
                      s.coverFocus = x + "% " + y + "%";
                    });
                  }}
                >
                  <img
                    src={asset(s.cover)}
                    alt={s.name.es}
                    style={{ objectPosition: s.coverFocus }}
                  />
                  <span
                    className="focus-point"
                    style={{
                      left: s.coverFocus.split(" ")[0],
                      top: s.coverFocus.split(" ")[1],
                    }}
                  />
                </div>
                <small className="muted">
                  Haz clic en la imagen para definir el punto focal.{" "}
                  {s.coverFocus}
                </small>
                <div className="actions">
                  <label className="admin-btn file-btn">
                    {busy ? "Subiendo…" : "Subir portada"}
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      disabled={busy}
                      onChange={(e) => {
                        void upload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button className="admin-btn" onClick={() => setPick(!pick)}>
                    Elegir de la galería
                  </button>
                </div>
                {pick && (
                  <div className="cover-picker">
                    {data.gallery.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          change((s) => {
                            s.cover = g.src;
                            s.coverFocus = g.focus;
                          });
                          setPick(false);
                        }}
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src={asset(g.src)}
                          alt={g.alt.es}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Panel>
              <Panel title="Precios y paquetes">
                <div className="form-grid">
                  <label className="field">
                    Moneda
                    <select
                      value={s.currency}
                      onChange={(e) =>
                        change((s) => {
                          s.currency = e.target.value;
                        })
                      }
                    >
                      <option>S/</option>
                      <option>$</option>
                    </select>
                  </label>
                  <Field
                    label="Precio (vacío = consultar)"
                    type="number"
                    min="0"
                    value={s.price ?? ""}
                    onChange={(v) =>
                      change((s) => {
                        s.price = v === "" ? null : Math.max(0, Number(v));
                      })
                    }
                  />
                </div>
                {s.packages.map((p, i) => (
                  <div className="package-editor" key={i}>
                    <Field
                      label="Clases"
                      type="number"
                      min="1"
                      value={p.n}
                      onChange={(v) =>
                        change((s) => {
                          s.packages[i].n = Math.max(1, Number(v));
                        })
                      }
                    />
                    <Field
                      label="Precio del paquete"
                      type="number"
                      min="0"
                      value={p.price}
                      onChange={(v) =>
                        change((s) => {
                          s.packages[i].price = Math.max(0, Number(v));
                        })
                      }
                    />
                    <button
                      className="icon-btn"
                      aria-label="Quitar paquete"
                      onClick={() =>
                        change((s) => {
                          s.packages.splice(i, 1);
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="admin-btn"
                  onClick={() =>
                    change((s) => {
                      s.packages.push({ n: 4, price: 0 });
                    })
                  }
                >
                  <IconPlus size={16} />
                  Añadir paquete
                </button>
              </Panel>
              <Panel title="Oferta temporal">
                <Check
                  label="Activar oferta"
                  checked={s.offer.on}
                  onChange={(v) =>
                    change((s) => {
                      s.offer.on = v;
                    })
                  }
                />
                <div className="form-grid">
                  <Field
                    label="Precio de oferta"
                    type="number"
                    min="0"
                    value={s.offer.price ?? ""}
                    onChange={(v) =>
                      change((s) => {
                        s.offer.price = v === "" ? null : Number(v);
                      })
                    }
                  />
                  <Field
                    label={"Etiqueta · " + lang.toUpperCase()}
                    value={s.offer.label[lang]}
                    onChange={(v) =>
                      change((s) => {
                        s.offer.label[lang] = v;
                      })
                    }
                  />
                  <Field
                    label="Desde"
                    type="date"
                    value={s.offer.from}
                    onChange={(v) =>
                      change((s) => {
                        s.offer.from = v;
                      })
                    }
                  />
                  <Field
                    label="Hasta"
                    type="date"
                    value={s.offer.to}
                    onChange={(v) =>
                      change((s) => {
                        s.offer.to = v;
                      })
                    }
                  />
                </div>
              </Panel>
              {s.cat === "trip" && (
                <Panel title="Logística del viaje">
                  <div className="form-grid">
                    <Field
                      label={"Duración · " + lang.toUpperCase()}
                      value={s.duration[lang]}
                      onChange={(v) =>
                        change((s) => {
                          s.duration[lang] = v;
                        })
                      }
                    />
                    <Field
                      label={"Distancia · " + lang.toUpperCase()}
                      value={s.distance[lang]}
                      onChange={(v) =>
                        change((s) => {
                          s.distance[lang] = v;
                        })
                      }
                    />
                    <Field
                      label="Salida de Lima"
                      value={s.depart || ""}
                      onChange={(v) =>
                        change((s) => {
                          s.depart = v;
                        })
                      }
                    />
                    <Field
                      label="Regreso a Lima"
                      value={s.ret || ""}
                      onChange={(v) =>
                        change((s) => {
                          s.ret = v;
                        })
                      }
                    />
                    <Field
                      label="Mínimo de participantes"
                      type="number"
                      min="1"
                      value={s.minPeople || 1}
                      onChange={(v) =>
                        change((s) => {
                          s.minPeople = Math.max(1, Number(v));
                        })
                      }
                    />
                  </div>
                </Panel>
              )}
              <Panel title="Detalles">
                <p className="muted">
                  Un elemento por línea. Si falta la traducción, se muestra el
                  español.
                </p>
                {(["includes", "excludes", "bring"] as const).map((k, i) => (
                  <TextField
                    key={k}
                    label={
                      ["Incluye", "No incluye", "Qué llevar"][i] +
                      " · " +
                      lang.toUpperCase()
                    }
                    value={s[k][lang].join("\n")}
                    onChange={(v) =>
                      change((s) => {
                        s[k][lang] = v.split("\n");
                      })
                    }
                  />
                ))}
              </Panel>
              <Panel title="SEO del servicio">
                <Field
                  label="Slug de URL (compartido por los idiomas)"
                  value={s.seo.slug}
                  placeholder={s.id}
                  onChange={(v) =>
                    change((s) => {
                      s.seo.slug = v
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/--+/g, "-");
                    })
                  }
                />
                {data.services.some(
                  (x) =>
                    x.id !== s.id &&
                    (x.seo.slug || x.id) === (s.seo.slug || s.id),
                ) && (
                  <p className="error">
                    Este slug ya pertenece a otro servicio.
                  </p>
                )}
                <Field
                  label={"Título SEO · " + lang.toUpperCase()}
                  value={s.seo.title[lang]}
                  placeholder={tr(s.name, lang) + " | Evolushon"}
                  onChange={(v) =>
                    change((s) => {
                      s.seo.title[lang] = v;
                    })
                  }
                />
                <small className="muted">
                  {s.seo.title[lang].length} / ~60 caracteres
                </small>
                <TextField
                  label={"Meta descripción · " + lang.toUpperCase()}
                  value={s.seo.desc[lang]}
                  placeholder={tr(s.desc, lang)}
                  onChange={(v) =>
                    change((s) => {
                      s.seo.desc[lang] = v;
                    })
                  }
                />
                <small className="muted">
                  {s.seo.desc[lang].length} / ~160 caracteres
                </small>
                <div className="google-preview">
                  <small>
                    {data.settings.domain + pathFor(lang, "services", s)}
                  </small>
                  <h3>
                    {tr(s.seo.title, lang) || tr(s.name, lang) + " | Evolushon"}
                  </h3>
                  <p>{tr(s.seo.desc, lang) || tr(s.desc, lang)}</p>
                </div>
              </Panel>
              <button
                className="admin-btn danger"
                onClick={() => {
                  if (confirm("¿Eliminar «" + s.name.es + "»?")) {
                    update((d) => {
                      d.services = d.services.filter((v) => v.id !== s.id);
                    });
                    setSelected(null);
                  }
                }}
              >
                Eliminar servicio
              </button>
            </div>
            <aside className="service-live-preview">
              <div className="admin-heading">
                <span className="eyebrow">Vista previa</span>
                <div className="actions">
                  <button
                    className={"admin-btn " + (!mobile ? "primary" : "")}
                    onClick={() => setMobile(false)}
                  >
                    Desktop
                  </button>
                  <button
                    className={"admin-btn " + (mobile ? "primary" : "")}
                    onClick={() => setMobile(true)}
                  >
                    Móvil
                  </button>
                </div>
              </div>
              <div className={"service-preview " + (mobile ? "mobile" : "")}>
                <img
                  src={asset(s.cover)}
                  alt=""
                  style={{ objectPosition: s.coverFocus }}
                />
                <div>
                  <small>{catNames[s.cat]}</small>
                  <h2>{tr(s.name, lang)}</h2>
                  <p>{tr(s.desc, lang)}</p>
                  <strong className="price">
                    {money(s.currency, effectivePrice(s)) || "Consultar"}
                  </strong>
                  {s.packages.map((p) => (
                    <p key={p.n}>
                      {p.n} clases · {money(s.currency, p.price)}
                    </p>
                  ))}
                  <span className="btn gold">Reservar y pagar</span>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
