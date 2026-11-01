import { z } from 'zod';
const text = z.string().max(10000);
const short = z.string().max(255);
const id = z.string().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/);
const localized = z.object({ es: text, en: text, fr: text, de: text });
const list = z.object({ es: z.array(short).max(50), en: z.array(short).max(50), fr: z.array(short).max(50), de: z.array(short).max(50) });
const image = z.string().max(1000).refine(v => !v || /^src\/assets\/[^?#]+$/.test(v) || /^\/uploads\/\d{4}\/\d{2}\/(?=.{1,100}$)[a-z0-9]+(?:-[a-z0-9]+)*-\d{8}-[a-z0-9]{6}(?:-thumb)?\.webp$/.test(v) || /^\/uploads\/\d{4}\/\d{2}\/p-[a-f0-9]{12}-\d{1,4}\.webp$/.test(v) || /^https:\/\//.test(v), 'Imagen no válida; subirla primero');
const price = z.number().min(0).max(1000000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const days = z.array(z.number().int().min(0).max(6)).max(7);
const times = z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).max(24);
const link = z.string().max(1000).refine(v => !v || /^https:\/\//.test(v), 'Se requiere HTTPS');
export const bookingConfigSchema = z.object({
  slots: z.object({ surf: times, surfskate: times }),
  capacity: z.object({ surf: z.number().int().min(1).max(100), surfskate: z.number().int().min(1).max(100), trip: z.number().int().min(1).max(100) }),
  tripDays: days, closedDays: days, blocked: z.array(date).max(1000),
  deposit: z.number().min(0).max(100), lead: z.number().int().min(0).max(365), maxDays: z.number().int().min(1).max(730),
  methods: z.object({ card: z.boolean(), yape: z.boolean(), plin: z.boolean() }), yape: short, plin: short,
});
export const siteSchema = z.object({
  settings: z.object({
    whatsapp: z.string().max(40), waLink: link, instagram: link, tiktok: link, domain: link,
    booking: bookingConfigSchema,
    img: z.object({ preset: z.enum(['max','balanced','light']), format: z.enum(['webp','jpeg']) }),
    reviews: z.object({ placeUrl: link, writeUrl: link, rating: z.number().min(0).max(5).nullable(), count: z.number().int().nonnegative().nullable() }),
    seo: z.record(z.string().max(20), z.record(z.string().max(2), z.object({ title: z.string().max(300), desc: z.string().max(2000) }))),
  }),
  services: z.array(z.object({
    id, cat: z.enum(['surf','surfskate','trip']), active: z.boolean(), cover: image, coverFocus: short,
    currency: z.string().min(1).max(4), price: price.nullable(), packages: z.array(z.object({n:z.number().int().min(1).max(100),price})).max(20),
    name: localized, desc: localized, duration: localized, distance: localized, includes: list, excludes: list, bring: list,
    depart: short.optional(), ret: short.optional(), minPeople: z.number().int().min(1).max(100).optional(),
    seo: z.object({ title: localized, desc: localized, slug: z.string().max(120).regex(/^[a-zA-Z0-9_-]*$/) }),
    offer: z.object({ on: z.boolean(), price: price.nullable(), from: z.string().max(10), to: z.string().max(10), label: localized }),
  })).max(100),
  gallery: z.array(z.object({ id, src: image, album: short, featured: z.boolean(), hidden: z.boolean(), alt: localized, focus: short,
    bytes: z.number().nonnegative().optional(), originalBytes: z.number().nonnegative().optional(), width: z.number().positive().optional(), height: z.number().positive().optional(),
    variants: z.array(z.object({ w: z.number().positive(), webp: image })).max(3).optional(),
  })).max(2000),
  reviews: z.array(z.object({ id, author: short, rating: z.number().min(1).max(5), date: short, sample: z.boolean().optional(), hidden: z.boolean(), text: localized })).max(1000),
  albums: z.array(z.object({ id, name: localized })).max(100),
  home: z.record(z.string().max(80), localized),
}).superRefine((d,ctx) => {
  for (const key of ['services','gallery','albums','reviews'] as const) {
    const ids = d[key].map(v => v.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({code:'custom',message:'IDs duplicados',path:[key]});
  }
  const slugs = d.services.map(v => v.seo.slug || v.id);
  if (new Set(slugs).size !== slugs.length) ctx.addIssue({code:'custom',message:'Slugs duplicados',path:['services']});
});
export const baseVersionSchema = z.object({ baseVersion: z.number().int().positive() });
export const bookingSchema = z.object({
  sid: id, opt: z.union([z.literal('single'),z.coerce.number().int().positive().max(100)]),
  persons: z.number().int().min(1).max(100), date,
  time: z.string().max(10), name: z.string().trim().min(2).max(120),
  email: z.email().max(160), phone: z.string().trim().min(5).max(40),
  level: z.string().min(1).max(20), classLang: z.enum(['es','en','fr','de']),
  notes: z.string().max(4000).default(''), method: z.enum(['card','yape','plin']),
  lang: z.enum(['es','en','fr','de']), hp: z.string().max(200).default(''), full: z.boolean().default(false),
});
export type BookingInput = z.infer<typeof bookingSchema>;
