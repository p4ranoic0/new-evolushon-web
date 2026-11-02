import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import request from 'supertest';
import { mkdtemp,readFile,rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const testPassword=randomBytes(20).toString('base64url');
process.env.ADMIN_INITIAL_EMAIL='test@example.test';process.env.ADMIN_INITIAL_PASSWORD=testPassword;
process.env.NODE_ENV='test';process.env.LOG_LEVEL='silent';
process.env.UPLOADS_DIR=await mkdtemp(resolve('uploads-test-'));
const {env}=await import('../server/env.js');
const {makePool,exec,rows,pool}=await import('../server/db/pool.js');
const {migrate}=await import('../server/db/migrate.js');
const {seed}=await import('../server/db/seed.js');
const {contentService,filterForRole}=await import('../server/services/content.js');
const {bookingService,reserveSlot,normalizeTime,limaToday}=await import('../server/services/bookings.js');
const {createApp}=await import('../server/app.js');
const {escapeHtml,escapeJson,renderHead,resolveRoute,injectHtml}=await import('../server/services/head.js');
const {DEFAULT,clone}=await import('../shared/index.js');
const {migrate:normalize}=await import('../shared/index.js');
const dbName=process.env.TEST_DB_NAME || 'evolushon_test';
assert.match(dbName,/_test$/,'TEST_DB_NAME debe terminar en _test: se vacían SOLO las tablas de pruebas');
const db=makePool(dbName),content=contentService(db),bookings=bookingService(db,content);
const {app}=createApp(db);
const agent=request.agent(app);
const origin=env.PUBLIC_URL;
const mut=(path:string)=>agent.post(path).set('Origin',origin).set('X-Requested-With','evolushon');
let adminId:number,version:number;
const future=(offset=3)=>{const d=new Date(limaToday()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);};
const input=(overrides:Record<string,unknown>={})=>({sid:'s-grupal',opt:'single',persons:1,date:future(),time:'07:00',name:'Reserva de prueba',email:'prueba@example.test',phone:'999999999',level:'beginner',classLang:'es',notes:'',method:'yape',lang:'es',...overrides});
async function resetBookings(){await exec(db,'DELETE FROM booking_events');await exec(db,'DELETE FROM bookings');}
before(async()=>{
  await exec(db,'SET FOREIGN_KEY_CHECKS=0');
  const tables=await rows(db,'SHOW TABLES');
  for(const r of tables){const name=String(Object.values(r)[0]);assert.match(name,/^[a-zA-Z0-9_]+$/);await exec(db,`DROP TABLE \`${name}\``);}
  await exec(db,'SET FOREIGN_KEY_CHECKS=1');
});
after(async()=>{await db.end();await pool.end();await rm(process.env.UPLOADS_DIR!,{recursive:true,force:true});});

test('migraciones: interrupción tras DDL, replay y segunda ejecución sin duplicar',async()=>{
  await assert.rejects(migrate(db,{afterStatement:n=>{if(n===3)throw new Error('interrupción simulada');}}),/interrupción/);
  assert.equal((await rows(db,'SELECT * FROM migrations')).length,0);
  await migrate(db);await migrate(db);
  assert.equal((await rows(db,'SELECT * FROM migrations')).length,1);
  const [table]=await rows(db,'SHOW CREATE TABLE bookings');
  assert.match(String(table['Create Table']),/ix_bookings_slot/);
  assert.match(String(table['Create Table']),/idempotency_key/);
  assert.equal((await rows(db,'SHOW TABLES')).length,7);
});
test('seed idempotente: una pareja draft/published, admin cifrado y sin credenciales editoriales',async()=>{
  await seed(db);await seed(db);
  const all=await rows(db,'SELECT * FROM site_versions');assert.equal(all.length,2);
  const data=await content.getContent();version=data.draft.version;
  assert.deepEqual(data.draft.data,data.published.data);
  assert.equal('users' in data.draft.data.settings,false);
  assert.equal('users' in normalize(DEFAULT).settings,false);
  assert.equal(data.draft.data.settings.booking.methods.card,false);
  const [u]=await rows(db,'SELECT * FROM users');adminId=u.id;
  assert.match(u.password_hash,/^\$2[aby]\$12\$/);assert.notEqual(u.password_hash,testPassword);
});
test('head: escape por contexto, cierre de title/script y atributos, 404/admin sin canonical',()=>{
  const d=clone(DEFAULT);d.settings.seo.home={es:{title:'"\' & </title><script>bad()</script>',desc:'" onload="evil & < >'}};
  const head=renderHead(d,resolveRoute('/es/',d),origin);
  assert.match(head,/&lt;\/title&gt;/);assert.doesNotMatch(head,/<script>bad/);assert.match(head,/&quot;/);assert.match(head,/&#39;/);assert.equal((head.match(/<title/g)||[]).length,1);
  assert.equal(escapeHtml('&<>"\''),'&amp;&lt;&gt;&quot;&#39;');
  assert.equal(escapeJson('</script>'),'"\\u003c/script>"');
  d.home.payload={es:'</script><script>alert(1)</script>',en:'',fr:'',de:''};
  const html=injectHtml('<html lang="es"><head><!--evo:head--></head><body><!--evo:data--></body>',d,'/es/',origin).html;
  assert.doesNotMatch(html,/<script>alert/);assert.match(html,/\\u003c\/script>/);
  for(const path of ['/es/servicios/inexistente','/xx/','/admin']){const route=resolveRoute(path,d);const h=renderHead(d,route,origin);assert.match(h,/noindex/);assert.doesNotMatch(h,/canonical|hreflang|ld\+json/);}
});
test('auth y CSRF: login, cookie segura en producción, sesión opaca hash y logout',async()=>{
  await request(app).post('/api/auth/login').send({user:'admin',pass:testPassword}).expect(403);
  const old=env.NODE_ENV;env.NODE_ENV='production';
  const prod=await request(app).post('/api/auth/login').set('Origin',origin).set('X-Requested-With','evolushon').send({user:'admin',pass:testPassword}).expect(200);
  env.NODE_ENV=old;
  assert.match(prod.headers['set-cookie'][0],/HttpOnly/);assert.match(prod.headers['set-cookie'][0],/Secure/);assert.match(prod.headers['set-cookie'][0],/SameSite=Strict/);assert.match(prod.headers['set-cookie'][0],/Max-Age=604800/);
  await mut('/api/auth/login').send({user:'admin',pass:testPassword}).expect(200);
  await agent.get('/api/auth/me').expect(200);
  const [session]=await rows(db,'SELECT token_hash FROM sessions');assert.match(session.token_hash,/^[a-f0-9]{64}$/);
  await agent.put('/api/admin/content/draft').send({baseVersion:version,data:DEFAULT}).expect(403);
  await mut('/api/auth/logout').expect(204);await agent.get('/api/auth/me').expect(401);
  await mut('/api/auth/login').send({user:'admin',pass:testPassword}).expect(200);
});
test('roles: fotógrafo solo gallery/albums; editor conserva ajustes protegidos',async()=>{
  const changed=clone(DEFAULT);changed.services[0].price=777;changed.settings.whatsapp='123';changed.gallery[0].alt.es='Nueva descripción';
  const photo=filterForRole(DEFAULT,changed,'fotografo');assert.equal(photo.services[0].price,DEFAULT.services[0].price);assert.equal(photo.gallery[0].alt.es,'Nueva descripción');
  const editor=filterForRole(DEFAULT,changed,'editor');assert.equal(editor.services[0].price,777);assert.equal(editor.settings.whatsapp,DEFAULT.settings.whatsapp);
  await mut('/api/admin/users').send({username:'fotografo',name:'Fotógrafo',role:'fotografo',password:testPassword}).expect(201);
  const photoAgent=request.agent(app);
  await photoAgent.post('/api/auth/login').set('Origin',origin).set('X-Requested-With','evolushon').send({user:'fotografo',pass:testPassword}).expect(200);
  await photoAgent.get('/api/admin/users').expect(403);
  for(const path of ['/publish','/discard','/restore/1'])await photoAgent.post('/api/admin/content'+path).set('Origin',origin).set('X-Requested-With','evolushon').send({baseVersion:version}).expect(403);
  const saved=await photoAgent.put('/api/admin/content/draft').set('Origin',origin).set('X-Requested-With','evolushon').send({baseVersion:version,data:changed}).expect(200);
  version=saved.body.version;assert.equal(saved.body.data.services[0].price,DEFAULT.services[0].price);
});
test('baseVersion: escrituras simultáneas, discard/import/restore obsoletos, publicación y ETag',async()=>{
  const d=(await content.getContent()).draft.data;d.services[0].price=91;
  const results=await Promise.allSettled([content.mutate('draft',version,'admin',adminId,d),content.mutate('draft',version,'admin',adminId,d)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const stale=results.find(r=>r.status==='rejected') as PromiseRejectedResult;assert.equal(stale.reason.code,'DRAFT_STALE');
  for(const action of ['discard','import','restore'] as const)await assert.rejects(content.mutate(action,version,'admin',adminId,d,1),{code:'DRAFT_STALE'});
  version=(await content.getContent()).draft.version;
  const etag=(await request(app).get('/api/public/site')).headers.etag;
  await content.mutate('publish',version,'admin',adminId);version++;
  // The HTTP app owns a separate public cache, so publish through it to verify invalidation.
  await mut('/api/admin/content/publish').send({baseVersion:version}).expect(200);version++;
  const live=await request(app).get('/api/public/site').expect(200);assert.notEqual(live.headers.etag,etag);assert.equal(live.body.services[0].price,91);
  await request(app).get('/api/public/site').set('If-None-Match',live.headers.etag).expect(304);
});
test('reserveSlot concurrente: 10 reservas de 1 persona con cupo 6 -> 6 altas, 4 SLOT_FULL',async()=>{
  await resetBookings();
  const results=await Promise.allSettled(Array.from({length:10},()=>bookings.create(input(),randomUUID(),'127.0.0.1')));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,6);
  const errors=results.filter(r=>r.status==='rejected') as PromiseRejectedResult[];
  assert.deepEqual(errors.map(r=>r.reason.code),Array(4).fill('SLOT_FULL'));
  assert.equal((await bookings.availability('s-grupal',future(),future())).taken[future()]['07:00'],6);
});
test('idempotencia concurrente: misma UUID devuelve siempre la reserva original aunque cambie el slot',async()=>{
  await resetBookings();const key=randomUUID();
  const results=await Promise.all(Array.from({length:5},(_,i)=>bookings.create(input({time:i%2?'09:00':'07:00'}),key,'127.0.0.1')));
  assert.equal(new Set(results.map(r=>r.booking.code)).size,1);
  assert.equal((await rows(db,'SELECT * FROM bookings')).length,1);
  assert.equal((await rows(db,'SELECT * FROM booking_events')).length,1);
  await request(app).post('/api/public/bookings').send(input()).expect(400);
});
test('retención: pendientes vencidas liberan cupo; confirmar pago exige recuperarlo',async()=>{
  await resetBookings();
  const first=await bookings.create(input({persons:6}),randomUUID(),'127.0.0.1');
  await exec(db,'UPDATE bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 25 HOUR) WHERE code=?',[first.booking.code]);
  assert.equal((await bookings.availability('s-grupal',future(),future())).taken[future()],undefined);
  const other=await bookings.create(input({persons:6}),randomUUID(),'127.0.0.1');
  await assert.rejects(bookings.patch(first.booking.code,{status:'pagada'},adminId),{code:'SLOT_FULL'});
  await bookings.patch(other.booking.code,{status:'cancelada'},adminId);
  const paid=await bookings.patch(first.booking.code,{status:'pagada'},adminId);assert.equal(paid.paid,paid.due);assert.equal(paid.holdExpired,false);
});
test('transiciones: reactivar cancelada o cambiar personas/horario respeta cupo y normaliza HH:mm',async()=>{
  await resetBookings();
  const a=await bookings.create(input({persons:6}),randomUUID(),null);
  const b=await bookings.create(input({time:'09:00'}),randomUUID(),null);
  await assert.rejects(bookings.patch(b.booking.code,{time:'07:00 AM'},adminId),{code:'SLOT_FULL'});
  await bookings.patch(a.booking.code,{status:'cancelada'},adminId);
  await bookings.patch(b.booking.code,{time:'07:00 AM',persons:6},adminId);
  await assert.rejects(bookings.patch(a.booking.code,{status:'por verificar'},adminId),{code:'SLOT_FULL'});
  assert.equal(normalizeTime('07:00 AM'),'07:00');assert.equal(normalizeTime('12:30 PM'),'12:30');
  assert.throws(()=>normalizeTime('25:00'),{code:'VALIDATION'});
});
test('GET_LOCK no concedido: reserveSlot falla reintentable y no ejecuta escritura',async()=>{
  let wrote=false,released=false;
  const fake={execute:async()=>[[{acquired:null}],[]],rollback:async()=>{},query:async()=>{released=true;}};
  await assert.rejects(reserveSlot(fake as never,{cat:'surf',date:future(),time:'07:00',persons:1,capacity:6},async()=>{wrote=true;}),{status:503,code:'SLOT_BUSY'});
  assert.equal(wrote,false);assert.equal(released,false);
});
test('validaciones de fecha Lima, lead, bloqueos y tarjeta desactivada',async()=>{
  await resetBookings();
  assert.equal(limaToday(new Date('2026-11-02T02:00:00Z')),'2026-11-01');
  await assert.rejects(bookings.create(input({date:future(-1)}),randomUUID(),null),{code:'VALIDATION'});
  await assert.rejects(bookings.create(input({date:'2026-02-30'}),randomUUID(),null),{code:'VALIDATION'});
  await assert.rejects(bookings.create(input({method:'card'}),randomUUID(),null),{code:'VALIDATION'});
  await assert.rejects(bookings.create(input({opt:99}),randomUUID(),null),{code:'VALIDATION'});
});
// WebP sintético con cabecera VP8X (el servidor solo lee la cabecera; ya no decodifica imágenes).
function webp(width:number,height:number,seed=''){
  const payload=Buffer.alloc(10);payload.writeUIntLE(width-1,4,3);payload.writeUIntLE(height-1,7,3);
  const extra=Buffer.from(seed);const pad=extra.length&1?Buffer.alloc(1):Buffer.alloc(0);
  const chunks=Buffer.concat([Buffer.from('VP8X'),Buffer.from([10,0,0,0]),payload,Buffer.from('EXIF'),Buffer.from([extra.length,0,0,0]),extra,pad]);
  const head=Buffer.alloc(12);head.write('RIFF',0,'ascii');head.writeUInt32LE(4+chunks.length,4);head.write('WEBP',8,'ascii');
  return Buffer.concat([head,chunks]);
}
const post=(full:Buffer,thumb:Buffer,name='sesiones-clase-grupal-20261101-k3f9qa')=>agent.post('/api/admin/photos').set('Origin',origin).set('X-Requested-With','evolushon')
  .attach('full',full,{filename:name+'.webp',contentType:'image/webp'}).attach('thumb',thumb,{filename:name+'-thumb.webp',contentType:'image/webp'}).field('originalBytes','3456789');
test('fotos: WebP del navegador (full + thumb), nombres, dedupe, validación y purge con referencias',async()=>{
  const response=await post(webp(1600,1035,'a'),webp(640,414,'a')).expect(201);
  const photo=response.body;
  assert.deepEqual(photo.variants.map((v:{w:number})=>v.w),[640,1600]);
  assert.equal(photo.width,1600);assert.equal(photo.height,1035);assert.equal(photo.originalBytes,3456789);
  assert.match(photo.src,/^\/uploads\/\d{4}\/\d{2}\/sesiones-clase-grupal-20261101-k3f9qa\.webp$/);
  for(const variant of photo.variants)await readFile(resolve(env.UPLOADS_DIR,variant.webp.slice('/uploads/'.length)));
  const duplicate=await post(webp(1600,1035,'a'),webp(640,414,'a'),'sesiones-otra-20261101-zzzzzz').expect(201);assert.equal(duplicate.body.id,photo.id);
  const tiny=await post(webp(120,80,'b'),webp(120,80,'b'),'portada-mini-20261101-abc123').expect(201);assert.equal(tiny.body.width,120);
  await post(Buffer.from('%PDF-1.4 no image'),webp(10,10),'galeria-falsa-20261101-aaaaaa').expect(415);
  await post(webp(100,100,'c'),webp(50,50,'c'),'../../etc/passwd').expect(400);
  await post(webp(100,100,'d'),webp(50,50,'d'),'galeria-sin-fecha').expect(400);
  await post(Buffer.concat([webp(100,100,'e'),Buffer.alloc(6*1024*1024)]),webp(50,50,'e'),'galeria-grande-20261101-bbbbbb').expect(413);
  await agent.post('/api/admin/photos').set('Origin',origin).set('X-Requested-With','evolushon').attach('full',webp(10,10,'f'),{filename:'galeria-jpg-20261101-cccccc.webp',contentType:'image/jpeg'}).attach('thumb',webp(10,10,'f'),{filename:'galeria-jpg-20261101-cccccc-thumb.webp',contentType:'image/jpeg'}).expect(415);
  const data=await content.getContent();data.draft.data.gallery.push(photo);
  await content.mutate('draft',data.draft.version,'admin',adminId,data.draft.data);
  await agent.delete('/api/admin/photos/'+photo.id).set('Origin',origin).set('X-Requested-With','evolushon').expect(204);
  await mut('/api/admin/photos/purge').send({ids:[photo.id]}).expect(409);
  await request(app).get(photo.src).expect(200).expect('Cache-Control',/immutable/);
  await mut('/api/admin/photos/purge').send({ids:[tiny.body.id]}).expect(200);
});
test('usuarios: último admin protegido y cambio de rol revoca sesiones',async()=>{
  await agent.delete('/api/admin/users/'+adminId).set('Origin',origin).set('X-Requested-With','evolushon').expect(400);
  const [u]=await rows(db,"SELECT id FROM users WHERE username='fotografo'");
  await agent.patch('/api/admin/users/'+u.id).set('Origin',origin).set('X-Requested-With','evolushon').send({role:'editor'}).expect(200);
  assert.equal((await rows(db,'SELECT * FROM sessions WHERE user_id=?',[u.id])).length,0);
  // Alta con correo opcional: usuario o correo repetidos (incluido el del admin) dan 409; la lista expone el correo.
  const send=(path:string,body:object)=>agent.post(path).set('Origin',origin).set('X-Requested-With','evolushon').send(body);
  await send('/api/admin/users',{username:'lucho.silva',name:'Lucho Silva',email:'Lucho@Example.test',role:'editor',password:'clave-larga-123'}).expect(201);
  await send('/api/admin/users',{username:'lucho.silva',name:'Otro',role:'editor',password:'clave-larga-123'}).expect(409);
  await send('/api/admin/users',{username:'otro',name:'Otro',email:'lucho@example.test',role:'editor',password:'clave-larga-123'}).expect(409);
  await send('/api/admin/users',{username:'otro2',name:'Otro',email:'test@example.test',role:'editor',password:'clave-larga-123'}).expect(409);
  await send('/api/admin/users',{username:'sin.correo',name:'Sin correo',email:'',role:'fotografo',password:'clave-larga-123'}).expect(201);
  const list=(await agent.get('/api/admin/users').expect(200)).body as {username:string;email:string|null}[];
  assert.equal(list.find(x=>x.username==='lucho.silva')?.email,'lucho@example.test');
  assert.equal(list.find(x=>x.username==='sin.correo')?.email,null);
});
test('HTTP SEO, redirecciones, sitemap dinámico, robots, 404 y mantenimiento',async()=>{
  const h=await request(app).get('/es/').expect(200);assert.match(h.text,/<title data-ssr>/);assert.match(h.text,/rel="canonical"/);assert.match(h.text,/application\/ld\+json/);assert.match(h.text,/id="evo-data"/);
  await request(app).get('/surftrips/').expect(301).expect('Location','/es/servicios?category=trip');
  await request(app).get('/en/surftrips/').expect(301).expect('Location','/en/services?category=trip');
  await request(app).get('/es/servicios/no-existe').expect(404);
  const xml=await request(app).get('/sitemap.xml').expect(200);assert.equal((xml.text.match(/<loc>/g)||[]).length,56);
  const robots=await request(app).get('/robots.txt').expect(200);assert.match(robots.text,/Disallow: \/admin/);assert.match(robots.text,new RegExp(origin.replaceAll('.','\\.')+'/sitemap.xml'));
  const {app:maintenance}=createApp(db,{ready:false,error:'Migración fallida'});
  await request(maintenance).get('/api/public/site').expect(503);
  await request(maintenance).get('/healthz/deep').expect(503);
});
