import express from 'express';
import mysql from 'mysql2/promise';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
const TINY_WEBP = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
export function createProbe(pool, uploads) {
  return async function probe(deep = false) {
    const result = { ok: false, db: false, uploads: false, uptimeSec: Math.floor(process.uptime()) };
    try {
      const connection = await pool.getConnection();
      try {
        await connection.query({ sql: 'SELECT 1', timeout: 2000 });
        result.db = true;
        await mkdir(uploads, { recursive: true });
        if (deep) {
          await connection.query('CREATE TABLE IF NOT EXISTS t0_probe (id INT PRIMARY KEY, marker VARCHAR(80) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
          await connection.execute('INSERT IGNORE INTO t0_probe (id, marker) VALUES (1, ?)', [randomUUID()]);
          const [rows] = await connection.query('SELECT marker, created_at FROM t0_probe WHERE id=1');
          result.persistedRow = rows[0];
          const file = resolve(uploads, '.t0-persistence.webp');
          // WebP 1×1 fijo: comprueba que un archivo escrito en UPLOADS_DIR sigue ahí tras un redeploy.
          try { await access(file); } catch { await writeFile(file, Buffer.from(TINY_WEBP, 'base64')); }
          const bytes = await readFile(file);
          result.webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
          result.persistedFile = (await readFile(file)).toString('base64');
        }
        const check = resolve(uploads, '.health-' + randomUUID());
        await writeFile(check, 'ok');
        result.uploads = (await readFile(check, 'utf8')) === 'ok';
        const { unlink } = await import('node:fs/promises');
        await unlink(check);
      } finally { connection.release(); }
    } catch (error) { result.error = error.code || error.message; }
    result.ok = result.db && result.uploads && (!deep || result.webp);
    return result;
  };
}
export async function startProbe() {
  const app = express();
  const pool = mysql.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, connectionLimit: 2, connectTimeout: 2000, timezone: 'Z', dateStrings: true });
  pool.on('connection', connection => { connection.query("SET time_zone = '+00:00'"); });
  const probe = createProbe(pool, resolve(process.env.UPLOADS_DIR || 'uploads-dev'));
  for (const path of ['/healthz', '/healthz/deep']) app.get(path, async (_req, res) => { const result = await probe(path.endsWith('/deep')); res.status(result.ok ? 200 : 503).json(result); });
  const server = app.listen(Number(process.env.PORT || 3000), () => process.stdout.write('T0 listening\n'));
  const stop = () => server.close(async () => { await pool.end(); process.exit(0); });
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
