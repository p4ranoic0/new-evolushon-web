# Evolushon Surf Experience

Sitio público en español, inglés, francés y alemán, y panel `/admin`. React 19 + Vite 7, servidor Node 22 + Express 5 y MySQL. El contenido publicado, borradores, sesiones, reservas y metadatos de fotos viven en MySQL. Las fotos se comprimen, convierten a WebP y renombran en el navegador (`browser-image-compression`, `heic2any` para HEIC); el servidor solo valida la cabecera WebP y las guarda fuera del despliegue.

## Desarrollo

1. Usar Node 22 (`nvm use`) y MySQL 8+ o MariaDB 10.6+. No hace falta Docker.
2. Crear `evolushon_dev`, `evolushon_test` y un usuario dedicado con permisos sobre ambas. La suite vacía **solo** la base cuyo nombre termina en `_test`.
3. `cp .env.example .env` y configurar DB, `UPLOADS_DIR`, `PUBLIC_URL` y credenciales iniciales. No versionar `.env`.
4. `npm ci && npm run build && npm start`: producción local en `http://localhost:3000`. Al arrancar migra y siembra sin sobrescribir datos existentes. `admin` inicia sesión con `ADMIN_INITIAL_PASSWORD`; cambiarla desde Ajustes y retirar las variables iniciales.
5. Para desarrollo separado: `PUBLIC_URL=http://localhost:5173`, `npm run dev:server` y `npm run dev` en otra terminal. Vite redirige API/uploads al servidor 3000; el head inyectado se comprueba con build + start.

`npm run lint` verifica TypeScript/frontend/backend. `npm test` ejecuta pruebas reales con MySQL: migraciones interrumpidas, sesiones/roles, conflicto de borrador, cupo concurrente, idempotencia, retención, imágenes y SEO. Requiere `.env` y base de pruebas previamente creada. `npm run migrate` y `npm run seed` permiten ejecutar esos pasos por separado después del build.

## Operación

- [T0 y checklist de Hostinger](docs/hostinger-t0.md): completar antes de lanzar en el dominio.
- [Despliegue](DEPLOYMENT.md) y [runbook](docs/RUNBOOK.md): respaldos, restauración y recuperación de admin.
- [Spec aprobado](docs/specs/2026-11-01-backend-hostinger.md): la §12 prevalece sobre las decisiones anteriores.
- `npm run t0` activa el servidor mínimo de persistencia. El entry definitivo es `server.js`.
- `npm run reset-admin` recupera la cuenta `admin` usando `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` del entorno; revoca todas sus sesiones.
- `scripts/backup.sh` respalda MySQL remoto + uploads por SSH/rsync y conserva 8 copias identificadas por el script.

No hay pagos reales. Yape/Plin generan reservas «por verificar». Si se habilita tarjeta, solo genera «pendiente» para coordinar el pago; no se solicitan datos de tarjeta. Las reservas pendientes retienen cupo durante `HOLD_HOURS` (24 por defecto); pagadas y completadas lo conservan.

El admin guarda cambios en el borrador del servidor, publica para compartirlos y detecta conflictos entre pestañas con `baseVersion`. El navegador conserva únicamente preferencias y un respaldo opcional del borrador. Ajustes permite importar los datos del antiguo localStorage, exportar JSON, gestionar usuarios y purgar fotos sin referencias en ninguna versión conservada. Borrar una foto de la galería es lógico; no elimina sus archivos automáticamente.
