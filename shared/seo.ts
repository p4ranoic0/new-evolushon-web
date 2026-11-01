import { SEO_DEFAULTS } from "./seo-defaults.js";
import { effectivePrice, LANGS, pathFor, tr } from "./index.js";
import type { SiteData, Lang, Page, Service } from "./types.js";
export function seoFor(data: SiteData, lang: Lang, page: Page, service?: Service, publicUrl?: string) {
  const domain = (
    publicUrl || data.settings.domain || "https://evolushonsurfexperience.com"
  ).replace(/\/$/, "");
  const defaults = SEO_DEFAULTS[page][lang];
  const ov = data.settings.seo[page]?.[lang];
  const title = service
    ? tr(service.seo.title, lang) || tr(service.name, lang) + " | Evolushon"
    : ov?.title || defaults[0];
  const desc = service
    ? tr(service.seo.desc, lang) || tr(service.desc, lang)
    : ov?.desc || defaults[1];
  const url = domain + pathFor(lang, page, service);
  const image = domain + "/og-image.jpg";
  const ld = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    "@id": domain + "/#business",
    name: "Evolushon Surf Experience",
    url: domain,
    logo: domain + "/logo.png",
    image,
    description: SEO_DEFAULTS.home[lang][1],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressCountry: "PE",
    },
    areaServed: [
      "Costa Verde, Lima",
      "Sur Chico, Lima",
      "Punta Hermosa",
      "San Bartolo",
      "Puerto Viejo",
      "Bermejo",
    ],
    knowsLanguage: LANGS,
    sameAs: [data.settings.instagram, data.settings.tiktok].filter(Boolean),
    telephone: data.settings.whatsapp
      ? "+" + data.settings.whatsapp.replace(/\D/g, "")
      : undefined,
    makesOffer: data.services
      .filter((s) => s.active)
      .map((s) => ({
        "@type": "Offer",
        name: tr(s.name, lang),
        description: tr(s.seo.desc, lang) || tr(s.desc, lang),
        url: domain + pathFor(lang, "services", s),
        ...(effectivePrice(s) != null
          ? {
              price: String(effectivePrice(s)),
              priceCurrency: s.currency === "$" ? "USD" : "PEN",
            }
          : {}),
        itemOffered:
          s.cat === "trip"
            ? {
                "@type": "TouristTrip",
                name: tr(s.name, lang),
                touristType: "Surf",
              }
            : {
                "@type": "Service",
                name: tr(s.name, lang),
                serviceType:
                  s.cat === "surf" ? "Surf lessons" : "Surfskate lessons",
              },
      })),
  };
  return { title, desc, url, image, ld, domain, lang, page, service };
}
