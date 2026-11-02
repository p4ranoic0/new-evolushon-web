import type { Localized } from "./types.js";
export const PUBLIC_UI: Record<
  "footLine" | "offer" | "sample" | "skip" | "menu" | "notFound" | "backHome" | "reviewsTitle" | "googleReviewsTitle" | "googleAttribution" | "reviewOrigin" | "manualReview",
  Localized
> = {
  reviewsTitle: {es:"Lo que dicen nuestros alumnos",en:"What our students say",fr:"Ce que disent nos élèves",de:"Was unsere Schüler sagen"},
  googleReviewsTitle: {es:"Lo que dicen en Google",en:"What people say on Google",fr:"Ils en parlent sur Google",de:"Was man auf Google sagt"},
  googleAttribution: {es:"Reseñas de Google",en:"Google reviews",fr:"Avis Google",de:"Google-Rezensionen"},
  reviewOrigin: {es:"Ver original",en:"View original",fr:"Voir l’original",de:"Original ansehen"},
  manualReview: {es:"Testimonio",en:"Testimonial",fr:"Témoignage",de:"Erfahrungsbericht"},
  footLine: {
    es: "Nos vemos en el agua.",
    en: "See you in the water.",
    fr: "Rendez-vous dans l’eau.",
    de: "Wir sehen uns im Wasser.",
  },
  offer: { es: "Oferta", en: "Offer", fr: "Offre", de: "Angebot" },
  sample: { es: "Ejemplo", en: "Sample", fr: "Exemple", de: "Beispiel" },
  skip: {
    es: "Ir al contenido",
    en: "Skip to content",
    fr: "Aller au contenu",
    de: "Zum Inhalt",
  },
  menu: { es: "Menú", en: "Menu", fr: "Menu", de: "Menü" },
  notFound: {
    es: "Esta ola no existe.",
    en: "This wave doesn’t exist.",
    fr: "Cette vague n’existe pas.",
    de: "Diese Welle gibt es nicht.",
  },
  backHome: {
    es: "Volver al inicio",
    en: "Back to home",
    fr: "Retour à l’accueil",
    de: "Zur Startseite",
  },
};
