import { useSyncExternalStore } from "react";
import { SEED } from "./seed";
import { UI } from "./ui";
import { SAMPLE_REVIEWS } from "./reviews";
import type {
  Booking,
  BookingConfig,
  HistoryEntry,
  Lang,
  Localized,
  Page,
  Service,
  SiteData,
} from "./types";
export { PUBLIC_UI } from "./public-ui";
export { UI } from "./ui";
export { BOOKING_UI } from "./booking-ui";
export type * from "./types";
export const LANGS: Lang[] = ["es", "en", "fr", "de"];
export const CATS = ["surf", "surfskate", "trip"] as const;
export const KEYS = {
  data: "evolushon-data-v1",
  bookings: "evolushon-bookings-v1",
  draft: "evolushon-draft-v1",
  history: "evolushon-history-v1",
} as const;
export const blank = (): Localized => ({ es: "", en: "", fr: "", de: "" });
export const blankList = (): Localized<string[]> => ({
  es: [],
  en: [],
  fr: [],
  de: [],
});
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));
export function tr<T extends string | string[]>(
  field: Partial<Localized<T>> | undefined,
  lang: Lang,
): T {
  const v = field?.[lang];
  return (
    Array.isArray(v) ? (v.length ? v : field?.es || []) : v || field?.es || ""
  ) as T;
}
export function money(cur: string, n: number | string | null | undefined) {
  return n == null || n === ""
    ? null
    : cur + " " + Number(n).toLocaleString("es-PE");
}
export function waUrl(
  settings: Pick<SiteData["settings"], "whatsapp" | "waLink">,
  text: string,
) {
  const num = (settings.whatsapp || "").replace(/\D/g, "");
  // El prototipo no trae número; conserva el enlace corto configurado hasta definirlo.
  return num
    ? "https://wa.me/" + num + "?text=" + encodeURIComponent(text)
    : (settings.waLink || "https://wa.me/") +
        (settings.waLink?.includes("?") ? "&" : "?") +
        "text=" +
        encodeURIComponent(text);
}
export const bookingDefaults: BookingConfig = {
  slots: {
    surf: ["07:00", "09:00", "11:00", "15:00"],
    surfskate: ["10:00", "16:00"],
  },
  capacity: { surf: 6, surfskate: 6, trip: 12 },
  tripDays: [6, 0],
  closedDays: [],
  blocked: [],
  deposit: 50,
  lead: 1,
  maxDays: 60,
  methods: { card: true, yape: true, plin: true },
  yape: "",
  plin: "",
};
export function migrate(input: unknown): SiteData {
  const d = clone(input) as SiteData;
  if (!d || !Array.isArray(d.services) || !Array.isArray(d.gallery))
    throw new Error("Formato inválido: se requieren services y gallery.");
  d.settings = Object.assign(
    {},
    SEED.settings,
    { domain: "https://evolushonsurfexperience.com" },
    d.settings,
  ) as SiteData["settings"];
  d.settings.users ||= [
    { name: "Administrador", user: "admin", pass: "evolushon", role: "admin" },
    { name: "Equipo", user: "editor", pass: "editor", role: "editor" },
    { name: "Fotógrafo", user: "foto", pass: "foto", role: "fotografo" },
  ];
  d.settings.booking = {
    ...clone(bookingDefaults),
    ...d.settings.booking,
    slots: { ...bookingDefaults.slots, ...d.settings.booking?.slots },
    capacity: { ...bookingDefaults.capacity, ...d.settings.booking?.capacity },
    methods: { ...bookingDefaults.methods, ...d.settings.booking?.methods },
  };
  d.settings.img ||= { preset: "balanced", format: "webp" };
  d.settings.reviews ||= {
    placeUrl: "",
    writeUrl: "",
    rating: null,
    count: null,
  };
  d.settings.seo ||= {};
  d.albums ||= ["sesiones", "lifestyle", "surfskate", "trips"].map((id) => ({
    id,
    name: Object.fromEntries(
      LANGS.map((l) => [l, UI[l][id as "sesiones"] || id]),
    ) as Localized,
  }));
  d.home ||= {};
  d.reviews ||= clone(SAMPLE_REVIEWS) as ReviewSeed[] as SiteData["reviews"];
  d.reviews.forEach((r) => {
    r.text = { ...blank(), ...r.text };
    r.hidden = !!r.hidden;
  });
  d.services.forEach((s) => {
    s.seo = Object.assign({ title: blank(), desc: blank(), slug: "" }, s.seo);
    s.offer = Object.assign(
      { on: false, price: null, from: "", to: "", label: blank() },
      s.offer,
    );
    s.offer.label = { ...blank(), ...s.offer.label };
    s.name = { ...blank(), ...s.name };
    s.desc = { ...blank(), ...s.desc };
    s.duration = { ...blank(), ...s.duration };
    s.distance = { ...blank(), ...s.distance };
    s.includes = { ...blankList(), ...s.includes };
    s.excludes = { ...blankList(), ...s.excludes };
    s.bring = { ...blankList(), ...s.bring };
    s.packages ||= [];
    s.coverFocus ||= "50% 50%";
  });
  d.gallery.forEach((g) => {
    g.alt = { ...blank(), ...g.alt };
    g.focus ||= "50% 50%";
  });
  return d;
}
type ReviewSeed = (typeof SAMPLE_REVIEWS)[number];
export const DEFAULT = migrate(SEED);
export function readStored<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}
const subs = new Set<() => void>();
let cached: SiteData | undefined;
export function load(): SiteData {
  if (!cached) {
    try {
      cached = migrate(readStored(KEYS.data, DEFAULT));
    } catch {
      cached = clone(DEFAULT);
    }
  }
  return cached;
}
export function writeStored(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("evo-storage", { detail: key }));
}
export function save(d: SiteData) {
  localStorage.setItem(KEYS.data, JSON.stringify(d));
  cached = clone(d);
  subs.forEach((f) => f());
  window.dispatchEvent(new CustomEvent("evo-storage", { detail: KEYS.data }));
}
export function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
window.addEventListener("storage", (e) => {
  if (e.key === KEYS.data || e.key === null) {
    cached = undefined;
    subs.forEach((f) => f());
  }
});
export function useSiteData() {
  return useSyncExternalStore(subscribe, load, load);
}
export function uiFor(
  d: SiteData,
  lang: Lang,
): Record<keyof typeof UI.es, string> {
  const ui = { ...UI[lang] };
  for (const k of Object.keys(d.home)) {
    if (k in ui)
      ui[k as keyof typeof ui] =
        tr(d.home[k], lang) || ui[k as keyof typeof ui];
  }
  return ui;
}
export const slugs: Record<Exclude<Page, "home">, Record<Lang, string>> = {
  services: { es: "servicios", en: "services", fr: "services", de: "angebote" },
  gallery: { es: "galeria", en: "gallery", fr: "galerie", de: "galerie" },
  contact: { es: "contacto", en: "contact", fr: "contact", de: "kontakt" },
};
export function pathFor(lang: Lang, page: Page = "home", s?: Service) {
  return (
    "/" +
    lang +
    "/" +
    (page === "home" ? "" : slugs[page][lang]) +
    (s ? "/" + (s.seo.slug || s.id) : "")
  );
}
const assets = import.meta.glob("../assets/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export function asset(path: string) {
  if (
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    /^https:\/\//.test(path)
  )
    return path;
  return assets["../assets/" + path.replace(/^.*src\/assets\//, "")] || "";
}
export function isoDate(d = new Date()) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
export function offerOn(s: Service) {
  const t = isoDate();
  return (
    s.offer.on &&
    s.offer.price != null &&
    (!s.offer.from || s.offer.from <= t) &&
    (!s.offer.to || s.offer.to >= t)
  );
}
export function effectivePrice(s: Service) {
  return offerOn(s) ? s.offer.price : s.price;
}
export function fmt(s: string, values: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (m, k) => String(values[k] ?? m));
}
export function bookings() {
  return readStored<Booking[]>(KEYS.bookings, []);
}
export function history() {
  return readStored<HistoryEntry[]>(KEYS.history, []);
}
export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
