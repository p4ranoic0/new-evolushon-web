import { ASSET_SIZES } from "./asset-sizes";
import type { Photo } from "../store";
export function photoBytes(g: Photo) {
  return g.src.startsWith("data:")
    ? Math.round((g.src.length - g.src.indexOf(",") - 1) * 0.75)
    : ASSET_SIZES[g.src.split("/").pop() || ""] || g.bytes || 0;
}
export const kb = (n: number) =>
  n >= 1048576
    ? (n / 1048576).toFixed(1) + " MB"
    : Math.round(n / 1024) + " KB";
export function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
}
export function missingCount(d: import("../store").SiteData) {
  const langs = ["en", "fr", "de"] as const;
  return (
    d.services.filter((s) => langs.some((l) => !s.name[l] || !s.desc[l]))
      .length +
    d.albums.filter((a) => langs.some((l) => !a.name[l])).length +
    Object.values(d.home).filter((f) => f.es && langs.some((l) => !f[l]))
      .length +
    d.gallery.filter((g) => !g.alt.es || langs.some((l) => !g.alt[l])).length
  );
}
