import { publicSiteData } from '../../shared/review-utils.js';
import { seoFor } from '../../shared/seo.js';
import { LANGS, pathFor, slugs } from '../../shared/index.js';
import type { SiteData,Lang,Page } from '../../shared/types.js';
export function escapeHtml(value:unknown) {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export const escapeJson=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
export function resolveRoute(path:string,data:SiteData) {
  if(/^\/admin(?:\/|$)/.test(path))return {kind:'admin' as const,status:200,lang:'es' as Lang};
  const parts=path.replace(/\/$/,'').split('/').slice(1);
  const lang=parts[0] as Lang;
  if(!LANGS.includes(lang))return {kind:'missing' as const,status:404,lang:'es' as Lang};
  const page:Page|undefined=parts.length===1?'home':(Object.keys(slugs) as Exclude<Page,'home'>[]).find(p=>slugs[p][lang]===parts[1]);
  const service=parts.length===3&&page==='services'?data.services.find(s=>s.active&&(s.seo.slug||s.id)===parts[2]):undefined;
  if(!page||parts.length>3||(parts.length===3&&!service))return {kind:'missing' as const,status:404,lang};
  return {kind:'public' as const,status:200,lang,page,service};
}
export function renderHead(data:SiteData,route:ReturnType<typeof resolveRoute>,publicUrl:string) {
  const tag=(name:string,attrs:Record<string,string>)=>`<${name} data-ssr ${Object.entries(attrs).map(([k,v])=>`${k}="${escapeHtml(v)}"`).join(' ')}>`;
  if(route.kind!=='public')return `<title data-ssr>${route.kind==='admin'?'Panel del equipo':'404'} | Evolushon</title>`+tag('meta',{name:'robots',content:'noindex,nofollow'});
  const {title,desc,url,image,ld}=seoFor(data,route.lang,route.page!,route.service,publicUrl);
  return `<title data-ssr>${escapeHtml(title)}</title>`+
    tag('meta',{name:'description',content:desc})+tag('meta',{name:'robots',content:'index,follow'})+
    Object.entries({'og:title':title,'og:description':desc,'og:type':'website','og:image':image,'og:url':url,'og:locale':({es:'es_PE',en:'en_US',fr:'fr_FR',de:'de_DE'})[route.lang]}).map(([property,content])=>tag('meta',{property,content})).join('')+
    Object.entries({'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':desc,'twitter:image':image}).map(([name,content])=>tag('meta',{name,content})).join('')+
    tag('link',{rel:'canonical',href:url})+LANGS.map(l=>tag('link',{rel:'alternate',hreflang:l,href:publicUrl+pathFor(l,route.page!,route.service)})).join('')+
    tag('link',{rel:'alternate',hreflang:'x-default',href:publicUrl+pathFor('es',route.page!,route.service)})+
    `<script data-ssr type="application/ld+json">${escapeJson(ld)}</script>`;
}
export function injectHtml(template:string,data:SiteData,path:string,publicUrl:string) {
  const route=resolveRoute(path,data);
  const publicData=publicSiteData(data);
  return {status:route.status,publicData,html:template.replace('<html lang="es">',`<html lang="${route.lang}">`).replace('<!--evo:head-->',()=>renderHead(data,route,publicUrl)).replace('<!--evo:data-->',()=>`<script type="application/json" id="evo-data">${escapeJson(publicData)}</script>`)};
}
