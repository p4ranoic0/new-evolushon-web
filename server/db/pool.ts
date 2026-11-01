import mysql from 'mysql2/promise';
import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { env } from '../env.js';
export type DB = Pool | PoolConnection;
export const makePool = (database = env.DB_NAME) => {
const result = mysql.createPool({
  host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD,
  database, connectionLimit: env.DB_POOL_SIZE, connectTimeout: 2000,
  timezone: 'Z', dateStrings: true, charset: 'utf8mb4',
  waitForConnections: true, queueLimit: 100,
});
// DATETIME columns and SQL defaults must use UTC regardless of the host's timezone.
result.on('connection', connection => { connection.query("SET time_zone = '+00:00'"); });
return result;
};
export const pool = makePool();
function sqlValues(params: unknown[]) {
  return params.map(v => {
    if(v===null || typeof v==='string' || typeof v==='number' || typeof v==='boolean' || v instanceof Date || Buffer.isBuffer(v)) return v;
    throw new TypeError('Parámetro SQL inválido');
  });
}
export async function rows(db: DB, sql: string, params: unknown[] = []) {
  const [result] = await db.execute<RowDataPacket[]>(sql, sqlValues(params));
  return result;
}
export async function exec(db: DB, sql: string, params: unknown[] = []) {
  const [result] = await db.execute<ResultSetHeader>(sql, sqlValues(params));
  return result;
}
export function json<T>(value: T | string): T { return typeof value === 'string' ? JSON.parse(value) : value; }
export function iso(value: string | Date | null): string | null {
  if (!value) return null;
  return new Date(typeof value === 'string' && !value.includes('T') ? value.replace(' ', 'T') + 'Z' : value).toISOString();
}
export async function transaction<T>(db: Pool, fn: (c: PoolConnection) => Promise<T>): Promise<T> {
  const c = await db.getConnection();
  try { await c.beginTransaction(); const result = await fn(c); await c.commit(); return result; }
  catch (e) { await c.rollback(); throw e; }
  finally { c.release(); }
}
