import { useEffect } from "react";
import { SEO_DEFAULTS } from "../store/seo-defaults";
import { effectivePrice, LANGS, pathFor, tr } from "../store";
import type { Lang, Page, Service, SiteData } from "../store";
export function Seo({
  data,
  lang,
  page,
  service,
}: {
  data: SiteData;
  lang: Lang;
  page: Page;
  service?: Service;
}) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const domain = (
    data.settings.domain || "https://evolushonsurfexperience.com"
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
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index,follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta
        property="og:locale"
        content={{ es: "es_PE", en: "en_US", fr: "fr_FR", de: "de_DE" }[lang]}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
      {LANGS.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={domain + pathFor(l, page, service)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={domain + pathFor("es", page, service)}
      />
      <script id="evo-ld" type="application/ld+json">
        {JSON.stringify(ld).replace(/</g, "\\u003c")}
      </script>
    </>
  );
}
