import { Router, type Request } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import type { Pool } from 'mysql2/promise';
import type { Booking } from '../../shared/types.js';
import { baseVersionSchema } from '../../shared/schemas.js';
import { sessions,csrf,roles } from '../auth/session.js';
import { rows,json } from '../db/pool.js';
import { fail } from '../errors.js';
import type { ContentService } from '../services/content.js';
import { bookingService } from '../services/bookings.js';
import { imageService } from '../services/images.js';
import { userRoutes } from './users.js';
import { authRoutes } from './auth.js';
const limiter=(limit:number,windowMs:number,keyGenerator?:(req:Request)=>string)=>rateLimit({limit,windowMs,keyGenerator,standardHeaders:'draft-7',legacyHeaders:false,handler:(_req,res)=>res.status(429).json({error:{code:'RATE_LIMITED',message:'Demasiados intentos; espera unos minutos'}})});
const csvCell=(v:unknown)=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';
export function apiRoutes(db:Pool,content:ContentService) {
  const r=Router(),bookings=bookingService(db,content),images=imageService(db);
  r.use(limiter(300,60000));
  r.use('/auth',authRoutes(db));
  r.get('/public/site',async(req,res)=>{
    const published=await content.getPublished();
    const etag=`"site-${published.version}-${published.id}"`;
    res.set({'Cache-Control':'public, max-age=60','ETag':etag});
    if(req.headers['if-none-match']===etag){res.sendStatus(304);return;}
    res.json(published.data);
  });
  r.get('/public/availability',limiter(120,60000),async(req,res)=>{
    const query=z.object({sid:z.string().max(40),from:z.string().max(10),to:z.string().max(10)}).parse(req.query);
    res.set('Cache-Control','no-store').json(await bookings.availability(query.sid,query.from,query.to));
  });
  r.post('/public/bookings',limiter(5,600000),limiter(40,3600000,()=> 'all-bookings'),async(req,res)=>{
    const {booking,replayed}=await bookings.create(req.body,req.get('Idempotency-Key')||null,req.ip||null);
    res.status(replayed?200:201).set('Cache-Control','no-store').json(booking);
  });
  const admin=Router();
  admin.use(sessions(db).guard,csrf,(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  admin.use('/users',userRoutes(db));
  admin.get('/content',async(_req,res)=>res.json(await content.getContent()));
  admin.put('/content/draft',async(req,res)=>{
    const {baseVersion}=baseVersionSchema.parse(req.body);
    res.json(await content.mutate('draft',baseVersion,req.auth!.role,req.auth!.id,req.body.data));
  });
  for(const action of ['publish','discard'] as const)admin.post('/content/'+action,roles('admin','editor'),async(req,res)=>{
    const {baseVersion}=baseVersionSchema.parse(req.body);
    const result=await content.mutate(action,baseVersion,req.auth!.role,req.auth!.id);
    res.json(action==='publish'?{...result,publishedAt:(await content.getPublished()).publishedAt}:result);
  });
  admin.post('/content/restore/:id',roles('admin','editor'),async(req,res)=>{
    const {baseVersion}=baseVersionSchema.parse(req.body),id=z.coerce.number().int().positive().parse(req.params.id);
    res.json(await content.mutate('restore',baseVersion,req.auth!.role,req.auth!.id,undefined,id));
  });
  admin.get('/content/history/:id',roles('admin','editor'),async(req,res)=>{
    const [r]=await rows(db,"SELECT data FROM site_versions WHERE id=? AND status='archived'",[z.coerce.number().int().positive().parse(req.params.id)]);
    if(!r)fail(404,'NOT_FOUND','Versión no encontrada');res.json(json(r.data));
  });
  admin.get('/export',roles('admin'),async(_req,res)=>{
    const data=await content.getContent();
    const users=await rows(db,'SELECT id,username,name,role,active FROM users');
    res.attachment('evolushon-export.json').json({...data,bookings:(await bookings.list({},true)).items,users,exportedAt:new Date().toISOString()});
  });
  admin.post('/import',roles('admin'),async(req,res)=>{
    const {baseVersion}=baseVersionSchema.parse(req.body);
    res.json(await content.mutate('import',baseVersion,'admin',req.auth!.id,req.body.data));
  });
  // Las fotos llegan ya comprimidas y renombradas desde el navegador (src/admin/image-pipeline.ts):
  // el servidor solo acepta los dos WebP (full y thumb), valida su cabecera y los guarda.
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:2,fields:1,parts:3},
    fileFilter:(_req,file,cb)=>cb(null,file.mimetype==='image/webp')});
  admin.post('/photos',limiter(60,3600000,req=>String(req.auth!.id)),upload.fields([{name:'full',maxCount:1},{name:'thumb',maxCount:1}]),async(req,res)=>{
    const files=req.files as Record<string,Express.Multer.File[]>|undefined;
    const full=files?.full?.[0],thumb=files?.thumb?.[0];
    if(!full||!thumb)fail(415,'UNSUPPORTED_MEDIA','Se requieren las variantes full y thumb en WebP');
    const originalBytes=Number(req.body?.originalBytes)||undefined;
    res.status(201).json(await images.upload(full.buffer,thumb.buffer,full.originalname,thumb.originalname,req.auth!.id,originalBytes));
  });
  admin.get('/photos/purge',roles('admin'),async(_req,res)=>res.json({items:await images.candidates()}));
  admin.post('/photos/purge',roles('admin'),async(req,res)=>{const {ids}=z.object({ids:z.array(z.string().regex(/^p-[a-f0-9]{12}$/)).max(100)}).parse(req.body);res.json(await images.purge(ids));});
  admin.delete('/photos/:id',roles('admin','editor'),async(req,res)=>{await images.remove(String(req.params.id));res.sendStatus(204);});
  admin.get('/storage',roles('admin'),async(_req,res)=>res.json(await images.storage()));
  admin.get('/bookings',roles('admin','editor'),async(req,res)=>res.json(await bookings.list(req.query)));
  admin.get('/bookings.csv',roles('admin','editor'),async(req,res)=>{
    const list=(await bookings.list(req.query,true)).items;
    const keys=['code','date','time','svcEs','persons','name','email','phone','method','total','due','paid','currency','status','notes','createdAt'] as const;
    res.attachment('reservas.csv').type('text/csv').send('\uFEFF'+keys.join(',')+'\r\n'+list.map(b=>keys.map(k=>csvCell(b[k])).join(',')).join('\r\n'));
  });
  admin.post('/bookings',roles('admin','editor'),async(req,res)=>res.status(201).json((await bookings.create(req.body,null,req.ip||null,req.auth!.id,'admin')).booking));
  admin.patch('/bookings/:code',roles('admin','editor'),async(req,res)=>res.json(await bookings.patch(String(req.params.code),req.body,req.auth!.id)));
  admin.get('/bookings/:code/events',roles('admin','editor'),async(req,res)=>res.json(await rows(db,'SELECT * FROM booking_events WHERE booking_code=? ORDER BY id',[req.params.code])));
  admin.post('/bookings/import',roles('admin'),async(req,res)=>{
    const list=z.array(z.record(z.string(),z.unknown())).max(1000).parse(req.body);
    const imported=[];
    for(const b of list)imported.push((await bookings.create(b,null,null,req.auth!.id,'import',b as unknown as Booking)).booking.code);
    res.json({imported});
  });
  r.use('/admin',admin);
  r.use(()=>fail(404,'NOT_FOUND','Endpoint no encontrado'));
  return r;
}
