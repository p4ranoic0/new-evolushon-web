import { useState } from "react";
import { IconBrandWhatsapp, IconDownload } from "@tabler/icons-react";
import {
  bookings,
  CATS,
  download,
  isoDate,
  KEYS,
  money,
  writeStored,
} from "../store";
import type { Booking, BookingStatus, SiteData } from "../store";
import { Check, Field, Panel } from "./shared";
import type { Update } from "./shared";
const states: BookingStatus[] = [
  "pendiente",
  "por verificar",
  "pagada",
  "completada",
  "cancelada",
];
export function BookingsEditor({
  data,
  update,
  notify,
  canConfigure,
}: {
  data: SiteData;
  update: Update;
  notify: (s: string) => void;
  canConfigure: boolean;
}) {
  const [filter, setFilter] = useState("upcoming"),
    [q, setQ] = useState(""),
    [config, setConfig] = useState(false),
    [block, setBlock] = useState(""),
    [tick, setTick] = useState(0);
  void tick;
  const all = bookings(),
    today = isoDate(),
    cfg = data.settings.booking;
  const filters = [
    {
      id: "upcoming",
      label: "Próximas",
      fn: (b: Booking) => b.date >= today && b.status !== "cancelada",
    },
    {
      id: "verify",
      label: "Por verificar",
      fn: (b: Booking) => b.status === "por verificar",
    },
    { id: "paid", label: "Pagadas", fn: (b: Booking) => b.status === "pagada" },
    { id: "past", label: "Pasadas", fn: (b: Booking) => b.date < today },
    {
      id: "cancel",
      label: "Canceladas",
      fn: (b: Booking) => b.status === "cancelada",
    },
    { id: "all", label: "Todas", fn: () => true },
  ];
  const rows = all
    .filter(filters.find((f) => f.id === filter)!.fn)
    .filter((b) =>
      [b.name, b.code, b.phone, b.email]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time) *
        (filter === "past" ? -1 : 1),
    );
  function status(code: string, status: BookingStatus) {
    const next = bookings();
    const b = next.find((b) => b.code === code);
    if (b) {
      b.status = status;
      if (status === "pagada" && !b.paid) b.paid = b.due;
    }
    try {
      writeStored(KEYS.bookings, next);
      setTick((v) => v + 1);
      notify("Estado de reserva actualizado.");
    } catch {
      notify("No se pudo guardar el estado.");
    }
  }
  function csv() {
    const keys: (keyof Booking)[] = [
      "code",
      "date",
      "time",
      "svcEs",
      "opt",
      "persons",
      "name",
      "phone",
      "email",
      "level",
      "classLang",
      "method",
      "currency",
      "total",
      "due",
      "paid",
      "status",
      "notes",
      "createdAt",
      "demo",
    ];
    const esc = (v: unknown) =>
      '"' + String(v ?? "").replaceAll('"', '""') + '"';
    const safe = (v: unknown) =>
      typeof v === "string" && /^[=+@\-\t\r]/.test(v) ? "'" + v : v;
    download(
      "reservas-evolushon-" + today + ".csv",
      "\ufeff" +
        [
          keys.join(","),
          ...all.map((b) => keys.map((k) => esc(safe(b[k]))).join(",")),
        ].join("\n"),
      "text/csv",
    );
  }
  const paid = all
    .filter((b) => b.status === "pagada" || b.status === "completada")
    .reduce<
      Record<string, number>
    >((a, b) => ({ ...a, [b.currency]: (a[b.currency] || 0) + b.paid }), {});
  return (
    <div className="admin-content">
      <div className="admin-stats">
        {[
          {
            label: "Hoy",
            value: all.filter(
              (b) => b.date === today && b.status !== "cancelada",
            ).length,
            sub: "clases y trips",
            filter: "upcoming",
          },
          {
            label: "Próximos 7 días",
            value: all.filter(
              (b) =>
                b.date >= today &&
                b.date <= isoDate(new Date(Date.now() + 7 * 864e5)) &&
                b.status !== "cancelada",
            ).length,
            sub: "reservas",
            filter: "upcoming",
          },
          {
            label: "Por verificar",
            value: all.filter((b) => b.status === "por verificar").length,
            sub: "pagos Yape / Plin",
            filter: "verify",
          },
          {
            label: "Cobrado (demo)",
            value:
              Object.entries(paid)
                .map(([c, n]) => money(c, n))
                .join(" · ") || "0",
            sub: "pagos simulados confirmados",
            filter: "paid",
          },
        ].map((s) => (
          <button key={s.label} onClick={() => setFilter(s.filter)}>
            <small>{s.label}</small>
            <strong>{s.value}</strong>
            <span>{s.sub}</span>
          </button>
        ))}
      </div>
      <div className="admin-heading">
        <div className="chips">
          {filters.map((f) => (
            <button
              key={f.id}
              className={f.id === filter ? "active" : ""}
              onClick={() => setFilter(f.id)}
            >
              {f.label} {all.filter(f.fn).length}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="admin-btn" onClick={csv}>
            <IconDownload size={17} />
            Exportar CSV
          </button>
          {canConfigure && (
            <button className="admin-btn" onClick={() => setConfig(!config)}>
              {config ? "Cerrar configuración" : "Configurar reservas"}
            </button>
          )}
        </div>
      </div>
      {config && canConfigure && (
        <Panel title="Configuración de reservas">
          <div className="form-grid">
            {(["surf", "surfskate"] as const).map((c) => (
              <Field
                key={c}
                label={"Horarios " + c + " (separados por coma)"}
                value={cfg.slots[c].join(", ")}
                onChange={(v) =>
                  update((d) => {
                    d.settings.booking.slots[c] = v
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                  })
                }
              />
            ))}
            {CATS.map((c) => (
              <Field
                key={c}
                label={"Cupos " + c}
                type="number"
                min="1"
                value={cfg.capacity[c]}
                onChange={(v) =>
                  update((d) => {
                    d.settings.booking.capacity[c] = Math.max(1, Number(v));
                  })
                }
              />
            ))}
            <Field
              label="Anticipación mínima (días)"
              type="number"
              min="0"
              value={cfg.lead}
              onChange={(v) =>
                update((d) => {
                  d.settings.booking.lead = Math.max(0, Number(v));
                })
              }
            />
            <Field
              label="Máximo de días a futuro"
              type="number"
              min="1"
              value={cfg.maxDays}
              onChange={(v) =>
                update((d) => {
                  d.settings.booking.maxDays = Math.max(1, Number(v));
                })
              }
            />
            <Field
              label="Adelanto (%)"
              type="number"
              min="0"
              max="100"
              value={cfg.deposit}
              onChange={(v) =>
                update((d) => {
                  d.settings.booking.deposit = Math.max(
                    0,
                    Math.min(100, Number(v)),
                  );
                })
              }
            />
          </div>
          {(["tripDays", "closedDays"] as const).map((k) => (
            <div key={k}>
              <h3>
                {k === "tripDays" ? "Días de salida de trips" : "Días cerrados"}
              </h3>
              <div className="day-chips">
                {["D", "L", "M", "X", "J", "V", "S"].map((v, i) => (
                  <button
                    key={i}
                    className={cfg[k].includes(i) ? "active" : ""}
                    onClick={() =>
                      update((d) => {
                        const c = d.settings.booking;
                        c[k] = c[k].includes(i)
                          ? c[k].filter((n) => n !== i)
                          : [...c[k], i];
                      })
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3>Fechas bloqueadas</h3>
            <div className="actions">
              <input
                type="date"
                aria-label="Fecha a bloquear"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
              <button
                className="admin-btn"
                disabled={!block}
                onClick={() => {
                  update((d) => {
                    d.settings.booking.blocked = [
                      ...new Set([...cfg.blocked, block]),
                    ].sort();
                  });
                  setBlock("");
                }}
              >
                Bloquear
              </button>
            </div>
            <div className="actions">
              {cfg.blocked.map((v) => (
                <button
                  className="admin-btn"
                  key={v}
                  onClick={() =>
                    update((d) => {
                      d.settings.booking.blocked =
                        d.settings.booking.blocked.filter((x) => x !== v);
                    })
                  }
                >
                  {v} ×
                </button>
              ))}
            </div>
          </div>
          <h3>Métodos de pago (demo)</h3>
          <div className="actions">
            {(["card", "yape", "plin"] as const).map((m) => (
              <Check
                key={m}
                label={
                  m === "card" ? "Tarjeta" : m === "yape" ? "Yape" : "Plin"
                }
                checked={cfg.methods[m]}
                onChange={(v) =>
                  update((d) => {
                    d.settings.booking.methods[m] = v;
                  })
                }
              />
            ))}
          </div>
          <div className="form-grid">
            <Field
              label="Número Yape"
              value={cfg.yape}
              onChange={(v) =>
                update((d) => {
                  d.settings.booking.yape = v;
                })
              }
            />
            <Field
              label="Número Plin"
              value={cfg.plin}
              onChange={(v) =>
                update((d) => {
                  d.settings.booking.plin = v;
                })
              }
            />
          </div>
          <p className="muted">
            Todos los pagos son simulados y las reservas viven solo en este
            navegador.
          </p>
        </Panel>
      )}
      <input
        type="search"
        aria-label="Buscar reservas"
        placeholder="Buscar por nombre, código, teléfono o correo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!rows.length && (
        <Panel>
          <p className="muted">
            {all.length
              ? "No hay reservas con este filtro."
              : "Aún no hay reservas. Cuando un cliente reserve desde el sitio aparecerá aquí."}
          </p>
        </Panel>
      )}
      {rows.map((b) => (
        <article className="booking-row" key={b.code}>
          <div className="booking-date">
            <small>
              {new Date(b.date + "T12:00:00").toLocaleDateString("es-PE", {
                month: "short",
              })}
            </small>
            <strong>{Number(b.date.slice(-2))}</strong>
            <span>{b.time}</span>
          </div>
          <div className="booking-info">
            <div className="actions">
              <b>{b.name}</b>
              <small className="status">{b.code}</small>
              <small className="badge">Demo</small>
            </div>
            <p>
              {b.svcEs || b.svc} ·{" "}
              {b.opt === "single"
                ? "Clase suelta"
                : "Paquete " + b.opt + " clases"}{" "}
              · {b.persons} personas
            </p>
            <p className="muted">
              {b.phone} · {b.email}
            </p>
            <p className="muted">
              {b.level} · clase en {b.classLang.toUpperCase()}
            </p>
            {b.notes && <p>{b.notes}</p>}
          </div>
          <div className="booking-payment">
            <b>{money(b.currency, b.total)}</b>
            <small>
              {b.paid ? "Pagado " : "Adelanto "}
              {money(b.currency, b.paid || b.due)} · {b.method}
            </small>
            <select
              aria-label={"Estado de " + b.code}
              value={b.status}
              onChange={(e) => status(b.code, e.target.value as BookingStatus)}
            >
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="actions">
              {(b.status === "pendiente" || b.status === "por verificar") && (
                <button
                  className="admin-btn primary"
                  onClick={() => status(b.code, "pagada")}
                >
                  Confirmar pago
                </button>
              )}
              <a
                className="admin-btn"
                href={
                  "https://wa.me/" +
                  b.phone.replace(/\D/g, "") +
                  "?text=" +
                  encodeURIComponent(
                    "Hola " +
                      b.name.split(" ")[0] +
                      ", te escribimos de Evolushon por tu reserva " +
                      b.code +
                      " (" +
                      (b.svcEs || b.svc) +
                      ", " +
                      b.date +
                      " " +
                      b.time +
                      ").",
                  )
                }
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandWhatsapp size={17} />
                WhatsApp
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
