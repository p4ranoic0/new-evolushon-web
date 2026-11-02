import { mkdir } from 'node:fs/promises';
import { pool,exec } from './db/pool.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { env } from './env.js';
import { createApp,log,type RuntimeState } from './app.js';
const state:RuntimeState={ready:false};
const {app,google}=createApp(pool,state);
const server=app.listen(env.PORT,()=>log.info({port:env.PORT},'listening'));
try {
  await mkdir(env.UPLOADS_DIR,{recursive:true});
  if(env.MIGRATE_ON_START){await migrate(pool);log.info('migrations applied');}
  await seed(pool);log.info('seed done');
  await exec(pool,'DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP(3) OR created_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 30 DAY)');
  await google.purge();
  state.ready=true;
} catch(error) {state.error='Error de inicialización; revisar los logs del servidor';log.error({err:error},'maintenance mode');}
// La purga sigue activa aunque se retiren las variables de Google.
const cachePurge=setInterval(()=>{if(state.ready)void google.purge().catch(()=>log.warn('Google cache purge failed'));},60*60*1000);
cachePurge.unref();
let closing=false;
const stop=()=>{if(closing)return;closing=true;clearInterval(cachePurge);server.close(async()=>{await pool.end();process.exit(0);});server.closeIdleConnections();};
process.on('SIGTERM',stop);process.on('SIGINT',stop);
