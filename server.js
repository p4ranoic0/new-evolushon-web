import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
if (existsSync('.env')) loadEnvFile('.env');
if (process.env.T0_ONLY === '1') {
  await (await import('./server/t0.js')).startProbe();
} else {
  await import('./server-dist/server/index.js');
}
