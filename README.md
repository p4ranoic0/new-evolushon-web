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

## Reseñas reales y redes

El seed ya no crea reseñas de muestra. En el arranque, una migración de contenido idempotente elimina exclusivamente `sample: true` del borrador y publicado, asigna `source: manual` a las antiguas y aumenta su versión para detectar editores abiertos. No altera snapshots archivados. El filtrado público también excluye ejemplos/ocultas del HTML inyectado y de `/api/public/site`, incluso al restaurar o importar versiones antiguas. Sin reseñas reales, se muestran puntuación/enlaces únicamente si hay URL de Maps; sin ella se oculta la sección.

En Admin → Reseñas se elige fuente (Google, Instagram, TikTok o manual) y enlace original. «Importar comentarios de redes» lee localmente `comentarios.json` (máximo 5 MB/5000 comentarios), ordena candidatos primero y permite seleccionar los que se añaden al borrador; no publica automáticamente ni sube el banco completo. Omite duplicados por enlace + autor + texto ES. Pide permiso a los autores antes de publicar. El banco `content/redes/` continúa fuera de git.

Para preparar Google, crear un proyecto de Google Cloud con facturación, habilitar **Places API (New)** y crear una clave restringida a esa API y, si Hostinger dispone de IP de salida estable, a esa IP. Obtener el identificador de la ficha con el [Place ID Finder oficial](https://developers.google.com/maps/documentation/places/web-service/place-id). Configurar `GOOGLE_PLACES_API_KEY` y `GOOGLE_PLACE_ID` solo en el entorno del servidor de Hostinger y reiniciar. [Guía oficial de claves](https://developers.google.com/maps/documentation/places/web-service/get-api-key). No usar prefijo `VITE_`. Sin ambas variables la integración está inactiva.

La integración implementa consulta bajo demanda como máximo cada 24 h **por idioma y Place ID**, hasta 5 reseñas seleccionadas por Google, con memoria + tabla MySQL, intentos fallidos también limitados y caché anterior como respaldo. No descarga todo el historial ni modifica el contenido versionado. El admin muestra el estado y las reseñas de solo lectura; el público muestra autor, enlace/perfil/foto cuando existen, fecha relativa y atribución. Más detalles y límites contractuales en [RUNBOOK](docs/RUNBOOK.md#google-places-reseñas-opcionales).
