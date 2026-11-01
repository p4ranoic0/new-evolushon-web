import { useEffect } from 'react';
import { LANGS, pathFor } from '../../shared/index';
import type { Lang, Page, Service, SiteData } from '../../shared/types';
import { seoFor } from '../../shared/seo';
type Head = { data: SiteData; lang: Lang; page: Page; service?: Service } | { title: string; lang?: Lang; robots: string };
export function useHead(head: Head) {
  const serialized = JSON.stringify(head);
  useEffect(() => {
    const current: Head = JSON.parse(serialized);
    document.querySelectorAll('[data-ssr], [data-evo-seo], #evo-ld').forEach((node) => node.remove());
    const nodes: Element[] = [];
    function add(tag: string, attrs: Record<string, string> = {}, text?: string) {
      const node = document.createElement(tag);
      node.setAttribute('data-ssr', '');
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      if (text !== undefined) node.textContent = text;
      document.head.appendChild(node); nodes.push(node);
    }
    document.documentElement.lang = current.lang || 'es';
    if ('title' in current) { add('title', {}, current.title); add('meta', { name:'robots', content:current.robots }); }
    else {
      const seo = seoFor(current.data, current.lang, current.page, current.service, location.origin);
      add('title', {}, seo.title); add('meta', {name:'description', content:seo.desc}); add('meta', {name:'robots', content:'index,follow'});
      for (const [property, content] of Object.entries({'og:title':seo.title,'og:description':seo.desc,'og:type':'website','og:image':seo.image,'og:url':seo.url,'og:locale':{es:'es_PE',en:'en_US',fr:'fr_FR',de:'de_DE'}[current.lang]})) add('meta',{property,content});
      for (const [name, content] of Object.entries({'twitter:card':'summary_large_image','twitter:title':seo.title,'twitter:description':seo.desc,'twitter:image':seo.image})) add('meta',{name,content});
      add('link',{rel:'canonical',href:seo.url});
      for (const lang of LANGS) add('link',{rel:'alternate',hreflang:lang,href:seo.domain + pathFor(lang,current.page,current.service)});
      add('link',{rel:'alternate',hreflang:'x-default',href:seo.domain + pathFor('es',current.page,current.service)});
      add('script',{type:'application/ld+json',id:'evo-ld'},JSON.stringify(seo.ld).replace(/</g,'\\u003c'));
    }
    return () => nodes.forEach((node) => node.remove());
  }, [serialized]);
}
