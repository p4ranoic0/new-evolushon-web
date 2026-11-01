import { useCallback, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLock,
  IconX,
  IconBrandWhatsapp,
  IconCalendarPlus,
} from "@tabler/icons-react";
import { Modal } from "./Modal";
import {
  asset,
  BOOKING_UI,
  bookings,
  download,
  effectivePrice,
  fmt,
  isoDate,
  KEYS,
  LANGS,
  money,
  tr,
  uiFor,
  waUrl,
  writeStored,
} from "../store";
import type {
  Booking as BookingRecord,
  Lang,
  PaymentMethod,
  Service,
  SiteData,
} from "../store";
export function Booking({
  data,
  lang,
  service: s,
  option = "single",
  onClose,
}: {
  data: SiteData;
  lang: Lang;
  service: Service;
  option?: "single" | number;
  onClose: () => void;
}) {
  const t = BOOKING_UI[lang],
    ui = uiFor(data, lang),
    cfg = data.settings.booking;
  const [step, setStep] = useState(1),
    [opt, setOpt] = useState(option),
    [persons, setPersons] = useState(1),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [month, setMonth] = useState(0);
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [phone, setPhone] = useState(""),
    [level, setLevel] = useState("beginner"),
    [classLang, setClassLang] = useState<Lang>(lang),
    [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">(""),
    [full, setFull] = useState(false),
    [card, setCard] = useState(""),
    [exp, setExp] = useState(""),
    [cvc, setCvc] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState<BookingRecord | null>(null);
  const close = useCallback(() => onClose(), [onClose]);
  const trip = s.cat === "trip",
    cap = cfg.capacity[s.cat],
    unit =
      opt === "single"
        ? effectivePrice(s)
        : s.packages.find((p) => p.n === opt)?.price;
  const total = (unit || 0) * persons,
    due =
      full || !cfg.deposit ? total : Math.round((total * cfg.deposit) / 100),
    m = (n: number | null | undefined) => money(s.currency, n);
  const all = bookings().filter((b) => b.status !== "cancelada");
  const slots = trip
    ? [s.depart || "07:00 AM"]
    : cfg.slots[s.cat as "surf" | "surfskate"];
  const left = (d: string, t: string) =>
    cap -
    all
      .filter((b) => b.date === d && b.time === t && b.cat === s.cat)
      .reduce((a, b) => a + b.persons, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = new Date(today);
  min.setDate(min.getDate() + cfg.lead);
  const max = new Date(today);
  max.setDate(max.getDate() + cfg.maxDays);
  const available = (dt: Date) => {
    const k = isoDate(dt);
    return (
      dt >= min &&
      dt <= max &&
      !cfg.blocked.includes(k) &&
      !cfg.closedDays.includes(dt.getDay()) &&
      (!trip || cfg.tripDays.includes(dt.getDay())) &&
      slots.some((t) => left(k, t) >= persons)
    );
  };
  const start = new Date(today.getFullYear(), today.getMonth() + month, 1),
    offset = (start.getDay() + 6) % 7,
    days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const optLabel =
    opt === "single"
      ? trip
        ? t.singleTrip
        : t.single
      : fmt(t.pack, { n: opt });
  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString(lang, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";
  const valid =
    step === 1
      ? total > 0 && persons <= cap
      : step === 2
        ? !!(
            date &&
            time &&
            available(new Date(date + "T00:00:00")) &&
            left(date, time) >= persons
          )
        : step === 3
          ? !!(
              name.trim() &&
              /.+@.+\..+/.test(email) &&
              phone.replace(/\D/g, "").length >= 7
            )
          : !!method &&
            (method !== "card" ||
              (card.replace(/\D/g, "").length >= 15 &&
                /^\d\d\/\d\d$/.test(exp) &&
                /^\d{3,4}$/.test(cvc)));
  function next() {
    setError("");
    if (!valid) {
      setError(step === 3 ? t.fillAll : t.noSlots);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    if (
      !available(new Date(date + "T00:00:00")) ||
      left(date, time) < persons
    ) {
      setStep(2);
      setTime("");
      setError(t.full);
      return;
    }
    const b: BookingRecord = {
      code: "EVO-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
      sid: s.id,
      svc: tr(s.name, lang),
      svcEs: s.name.es,
      cat: s.cat,
      opt,
      persons,
      date,
      time,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      level,
      classLang,
      notes,
      method: method as PaymentMethod,
      currency: s.currency,
      total,
      due,
      paid: method === "card" ? due : 0,
      status: method === "card" ? "pagada" : "por verificar",
      createdAt: new Date().toISOString(),
      lang,
      demo: true,
    };
    try {
      writeStored(KEYS.bookings, [b, ...bookings()]);
      setDone(b);
      setStep(5);
      setCard("");
      setCvc("");
      setExp("");
    } catch {
      setError(
        {
          es: "No se pudo guardar la reserva. No hay espacio en el navegador.",
          en: "Unable to save. Browser storage is full.",
          fr: "Stockage du navigateur plein.",
          de: "Browserspeicher voll.",
        }[lang],
      );
    }
  }
  const wa = waUrl(
    data.settings,
    ui.waMsg +
      tr(s.name, lang) +
      " · " +
      optLabel +
      " · " +
      dateLabel +
      " " +
      time +
      " · " +
      persons +
      " · " +
      t.code +
      " " +
      (done?.code || ""),
  );
  function calendar() {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let hh = Number(match?.[1] || 7);
    if (match?.[3]?.toUpperCase() === "PM" && hh < 12) hh += 12;
    if (match?.[3]?.toUpperCase() === "AM" && hh === 12) hh = 0;
    const stamp =
      date.replaceAll("-", "") +
      "T" +
      String(hh).padStart(2, "0") +
      (match?.[2] || "00") +
      "00";
    const end =
      date.replaceAll("-", "") +
      "T" +
      String(Math.min(23, hh + 2)).padStart(2, "0") +
      (match?.[2] || "00") +
      "00";
    const esc = (x: string) =>
      x
        .replaceAll("\\", "\\\\")
        .replaceAll("\n", "\\n")
        .replaceAll(",", "\\,")
        .replaceAll(";", "\\;");
    download(
      done!.code + ".ics",
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Evolushon//ES",
        "BEGIN:VEVENT",
        "UID:" + done!.code + "@evolushon",
        "DTSTAMP:" +
          new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, ""),
        "DTSTART;TZID=America/Lima:" + stamp,
        "DTEND;TZID=America/Lima:" + end,
        "SUMMARY:" + esc(tr(s.name, lang) + " · Evolushon"),
        "DESCRIPTION:" + t.code + " " + done!.code,
        "LOCATION:Lima\\, Perú",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n"),
      "text/calendar",
    );
  }
  return (
    <Modal onClose={close} label={t.reserve} className="booking-modal">
      <button
        className="round modal-close"
        onClick={close}
        aria-label={ui.close}
      >
        <IconX />
      </button>
      <div className="booking-layout">
        <aside className="booking-summary">
          <img
            src={asset(s.cover)}
            alt=""
            style={{ objectPosition: s.coverFocus }}
          />
          <div className="p-6 flex flex-col gap-4">
            <span className="eyebrow">{ui[s.cat]}</span>
            <h2>{tr(s.name, lang)}</h2>
            <dl>
              <dt>{t.option2}</dt>
              <dd>{optLabel}</dd>
              <dt>{t.persons}</dt>
              <dd>{persons}</dd>
              {date && (
                <>
                  <dt>{t.date}</dt>
                  <dd>{dateLabel}</dd>
                </>
              )}
              {time && (
                <>
                  <dt>{t.hour}</dt>
                  <dd>{time}</dd>
                </>
              )}
            </dl>
            <div className="summary-total">
              <span>{t.total}</span>
              <strong>{m(total)}</strong>
            </div>
            {due < total && (
              <div className="summary-total">
                <span>{t.due}</span>
                <strong>{m(due)}</strong>
              </div>
            )}
            <p className="demo-note">
              <IconLock size={16} />
              {t.demo}
            </p>
          </div>
        </aside>
        <div className="booking-main">
          {step < 5 && (
            <ol className="steps">
              {t.steps.map((v, i) => (
                <li
                  key={v}
                  className={
                    step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
                  }
                >
                  <span>{step > i + 1 ? <IconCheck size={14} /> : i + 1}</span>
                  <b>{v}</b>
                </li>
              ))}
            </ol>
          )}
          <div className="booking-content">
            {step === 1 && (
              <>
                <h3>{t.option}</h3>
                {[
                  { n: "single" as const, price: effectivePrice(s) },
                  ...(!trip ? s.packages : []),
                ].map((p) => (
                  <button
                    key={p.n}
                    className={"option " + (opt === p.n ? "selected" : "")}
                    onClick={() => setOpt(p.n)}
                  >
                    <span>
                      <strong>
                        {p.n === "single"
                          ? trip
                            ? t.singleTrip
                            : t.single
                          : fmt(t.pack, { n: p.n })}
                      </strong>
                      <small>
                        {p.n === "single"
                          ? t.personsNote
                          : fmt(t.packSub, {
                              x: m(Math.round((p.price || 0) / p.n)) || "",
                            })}
                      </small>
                    </span>
                    <b>{m(p.price)}</b>
                  </button>
                ))}
                <div className="persons">
                  <div>
                    <b>{t.persons}</b>
                    <small>
                      {trip
                        ? fmt(t.minTrip, { n: s.minPeople || 1 })
                        : t.personsNote}
                    </small>
                  </div>
                  <button
                    className="round"
                    disabled={persons <= 1}
                    onClick={() => {
                      setPersons(persons - 1);
                      setTime("");
                    }}
                  >
                    −
                  </button>
                  <strong>{persons}</strong>
                  <button
                    className="round"
                    disabled={persons >= cap}
                    onClick={() => {
                      setPersons(persons + 1);
                      setTime("");
                    }}
                  >
                    +
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="calendar-title">
                  <button
                    className="round"
                    aria-label={t.back}
                    disabled={!month}
                    onClick={() => setMonth(month - 1)}
                  >
                    <IconChevronLeft />
                  </button>
                  <h3>
                    {start.toLocaleDateString(lang, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    className="round"
                    aria-label={t.next}
                    disabled={month >= Math.ceil(cfg.maxDays / 28)}
                    onClick={() => setMonth(month + 1)}
                  >
                    <IconChevronRight />
                  </button>
                </div>
                <div className="calendar">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <span key={"w" + i}>
                      {new Date(2024, 0, i)
                        .toLocaleDateString(lang, { weekday: "short" })
                        .slice(0, 2)}
                    </span>
                  ))}
                  {Array.from({ length: offset }, (_, i) => (
                    <span key={"o" + i} />
                  ))}
                  {Array.from({ length: days }, (_, i) => {
                    const dt = new Date(
                        start.getFullYear(),
                        start.getMonth(),
                        i + 1,
                      ),
                      k = isoDate(dt);
                    return (
                      <button
                        key={k}
                        disabled={!available(dt)}
                        className={k === date ? "selected" : ""}
                        aria-label={k}
                        onClick={() => {
                          setDate(k);
                          setTime("");
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="muted">
                  {(trip ? t.tripNote + " " : "") +
                    fmt(t.calNote, { n: cfg.lead })}
                </p>
                <h3>{trip ? t.depart : t.time}</h3>
                {!date ? (
                  <p>{t.noSlots}</p>
                ) : (
                  <div className="slots">
                    {slots.map((v) => (
                      <button
                        key={v}
                        className={"option " + (v === time ? "selected" : "")}
                        disabled={left(date, v) < persons}
                        onClick={() => setTime(v)}
                      >
                        {v}
                        <small>
                          {left(date, v) < persons
                            ? t.full
                            : fmt(t.left, { n: left(date, v) })}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {step === 3 && (
              <div className="form-grid">
                <label className="span-2">
                  {t.name}
                  <input
                    value={name}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {t.email}
                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {t.phone}
                  <input
                    type="tel"
                    value={phone}
                    autoComplete="tel"
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {t.level}
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    {t.levels.map((v, i) => (
                      <option
                        key={v}
                        value={["beginner", "intermediate", "advanced"][i]}
                      >
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t.classLang}
                  <select
                    value={classLang}
                    onChange={(e) => setClassLang(e.target.value as Lang)}
                  >
                    {LANGS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  {t.notes}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>
            )}
            {step === 4 && (
              <>
                <p className="demo-note">{t.demo}</p>
                {cfg.deposit > 0 && cfg.deposit < 100 && (
                  <div className="pay-modes">
                    {[false, true].map((v) => (
                      <button
                        key={String(v)}
                        className={"option " + (full === v ? "selected" : "")}
                        onClick={() => setFull(v)}
                      >
                        <strong>
                          {v ? t.fullPay : fmt(t.deposit, { p: cfg.deposit })}
                        </strong>
                        <small>
                          {fmt(v ? t.fullSub : t.depositSub, {
                            x:
                              m(
                                v
                                  ? total
                                  : Math.round((total * cfg.deposit) / 100),
                              ) || "",
                          })}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
                <h3>{t.method}</h3>
                <div className="chips">
                  {(["card", "yape", "plin"] as const)
                    .filter((v) => cfg.methods[v])
                    .map((v) => (
                      <button
                        key={v}
                        className={method === v ? "active" : ""}
                        onClick={() => setMethod(v)}
                      >
                        {v === "card" ? t.card : v === "yape" ? "Yape" : "Plin"}
                      </button>
                    ))}
                </div>
                {method === "card" && (
                  <div className="form-grid">
                    <label className="span-2">
                      {t.cardNum}
                      <input
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        autoComplete="off"
                        value={card}
                        onChange={(e) =>
                          setCard(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(\d{4})(?=\d)/g, "$1 "),
                          )
                        }
                      />
                    </label>
                    <label>
                      {t.exp}
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="MM/YY"
                        value={exp}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setExp(
                            v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v,
                          );
                        }}
                      />
                    </label>
                    <label>
                      CVC
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                      />
                    </label>
                  </div>
                )}
                {(method === "yape" || method === "plin") && (
                  <div className="wallet">
                    <p>
                      {fmt(t.walletHelp, {
                        x: m(due) || "",
                        m: method === "yape" ? "Yape" : "Plin",
                      })}
                    </p>
                    <strong>
                      {cfg[method] || data.settings.whatsapp || "9XX XXX XXX"}
                    </strong>
                    <p>{t.walletNote}</p>
                  </div>
                )}
              </>
            )}
            {step === 5 && done && (
              <div className="booking-done">
                <span className="done-icon">
                  <IconCheck size={32} />
                </span>
                <h2>{done.status === "pagada" ? t.doneTitle : t.pendTitle}</h2>
                <p>
                  {done.status === "pagada"
                    ? fmt(t.doneSub, { d: dateLabel, t: time })
                    : t.pendSub}
                </p>
                <p className="muted">{t.demo}</p>
                <small>{t.code}</small>
                <strong className="booking-code">{done.code}</strong>
                <a
                  className="btn gold"
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandWhatsapp />
                  {t.sendWa}
                </a>
                <button className="btn outline" onClick={calendar}>
                  <IconCalendarPlus />
                  {t.addCal}
                </button>
              </div>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
          {step < 5 && (
            <div className="booking-actions">
              <button
                className="btn outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <IconArrowLeft size={17} />
                {t.back}
              </button>
              <button
                className={"btn " + (step === 4 ? "gold" : "ink")}
                disabled={!valid}
                onClick={next}
              >
                {step < 4
                  ? t.next
                  : method === "card"
                    ? fmt(t.pay, { x: m(due) || "" })
                    : t.paid}
                {step < 4 ? (
                  <IconArrowRight size={17} />
                ) : (
                  <IconLock size={17} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
