import { hash } from 'bcryptjs';
import type { Pool } from 'mysql2/promise';
import { pathToFileURL } from 'node:url';
import { migrate } from '../../shared/index.js';
import { SEED } from '../../shared/seed.js';
import { env } from '../env.js';
import { exec, pool, rows, json } from './pool.js';
export async function seed(db: Pool) {
  const c = await db.getConnection();
  let locked = false;
  try {
    const [lock] = await rows(c, "SELECT GET_LOCK('evo_seed',10) AS acquired");
    if (Number(lock.acquired) !== 1) throw new Error('Seed ocupado; reintentar arranque');
    locked = true;
    await c.beginTransaction();
    const [versions] = await rows(c, 'SELECT COUNT(*) AS n FROM site_versions');
    if (!Number(versions.n)) {
      const data = migrate(SEED);
      data.settings.booking.methods.card = false;
      for (const status of ['published','draft']) await exec(c, 'INSERT INTO site_versions(status,data,published_at) VALUES (?,?,UTC_TIMESTAMP(3))', [status, JSON.stringify(data)]);
    }
    // Migración de contenido acotada e idempotente. Bloquea los documentos activos,
    // conserva snapshots archivados y aumenta version para invalidar editores abiertos.
    for (const row of await rows(c, "SELECT id,data FROM site_versions WHERE status IN ('draft','published') FOR UPDATE")) {
      const data = json<import('../../shared/types.js').SiteData>(row.data);
      if (!Array.isArray(data.reviews)) continue;
      const clean = data.reviews.filter(r => r.sample !== true);
      const changed = clean.length !== data.reviews.length || clean.some(r => r.source == null);
      if (!changed) continue;
      data.reviews = clean.map(r => ({ ...r, source: r.source ?? 'manual' }));
      await exec(c, 'UPDATE site_versions SET data=?,version=version+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?', [JSON.stringify(data),row.id]);
    }
    const [users] = await rows(c, 'SELECT COUNT(*) AS n FROM users');
    if (!Number(users.n)) {
      if (!env.ADMIN_INITIAL_EMAIL || !env.ADMIN_INITIAL_PASSWORD) throw new Error('Falta configurar ADMIN_INITIAL_EMAIL y ADMIN_INITIAL_PASSWORD para crear el administrador inicial');
      await exec(c, 'INSERT INTO users(username,email,name,role,password_hash) VALUES (?,?,?, ?,?)', ['admin',env.ADMIN_INITIAL_EMAIL,'Administrador','admin',await hash(env.ADMIN_INITIAL_PASSWORD,12)]);
    }
    await c.commit();
  } catch(e) { await c.rollback(); throw e; }
  finally { try { if(locked) await c.query("SELECT RELEASE_LOCK('evo_seed')"); } finally { c.release(); } }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await seed(pool); console.log('seed done'); } finally { await pool.end(); }
}
