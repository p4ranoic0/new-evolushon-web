import type { Review, SiteData } from './types.js';

export const visibleReviews = (reviews: Review[]) => reviews.filter(r => !r.sample && !r.hidden);
// Se filtra también el JSON inyectado: los ejemplos no viajan al HTML ni a la API pública.
export const publicSiteData = (data: SiteData): SiteData => ({ ...data, reviews: visibleReviews(data.reviews) });
export function safeReviewUrl(value?: string): string | undefined {
  try { const url = new URL(value || ''); return url.protocol === 'https:' ? url.href : undefined; }
  catch { return undefined; }
}
