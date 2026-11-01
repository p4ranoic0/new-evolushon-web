import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import type { Pool } from 'mysql2/promise';
import { exec, pool, rows } from './pool.js';

// DDL implicitly commits in MySQL. Every statement must tolerate replay after an interruption.
export async function migrate(db: Pool, options: { directory?: string; afterStatement?: (n: number) => void; retryMs?: number } = {}) {
  const c = await db.getConnection();
  let locked = false;
  try {
    for (;;) {
      const [r] = await rows(c, "SELECT GET_LOCK('evo_migrate', 10) AS acquired");
      if (Number(r.acquired) === 1) { locked = true; break; }
      await delay(options.retryMs ?? 1000);
    }
    await exec(c, 'CREATE TABLE IF NOT EXISTS migrations (id INT PRIMARY KEY, name VARCHAR(120) NOT NULL, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB');
    const directory = options.directory || resolve('server/db/migrations');
    const applied = new Set((await rows(c, 'SELECT id FROM migrations')).map(r => Number(r.id)));
    let statements = 0;
    const names = (await readdir(directory)).filter(v => /^\d{4}_.*\.sql$/.test(v)).sort();
    for (const name of names) {
      const id = Number(name.slice(0,4));
      if (applied.has(id)) continue;
      const sql = await readFile(resolve(directory,name), 'utf8');
      for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) {
        await exec(c, statement);
        options.afterStatement?.(++statements);
      }
      await exec(c, 'INSERT INTO migrations(id,name) VALUES (?,?)', [id, name]);
    }
  } finally {
    try { if (locked) await c.query("SELECT RELEASE_LOCK('evo_migrate')"); } finally { c.release(); }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await migrate(pool); console.log('migrations applied'); } finally { await pool.end(); }
}
