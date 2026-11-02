import express from 'express';
import type { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import multer from 'multer';
import type { Pool } from 'mysql2/promise';
import { env } from './env.js';
import { HttpError } from './errors.js';
import { googleReviewsService } from './services/google-reviews.js';
import { contentService } from './services/content.js';
import { createProbe } from './t0.js';
import { apiRoutes } from './routes/api.js';
import { redirects,staticRoutes } from './routes/static.js';
import { readFileSync } from 'node:fs';
export const log=pino({level:env.LOG_LEVEL,redact:['req.headers.cookie','req.headers.authorization','res.headers.set-cookie']});
export type RuntimeState={ready:boolean;error?:string};
export function createApp(db:Pool,state:RuntimeState={ready:true}) {
  const app=express(),content=contentService(db),google=googleReviewsService(db,{warn:()=>log.warn('Google reviews refresh failed; using retained cache')});
  const version=JSON.parse(readFileSync('package.json','utf8')).version;
  app.disable('x-powered-by');app.set('trust proxy',env.TRUST_PROXY);
  app.use((req,res,next)=>{req.requestId=randomUUID();res.set('X-Request-ID',req.requestId);next();});
  app.use(pinoHttp({logger:log,genReqId:req=>(req as express.Request).requestId,serializers:{req:req=>({id:req.id,method:req.method,path:req.url?.split('?')[0]}),res:res=>({status:res.statusCode})},customLogLevel:(_req,res,error)=>error||res.statusCode>=500?'error':res.statusCode>=400?'warn':'info'}));
  app.use(helmet({frameguard:{action:'deny'},referrerPolicy:{policy:'strict-origin-when-cross-origin'},strictTransportSecurity:env.NODE_ENV==='production'?undefined:false,
    contentSecurityPolicy:{reportOnly:!env.CSP_ENFORCE,useDefaults:false,directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],fontSrc:["'self'"],imgSrc:["'self'",'data:','blob:','https://*.googleusercontent.com'],connectSrc:["'self'"],frameAncestors:["'none'"],baseUri:["'self'"],formAction:["'self'"]}}}));
  app.use((_req,res,next)=>{res.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');next();});
  app.use(compression());app.use(redirects());
  const probe=createProbe(db,env.UPLOADS_DIR);
  for(const path of ['/healthz','/healthz/deep'])app.get(path,async(_req,res)=>{
    const result=await probe(path.endsWith('/deep'));
    const ok=result.ok&&state.ready;
    let publishedAt=null;
    if(state.ready)try{publishedAt=(await content.getPublished()).publishedAt;}catch{/* health reflects initialization via ready */}
    res.set('Cache-Control','no-store').status(ok?200:503).json({...result,ok,version,publishedAt,...(!state.ready?{maintenance:true,error:state.error || 'Inicializando'}:{})});
  });
  app.use('/api',(_req,res,next)=>{if(!state.ready){res.status(503).json({error:{code:'MAINTENANCE',message:state.error || 'Inicializando'}});return;}next();});
  // Import is the only JSON request permitted to carry an encoded image.
  app.use('/api/admin/photos/from-data-url',express.json({limit:'12mb'}));
  app.use(express.json({limit:'2mb'}));
  app.use('/api',apiRoutes(db,content,google));
  app.use(staticRoutes(content));
  const errors:ErrorRequestHandler=(error,req,res,_next)=>{
    void _next;
    let status=500,code='INTERNAL',message='Error interno',details:unknown;
    if(error instanceof HttpError){({status,code,message,details}=error);}
    else if(error instanceof ZodError){status=400;code='VALIDATION';message='Datos inválidos';details=error.issues;}
    else if(error instanceof multer.MulterError){status=error.code==='LIMIT_FILE_SIZE'?413:400;code=status===413?'TOO_LARGE':'VALIDATION';message='Archivo demasiado grande o formulario inválido';}
    else if(error.type==='entity.too.large'){status=413;code='TOO_LARGE';message='Solicitud demasiado grande';}
    else if(error.type==='entity.parse.failed'){status=400;code='VALIDATION';message='JSON inválido';}
    else if(error.code==='ER_DUP_ENTRY'){status=409;code='CONFLICT';message='El registro ya existe';}
    else if(error.status===404){status=404;code='NOT_FOUND';message='Archivo no encontrado';}
    if(status>=500)log.error({err:error,requestId:req.requestId},'request failed');
    res.status(status).json({error:{code,message,...(details?{details}:{}),requestId:req.requestId}});
  };
  app.use(errors);return {app,content,google};
}
