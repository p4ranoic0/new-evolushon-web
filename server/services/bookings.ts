import { randomBytes, createHash } from 'node:crypto';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { z } from 'zod';
import type { Booking, SiteData, Service } from '../../shared/types.js';
import { effectivePrice, tr } from '../../shared/index.js';
import { bookingSchema, type BookingInput } from '../../shared/schemas.js';
import { rows, exec, iso } from '../db/pool.js';
import { env } from '../env.js';
import { fail } from '../errors.js';
import type { ContentService } from './content.js';
export const statusSchema = z.enum(['pendiente','por verificar','pagada','completada','cancelada']);
export function normalizeTime(value:string) {
  const match=/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(value.trim());
  if(!match) fail(400,'VALIDATION','Horario inválido');
  let h=Number(match[1]);const m=Number(match[2]);
  if(match[3]) { if(h<1 || h>12) fail(400,'VALIDATION','Horario inválido');h=h%12+(match[3].toUpperCase()==='PM'?12:0); }
  if(h>23 || m>59) fail(400,'VALIDATION','Horario inválido');
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
export function limaToday(now=new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function validateSlot(input:Pick<BookingInput,'date'|'time'|'persons'>,service:Service,data:SiteData,allowPast=false) {
  const cfg=data.settings.booking;
  const date=new Date(input.date+'T12:00:00Z');
  if(!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==input.date) fail(400,'VALIDATION','Fecha inválida');
  const time=normalizeTime(input.time);
  const today=limaToday();
  if(allowPast && input.date<today) return time;
  const delta=Math.round((Date.parse(input.date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);
  if(delta<cfg.lead || delta>cfg.maxDays || cfg.blocked.includes(input.date) || cfg.closedDays.includes(date.getUTCDay()) || (service.cat==='trip'&&!cfg.tripDays.includes(date.getUTCDay()))) fail(400,'VALIDATION','Fecha fuera de disponibilidad');
  const slots=service.cat==='trip'?[service.depart || '07:00 AM']:cfg.slots[service.cat];
  if(!slots.map(normalizeTime).includes(time)) fail(400,'VALIDATION','Horario no disponible');
  return time;
}
export type Slot={cat:string;date:string;time:string;persons:number;capacity:number;excludeCode?:string;consumes?:boolean};
// This is the only entry point for a capacity-consuming write. The lock and transaction
// share the caller's connection, including idempotency and booking locks held upstream.
export async function reserveSlot<T>(c:PoolConnection,slot:Slot,write:()=>Promise<T>):Promise<T> {
  const time=normalizeTime(slot.time);
  const key='evo_slot_'+createHash('sha256').update(`${slot.cat}_${slot.date}_${time}`).digest('hex').slice(0,48);
  let locked=false;
  try {
    const [lock]=await rows(c,'SELECT GET_LOCK(?,5) AS acquired',[key]);
    if(Number(lock.acquired)!==1) fail(503,'SLOT_BUSY','Horario ocupado; vuelve a intentar');
    locked=true;
    await c.beginTransaction();
    if(slot.consumes!==false) {
      const [r]=await rows(c,`SELECT COALESCE(SUM(persons),0) AS taken FROM bookings WHERE cat=? AND date=? AND time=? AND code<>? AND (status IN ('pagada','completada') OR (status IN ('pendiente','por verificar') AND created_at>DATE_SUB(UTC_TIMESTAMP(3),INTERVAL ? HOUR)))`,[slot.cat,slot.date,time,slot.excludeCode || '',env.HOLD_HOURS]);
      const left=Math.max(0,slot.capacity-Number(r.taken));
      if(slot.persons>left) fail(409,'SLOT_FULL','No quedan cupos para este horario',{left});
    }
    const result=await write();await c.commit();return result;
  } catch(e) { await c.rollback();throw e; }
  finally { if(locked) await c.query('SELECT RELEASE_LOCK(?)',[key]); }
}
export function bookingFromRow(r:Record<string,unknown>):Booking & {holdExpired:boolean;source:string} {
  const createdAt=iso(r.created_at as string)!;
  return {code:String(r.code),sid:String(r.service_id),svc:String(r.service_name),svcEs:String(r.service_name_es),cat:r.cat as Booking['cat'],opt:r.opt==='single'?'single':Number(r.opt),persons:Number(r.persons),date:String(r.date).slice(0,10),time:String(r.time),name:String(r.name),email:String(r.email),phone:String(r.phone),level:String(r.level),classLang:r.class_lang as Booking['classLang'],notes:String(r.notes || ''),method:r.method as Booking['method'],currency:String(r.currency),total:Number(r.total),due:Number(r.due),paid:Number(r.paid),status:r.status as Booking['status'],lang:r.lang as Booking['lang'],createdAt,
    holdExpired:['pendiente','por verificar'].includes(String(r.status)) && Date.parse(createdAt)+env.HOLD_HOURS*3600000<=Date.now(),source:String(r.source)};
}
async function namedLock<T>(db:Pool,name:string,fn:(c:PoolConnection)=>Promise<T>) {
  const c=await db.getConnection();let locked=false;
  try{const [r]=await rows(c,'SELECT GET_LOCK(?,5) AS acquired',[name]);if(Number(r.acquired)!==1)fail(503,'SLOT_BUSY','Operación ocupada; reintentar');locked=true;return await fn(c);}
  finally{try{if(locked)await c.query('SELECT RELEASE_LOCK(?)',[name]);}finally{c.release();}}
}
export function bookingService(db:Pool,content:ContentService) {
  async function availability(sid:string,from:string,to:string) {
    const data=(await content.getPublished()).data;
    const service=data.services.find(s=>s.active&&s.id===sid);
    if(!service) fail(404,'NOT_FOUND','Servicio no encontrado');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||to<from||Date.parse(to)-Date.parse(from)>93*86400000) fail(400,'VALIDATION','Intervalo inválido (máximo 93 días)');
    const all=await rows(db,`SELECT date,time,SUM(persons) AS taken FROM bookings WHERE cat=? AND date BETWEEN ? AND ? AND (status IN ('pagada','completada') OR (status IN ('pendiente','por verificar') AND created_at>DATE_SUB(UTC_TIMESTAMP(3),INTERVAL ? HOUR))) GROUP BY date,time`,[service.cat,from,to,env.HOLD_HOURS]);
    const taken:Record<string,Record<string,number>>={};
    for(const r of all){const d=String(r.date).slice(0,10);(taken[d] ||= {})[normalizeTime(r.time)]=Number(r.taken);}
    return {capacity:data.settings.booking.capacity[service.cat],taken};
  }
  async function create(raw:unknown,key:string|null,ip:string|null,userId:number|null=null,source:'web'|'admin'|'import'='web',historical?:Booking) {
    const input=bookingSchema.parse(raw);
    if(input.hp) fail(400,'VALIDATION','No se pudo procesar la solicitud');
    if(source==='web'&&!key) fail(400,'VALIDATION','Se requiere Idempotency-Key');
    if(key) z.uuid().parse(key);
    const data=(await content.getPublished()).data;
    const name=key?'evo_idem_'+key:historical?'evo_booking_'+historical.code:'evo_new_'+randomBytes(12).toString('hex');
    return namedLock(db,name,async c=>{
      if(key){const [existing]=await rows(c,'SELECT * FROM bookings WHERE idempotency_key=?',[key]);if(existing)return {booking:bookingFromRow(existing),replayed:true};}
      const [previous]=historical?await rows(c,'SELECT * FROM bookings WHERE code=?',[historical.code]):[];
      const past=source==='import'&&input.date<limaToday();
      const historicalFields=historical?z.object({code:z.string().regex(/^EVO-[A-Z0-9]{6}$/),svc:z.string().min(1).max(120),svcEs:z.string().min(1).max(120),cat:z.enum(['surf','surfskate','trip']),currency:z.string().min(1).max(4),total:z.number().nonnegative().max(1000000),due:z.number().nonnegative().max(1000000),paid:z.number().nonnegative().max(1000000),createdAt:z.string().max(40)}).parse(historical):null;
      const service=data.services.find(s=>s.id===input.sid&&(s.active||source==='import')) || (past&&historicalFields?{id:input.sid,cat:historicalFields.cat,currency:historicalFields.currency,name:{es:historicalFields.svcEs,en:historicalFields.svc,fr:historicalFields.svc,de:historicalFields.svc},packages:[],price:null} as unknown as Service:undefined);
      if(!service)fail(404,'NOT_FOUND','Servicio no encontrado');
      const time=validateSlot(input,service,data,past);
      if(!past&&!data.settings.booking.methods[input.method])fail(400,'VALIDATION','Método de pago no disponible');
      const unit=input.opt==='single'?effectivePrice(service):service.packages.find(p=>p.n===input.opt)?.price;
      if(!past&&(unit==null||unit<=0))fail(400,'VALIDATION','Precio u opción no disponible');
      const total=past?historical!.total:Math.round(Number(unit)*input.persons*100)/100;
      const due=past?historical!.due:(input.full||!data.settings.booking.deposit?total:Math.round(total*data.settings.booking.deposit/100));
      const extra=source==='web'?{}:z.object({status:statusSchema.optional(),paid:z.number().min(0).optional()}).parse(raw);
      const status=extra.status||(input.method==='card'?'pendiente':'por verificar');
      const paid=extra.paid || (status==='pagada'?due:0);
      const createdAt=past&&historical?new Date(historical.createdAt):new Date();
      if(!Number.isFinite(createdAt.getTime()))fail(400,'VALIDATION','Fecha de creación inválida');
      return reserveSlot(c,{cat:service.cat,date:input.date,time,persons:input.persons,capacity:data.settings.booking.capacity[service.cat],consumes:!past&&status!=='cancelada',excludeCode:previous?.code},async()=>{
        let code=historical?.code;
        if(code&&!/^EVO-[A-Z0-9]{6}$/.test(code))fail(400,'VALIDATION','Código inválido');
        for(let attempt=0;attempt<5;attempt++) {
          code ||= 'EVO-'+randomBytes(3).toString('hex').toUpperCase();
          try {
            if(previous) {
              await exec(c,'UPDATE bookings SET service_id=?,service_name=?,service_name_es=?,cat=?,opt=?,persons=?,date=?,time=?,name=?,email=?,phone=?,level=?,class_lang=?,notes=?,method=?,currency=?,total=?,due=?,paid=?,status=?,lang=?,source=?,created_at=? WHERE code=?',[service.id,tr(service.name,input.lang).slice(0,120),service.name.es.slice(0,120),service.cat,String(input.opt),input.persons,input.date,time,input.name,input.email,input.phone,input.level,input.classLang,input.notes,input.method,service.currency,total,due,paid,status,input.lang,source,createdAt,code]);
              break;
            }
            await exec(c,`INSERT INTO bookings(code,idempotency_key,service_id,service_name,service_name_es,cat,opt,persons,date,time,name,email,phone,level,class_lang,notes,method,currency,total,due,paid,status,lang,source,ip,created_at) VALUES (${Array(26).fill('?').join(',')})`,[code,key,service.id,tr(service.name,input.lang).slice(0,120),service.name.es.slice(0,120),service.cat,String(input.opt),input.persons,input.date,time,input.name,input.email,input.phone,input.level,input.classLang,input.notes,input.method,service.currency,total,due,paid,status,input.lang,source,ip,createdAt]);
            break;
          } catch(e){if((e as {code?:string}).code!=='ER_DUP_ENTRY'||historical||attempt===4)throw e;code=undefined;}
        }
        await exec(c,'INSERT INTO booking_events(booking_code,user_id,from_status,to_status,paid,note) VALUES (?,?,?,?,?,?)',[code,userId,previous?.status || null,status,paid,source]);
        const [r]=await rows(c,'SELECT * FROM bookings WHERE code=?',[code]);
        return {booking:bookingFromRow(r),replayed:!!previous};
      });
    });
  }
  async function patch(code:string,raw:unknown,userId:number) {
    const input=z.object({status:statusSchema.optional(),paid:z.number().min(0).max(1000000).optional(),notes:z.string().max(4000).optional(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),time:z.string().max(10).optional(),persons:z.number().int().min(1).max(100).optional()}).strict().parse(raw);
    const data=(await content.getPublished()).data;
    return namedLock(db,'evo_booking_'+code,async c=>{
      const [r]=await rows(c,'SELECT * FROM bookings WHERE code=?',[code]);
      if(!r)fail(404,'NOT_FOUND','Reserva no encontrada');
      const previous=bookingFromRow(r), next={...previous,...input};
      const service=data.services.find(s=>s.id===next.sid);
      if(!service)fail(400,'VALIDATION','Servicio no disponible');
      const status=next.status;
      const slotChanged=next.date!==previous.date||normalizeTime(next.time)!==previous.time||next.persons!==previous.persons;
      const reactivating=previous.status==='cancelada'&&status!=='cancelada';
      // Renewing an expired hold is a new consumption and must pass reserveSlot too.
      const consumes=status!=='cancelada'&&(slotChanged||reactivating||status==='pagada'||status==='completada'||!previous.holdExpired);
      next.time=slotChanged||reactivating?validateSlot(next,service,data):normalizeTime(next.time);
      if(status==='pagada'&&!next.paid)next.paid=next.due;
      return reserveSlot(c,{cat:next.cat,date:next.date,time:next.time,persons:next.persons,capacity:data.settings.booking.capacity[next.cat],excludeCode:code,consumes},async()=>{
        await exec(c,'UPDATE bookings SET status=?,paid=?,notes=?,date=?,time=?,persons=? WHERE code=?',[status,next.paid,next.notes,next.date,next.time,next.persons,code]);
        await exec(c,'INSERT INTO booking_events(booking_code,user_id,from_status,to_status,paid,note) VALUES (?,?,?,?,?,?)',[code,userId,previous.status,status,next.paid,'Cambio administrativo']);
        const [saved]=await rows(c,'SELECT * FROM bookings WHERE code=?',[code]);return bookingFromRow(saved);
      });
    });
  }
  async function list(query:Record<string,unknown>,all=false) {
    const conditions:string[]=[],params:unknown[]=[];
    for(const [key,column,operator] of [['status','status','='],['from','date','>='],['to','date','<='],['cursor','code','>']] as const) {
      const value=query[key];if(typeof value==='string'&&value.length<=40){conditions.push(`${column}${operator}?`);params.push(value);}
    }
    if(typeof query.q==='string'){conditions.push('(name LIKE ? OR email LIKE ? OR code LIKE ?)');const q='%'+query.q.slice(0,120)+'%';params.push(q,q,q);}
    const limit=all?100000:Math.min(200,Math.max(1,Number(query.limit)||200));
    const result=await rows(db,`SELECT * FROM bookings ${conditions.length?'WHERE '+conditions.join(' AND '):''} ORDER BY code LIMIT ${limit+1}`,params);
    return {items:result.slice(0,limit).map(bookingFromRow),next:result.length>limit?result[limit-1].code:null};
  }
  return {availability,create,patch,list};
}
