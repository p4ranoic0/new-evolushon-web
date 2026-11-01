import { LANGS,pathFor } from '../../shared/index.js';
import type { Page,SiteData } from '../../shared/types.js';
import { escapeHtml } from './head.js';
export function sitemap(data:SiteData,publishedAt:string|null,domain:string) {
  const entries:[Page,(typeof data.services)[number]?][]=[['home'],['services'],['gallery'],['contact'],...data.services.filter(s=>s.active).map(s=>['services',s] as [Page,typeof s])];
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+entries.flatMap(([page,service])=>LANGS.map(lang=>'<url><loc>'+escapeHtml(domain+pathFor(lang,page,service))+'</loc>'+(publishedAt?'<lastmod>'+escapeHtml(publishedAt)+'</lastmod>':'')+LANGS.map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${escapeHtml(domain+pathFor(l,page,service))}"/>`).join('')+`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(domain+pathFor('es',page,service))}"/></url>`)).join('')+'</urlset>';
}
