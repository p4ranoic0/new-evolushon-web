import express, { Router } from 'express';
import { readFile,stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { env } from '../env.js';
import type { ContentService } from '../services/content.js';
import { injectHtml } from '../services/head.js';
import { sitemap } from '../services/sitemap.js';
export const LEGACY_REDIRECTS:Record<string,string>={
  '/clases/surf':'/es/servicios?category=surf','/clases/surfskate':'/es/servicios?category=surfskate',
  '/surftrips':'/es/servicios?category=trip','/en/surftrips':'/en/services?category=trip',
  '/galeria':'/es/galeria','/contacto':'/es/contacto',
};
export function redirects() {
  const r=Router();r.use((req,res,next)=>{
    const canonical=new URL(env.PUBLIC_URL).hostname;
    // www → dominio canónico. Solo mira el host: detrás del proxy de Hostinger req.protocol es siempre http
    // (TRUST_PROXY=0), así que FORCE_HTTPS provocaría un bucle; el panel ya redirige http → https.
    if(req.hostname==='www.'+canonical){res.redirect(301,env.PUBLIC_URL+req.originalUrl);return;}
    if(env.FORCE_HTTPS&&(req.protocol!=='https'||req.hostname!==canonical)) {res.redirect(301,env.PUBLIC_URL+req.originalUrl);return;}
    const path=req.path.replace(/\/$/,'') || '/';
    if(path==='/'){res.redirect(302,'/es/');return;}
    if(LEGACY_REDIRECTS[path]){res.redirect(301,LEGACY_REDIRECTS[path]);return;}next();
  });return r;
}
type SsrRender=(url:string,publicData:unknown)=>string;
let ssr:Promise<SsrRender|undefined>|undefined;
// Módulo generado por `vite build --ssr`. Si falta o falla, la página se sirve como antes (solo cliente).
function loadSsr(log:{warn:(o:object,m:string)=>void}){
  ssr??=import(pathToFileURL(resolve('server-dist/ssr/entry-server.js')).href)
    .then(m=>m.render as SsrRender)
    .catch(error=>{log.warn({err:error},'SSR no disponible; se sirve solo cliente');ssr=undefined;return undefined;});
  return ssr;
}
export function staticRoutes(content:ContentService) {
  const r=Router();
  let xmlCache:{key:string;xml:string}|undefined;
  r.get('/sitemap.xml',async(_req,res)=>{
    const live=await content.getPublished(),key=String(live.id);
    if(xmlCache?.key!==key)xmlCache={key,xml:sitemap(live.data,live.publishedAt,env.PUBLIC_URL)};
    res.type('application/xml').set('Cache-Control','no-cache').send(xmlCache.xml);
  });
  r.get('/robots.txt',(_req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${env.PUBLIC_URL}/sitemap.xml\n`));
  r.use('/uploads',(req,res,next)=>{
    if(!/\.webp$/i.test(req.path)){res.sendStatus(404);return;}next();
  },express.static(env.UPLOADS_DIR,{immutable:true,maxAge:'365d',index:false,dotfiles:'deny',fallthrough:false}));
  r.use(express.static(resolve('dist'),{index:false,maxAge:'1h',setHeaders(res,path){if(path.includes('/assets/'))res.setHeader('Cache-Control','public, max-age=31536000, immutable');}}));
  let template='',mtime=0;
  r.use(async(req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.set('Allow','GET, HEAD').sendStatus(405);return;}
    const file=resolve('dist/index.html'),info=await stat(file);
    if(info.mtimeMs!==mtime){template=await readFile(file,'utf8');mtime=info.mtimeMs;}
    const live=await content.getPublished();
    const rendered=injectHtml(template,live.data,req.path,env.PUBLIC_URL);
    if(!req.path.startsWith('/admin')){
      const render=await loadSsr(req.log);
      if(render){
        try{rendered.html=rendered.html.replace('<div id="root"></div>',()=>`<div id="root">${render(req.originalUrl,rendered.publicData)}</div>`);}
        catch(error){req.log.error({err:error,path:req.path},'Falló el render en servidor; se sirve solo cliente');}
      }
    }
    if(req.path.startsWith('/admin')||rendered.status===404)res.set('X-Robots-Tag','noindex, nofollow');
    res.status(rendered.status).type('text/html').set('Cache-Control','no-cache').send(rendered.html);
  });
  return r;
}
