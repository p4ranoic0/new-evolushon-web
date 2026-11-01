export type Lang = "es" | "en" | "fr" | "de";
export type Localized<T = string> = Record<Lang, T>;
export type Category = "surf" | "surfskate" | "trip";
export type Page = "home" | "services" | "gallery" | "contact";
export type PaymentMethod = "card" | "yape" | "plin";
export type BookingStatus =
  | "pendiente"
  | "por verificar"
  | "pagada"
  | "completada"
  | "cancelada";
export interface Service {
  id: string;
  cat: Category;
  active: boolean;
  cover: string;
  coverFocus: string;
  currency: string;
  price: number | null;
  packages: { n: number; price: number }[];
  name: Localized;
  desc: Localized;
  duration: Localized;
  distance: Localized;
  includes: Localized<string[]>;
  excludes: Localized<string[]>;
  bring: Localized<string[]>;
  depart?: string;
  ret?: string;
  minPeople?: number;
  seo: { title: Localized; desc: Localized; slug: string };
  offer: {
    on: boolean;
    price: number | null;
    from: string;
    to: string;
    label: Localized;
  };
}
export interface Photo {
  id: string;
  src: string;
  album: string;
  featured: boolean;
  hidden: boolean;
  alt: Localized;
  focus: string;
  originalBytes?: number;
  bytes?: number;
}
export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  sample?: boolean;
  hidden: boolean;
  text: Localized;
}
export interface User {
  name: string;
  user: string;
  pass: string;
  role: "admin" | "editor" | "fotografo";
}
export interface BookingConfig {
  slots: { surf: string[]; surfskate: string[] };
  capacity: Record<Category, number>;
  tripDays: number[];
  closedDays: number[];
  blocked: string[];
  deposit: number;
  lead: number;
  maxDays: number;
  methods: Record<PaymentMethod, boolean>;
  yape: string;
  plin: string;
}
export interface Settings {
  whatsapp: string;
  waLink: string;
  instagram: string;
  tiktok: string;
  domain: string;
  users: User[];
  booking: BookingConfig;
  img: { preset: "max" | "balanced" | "light"; format: "webp" | "jpeg" };
  reviews: {
    placeUrl: string;
    writeUrl: string;
    rating: number | null;
    count: number | null;
  };
  seo: Partial<
    Record<Page, Partial<Record<Lang, { title: string; desc: string }>>>
  >;
}
export interface SiteData {
  settings: Settings;
  services: Service[];
  gallery: Photo[];
  reviews: Review[];
  albums: { id: string; name: Localized }[];
  home: Record<string, Localized>;
}
export interface Booking {
  code: string;
  sid: string;
  svc: string;
  svcEs: string;
  cat: Category;
  opt: "single" | number;
  persons: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  classLang: Lang;
  notes: string;
  method: PaymentMethod;
  currency: string;
  total: number;
  due: number;
  paid: number;
  status: BookingStatus;
  createdAt: string;
  lang: Lang;
  demo?: boolean;
}
export interface HistoryEntry {
  at: string;
  by: string;
  summary: { services: number; gallery: number; other: number };
  snap: Pick<SiteData, "services" | "home" | "settings" | "albums"> &
    Partial<Pick<SiteData, "gallery" | "reviews">>;
}
