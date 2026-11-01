import type { SiteData } from "./types.js";
export function diff(d: SiteData, l: SiteData) {
  const count = (a: { id: string }[], b: { id: string }[]) =>
    new Set([...a, ...b].map((v) => v.id)).size -
    [...new Set([...a, ...b].map((v) => v.id))].filter(
      (id) =>
        JSON.stringify(a.find((v) => v.id === id)) ===
        JSON.stringify(b.find((v) => v.id === id)),
    ).length;
  const services = count(d.services, l.services),
    gallery = count(d.gallery, l.gallery),
    other =
      ["home", "settings", "albums", "reviews"].filter(
        (k) =>
          JSON.stringify(d[k as keyof SiteData]) !==
          JSON.stringify(l[k as keyof SiteData]),
      ).length +
      Number(
        d.services.map((s) => s.id).join() !==
          l.services.map((s) => s.id).join(),
      ) +
      Number(
        d.gallery.map((g) => g.id).join() !== l.gallery.map((g) => g.id).join(),
      );
  return { services, gallery, other, total: services + gallery + other };
}
