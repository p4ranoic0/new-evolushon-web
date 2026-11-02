import { SEED } from "./seed.js";
import { UI } from "./ui.js";
import type {
  BookingConfig,
  Lang,
  Localized,
  Page,
  Service,
  SiteData,
} from "./types.js";
export { PUBLIC_UI } from "./public-ui.js";
export { UI } from "./ui.js";
export { BOOKING_UI } from "./booking-ui.js";
export type * from "./types.js";
export const LANGS: Lang[] = ["es", "en", "fr", "de"];
export const CATS = ["surf", "surfskate", "trip"] as const;
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
  methods: { card: false, yape: true, plin: true },
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
  delete (d.settings as unknown as Record<string, unknown>).users;
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
  d.reviews ||= [];
  d.reviews.forEach((r) => {
    r.text = { ...blank(), ...r.text };
    r.hidden = !!r.hidden;
    r.source ??= "manual";
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
export const DEFAULT = migrate(SEED);
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
