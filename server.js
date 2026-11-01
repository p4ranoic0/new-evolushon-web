import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
// Sin top-level await: Hostinger (LiteSpeed lsnode.js) carga este archivo con require(),
// que falla con ERR_REQUIRE_ASYNC_MODULE si el grafo ESM tiene await de nivel superior.
// Los módulos cargados con import() dinámico sí pueden usarlo.
if (existsSync('.env')) loadEnvFile('.env');
const start = process.env.T0_ONLY === '1'
  ? import('./server/t0.js').then((m) => m.startProbe())
  : import('./server-dist/server/index.js');
start.catch((error) => {
  console.error(error);
  process.exit(1);
});
