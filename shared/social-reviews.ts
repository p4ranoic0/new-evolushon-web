import { z } from 'zod';
import type { Review } from './types.js';
import { safeReviewUrl } from './review-utils.js';

const commentSchema = z.object({
  red: z.string().transform(v => v.trim().toLowerCase()).pipe(z.enum(['instagram', 'tiktok'])),
  url_post: z.string().max(1000).refine(v => !!safeReviewUrl(v), 'Enlace HTTPS requerido'),
  usuario: z.string().trim().min(1).max(254),
  texto: z.string().trim().min(1).max(10000),
  fecha: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(?:-\d{2}(?:T.*)?)?$/),
  testimonio_candidato: z.boolean().default(false),
});
export function parseSocialComments(input: unknown) {
  return z.array(commentSchema).max(5000).parse(input)
    .sort((a,b) => Number(b.testimonio_candidato) - Number(a.testimonio_candidato));
}
export type SocialComment = ReturnType<typeof parseSocialComments>[number];
const author = (v: string) => '@' + v.replace(/^@+/, '');
const key = (r: Pick<Review, 'url'|'author'|'text'>) => JSON.stringify([r.url?.trim() || '', r.author.trim(), r.text.es.trim()]);
export function importSocialComments(existing: Review[], comments: SocialComment[], makeId: () => string = () => 'r-' + crypto.randomUUID()) {
  const seen = new Set(existing.map(key));
  const added: Review[] = [];
  for (const c of comments) {
    const review: Review = { id: '', source: c.red, url: c.url_post.trim(), author: author(c.usuario), rating: 5,
      date: c.fecha.slice(0,7), text: { es:c.texto, en:'', fr:'', de:'' }, hidden:false };
    if (seen.has(key(review))) continue;
    seen.add(key(review)); review.id = makeId(); added.push(review);
  }
  return added;
}
