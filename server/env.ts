import { z } from 'zod';
import { resolve } from 'node:path';
const flag = z.enum(['0', '1']).default('0').transform(v => v === '1');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  PUBLIC_URL: z.url().transform(v => new URL(v).origin),
  DB_HOST: z.string().min(1), DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/), DB_USER: z.string().min(1), DB_PASSWORD: z.string(),
  DB_POOL_SIZE: z.coerce.number().int().min(1).max(20).default(5),
  UPLOADS_DIR: z.string().min(1).transform(v => resolve(v)),
  ADMIN_INITIAL_EMAIL: z.email().optional(), ADMIN_INITIAL_PASSWORD: z.string().min(10).optional(),
  MIGRATE_ON_START: z.enum(['0','1']).default('1').transform(v => v === '1'),
  HOLD_HOURS: z.coerce.number().min(1).max(720).default(24),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
  LOG_LEVEL: z.enum(['silent','fatal','error','warn','info','debug','trace']).default('info'),
  CSP_ENFORCE: flag, FORCE_HTTPS: flag,
  KEEP_ORIGINALS: flag,
});
export const env = schema.parse(process.env);
process.env.TZ = 'America/Lima';
export type Env = typeof env;
