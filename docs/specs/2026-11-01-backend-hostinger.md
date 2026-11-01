# Spec técnico: backend Node + MySQL en Hostinger para Evolushon

Fecha: 2026-11-01 · Repo: `p4ranoic0/new-evolushon-web` (rama `main`) · Dominio: `evolushonsurfexperience.com`
Estado: propuesta para implementación. No incluye código.

## 1. Objetivo y fuera de alcance

### Objetivo
Convertir la SPA actual (React 19 + Vite 7, todo en `localStorage`) en una app Node.js desplegada en Hostinger desde GitHub, con:

- Contenido compartido entre todos los visitantes y editores (MySQL): servicios, galería, reseñas, textos del inicio, ajustes, usuarios, historial de publicaciones.
- Reservas públicas persistidas y validadas en servidor (sin sobreventa por horario × categoría).
- Autenticación real con roles `admin` / `editor` / `fotografo`, contraseñas cifradas, gestión desde Ajustes.
- Fotos subidas al servidor, procesadas con `sharp` y servidas desde un directorio fuera del despliegue.
- HTML con `<head>` SEO por ruta e idioma, 301 de las URLs del WordPress anterior, 404 real, sitemap dinámico.
- El panel `/admin` conserva su UX (borrador → publicar, historial, deshacer/rehacer, editores) cambiando solo la capa de persistencia.

### Fuera de alcance (esta fase)
- Pagos reales (Culqi, Mercado Pago, Stripe). Las reservas siguen en «por verificar» con WhatsApp; el formulario de tarjeta se retira (ver 5.4).
- SSR completo de React. Se inyecta el `<head>` y los datos publicados en `index.html`; el cuerpo lo renderiza el cliente.
- Traducción automática, correos transaccionales, notificaciones push, multi-tenant.
- Almacenamiento en objetos (S3/R2). Queda como plan B si Hostinger no garantiza persistencia de disco (ver 11.2).
- Panel para editar textos de UI (`ui.ts`, `booking-ui.ts`): siguen en el bundle.

## 2. Arquitectura

### 2.1 Stack del servidor (mínimo razonable)

| Dependencia | Para qué | Por qué esta |
|---|---|---|
| `express` 5 | HTTP, routing, estáticos | Ecosistema maduro (helmet, rate-limit, multer); Express 5 maneja `async` handlers sin wrappers. Hono sería más ligero pero sus adaptadores de estáticos/multipart en Node son menos probados. |
| `mysql2` (`/promise`) | Pool MySQL, `?` placeholders, JSON nativo | Driver estándar; soporte de `JSON` y prepared statements. Sin ORM ni query builder: ~15 consultas en total, SQL plano en `server/db/queries.ts`. |
| `zod` | Validar `env`, cuerpos de la API y el documento `SiteData` | Tipos inferidos compartidos con el frontend (`shared/schemas.ts`). |
| `bcryptjs` | Hash de contraseñas (coste 12) | Puro JS: cero riesgo de compilación nativa en Hostinger. Con 3–5 usuarios el coste extra frente a argon2 es irrelevante. |
| `multer` (memoryStorage) | Multipart de subidas | Un archivo por petición, límite por tamaño; el buffer va directo a sharp. |
| `sharp` | Variantes WebP/AVIF, quitar EXIF, dimensiones | Único módulo nativo; usa binarios precompilados (`@img/sharp-linux-x64`), sin toolchain. |
| `helmet` | Cabeceras de seguridad | Estándar; CSP en modo report-only primero. |
| `express-rate-limit` | Límite de login, reservas, subidas | Store en memoria (un solo proceso). |
| `compression` | gzip/brotli de HTML/JSON | Sustituye `mod_deflate`. |
| `pino` + `pino-http` | Logs JSON a stdout | Hostinger muestra stdout en el panel; sin archivos de log. |
| `cookie` | Parsear/serializar la cookie de sesión | Sin `express-session`: la sesión vive en la tabla `sessions`. |
| dev: `tsx`, `vitest`, `supertest` | Ejecutar TS en desarrollo, tests | — |

No se usan: `dotenv` (Node ≥ 22 trae `--env-file`), ORM, Redis, colas.

### 2.2 Estructura de carpetas (monorepo simple, un `package.json`)

```
server.js                 # entry de Hostinger: import("./server-dist/server/index.js")
server/
  index.ts                # arranque: env → db → migrate → seed → listen
  app.ts                  # createApp(): middlewares + rutas (testeable sin listen)
  env.ts                  # zod sobre process.env
  db/pool.ts              # mysql2 pool, helper tx()
  db/migrate.ts           # runner de migraciones SQL
  db/migrations/0001_init.sql ...
  db/seed.ts              # contenido inicial desde shared/seed
  auth/{password,session,guard}.ts
  routes/{public,auth,content,photos,bookings,users,seo,static}.ts
  services/{content,bookings,images,head,sitemap}.ts
  tsconfig.json           # outDir ../server-dist, incluye shared/
shared/                   # código isomórfico SIN DOM (lo importan server y src)
  types.ts  seed.ts  migrate.ts  routes.ts (slugs, pathFor)  seo-text.ts  schemas.ts
src/                      # frontend actual; src/store/ pasa a usar shared/ + api
dist/                     # salida de Vite (gitignored)
server-dist/              # salida de tsc del servidor (gitignored)
docs/specs/
```

Scripts en `package.json`:

```
"dev":          "vite"                                  # proxy /api, /uploads, /sitemap.xml → :3000
"dev:server":   "node --watch --env-file=.env --import tsx server/index.ts"
"build":        "tsc -b && vite build && tsc -p server/tsconfig.json"
"start":        "node server.js"
"migrate":      "node --env-file=.env server-dist/server/db/migrate.js"
"seed":         "node --env-file=.env server-dist/server/db/seed.js"
"test":         "vitest run"
```

`engines.node: ">=22"`, `.nvmrc` = `22`. `server.js` existe para que Hostinger tenga un entry `.js` fijo aunque el servidor esté en TS.

### 2.3 Flujo general

```
navegador ──GET /es/servicios/s-grupal──▶ Node
   Node: ruta válida? → lee published (caché en memoria, invalidada al publicar)
         → index.html + <head> SEO + <script id="evo-data"> JSON publicado
         → 200 (o 404 con noindex, o 301 para URLs WP)
navegador ──GET /assets/*.js (immutable 1 año)
React hidrata con window.__EVO_DATA__ (sin spinner); admin usa /api/admin/*
```

## 3. Esquema MySQL

Charset `utf8mb4`, collation `utf8mb4_0900_ai_ci`, engine InnoDB, MySQL 8.x (Hostinger ofrece 8.0; MariaDB 10.6+ también funciona salvo `JSON` nativo → `LONGTEXT` con `CHECK(JSON_VALID)`; la migración 0001 debe ser compatible con ambos).

### 3.1 Decisión: contenido como documento versionado, operación normalizada

El admin edita un `SiteData` completo con deshacer/rehacer, `diff(draft, live)`, publicar y restaurar snapshots. Normalizar servicios × 4 idiomas × borrador/publicado obligaría a versionar fila por fila sin aportar nada (no hay consultas relacionales sobre el contenido). Por eso:

- **Contenido editorial** (servicios, galería como metadatos editoriales, álbumes, reseñas, textos del inicio, ajustes salvo usuarios) → `site_versions.data` JSON, con exactamente una fila `draft` y una `published`; las anteriores quedan `archived` (historial).
- **Operación** (usuarios, sesiones, reservas, archivos de fotos) → tablas normalizadas con índices.

### 3.2 Tablas

```sql
CREATE TABLE migrations (
  id INT PRIMARY KEY, name VARCHAR(120) NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(40) NOT NULL UNIQUE,            -- minúsculas, [a-z0-9._-]
  name VARCHAR(80) NOT NULL,
  role ENUM('admin','editor','fotografo') NOT NULL,
  password_hash VARCHAR(100) NOT NULL,             -- bcrypt
  active TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts TINYINT NOT NULL DEFAULT 0,
  locked_until DATETIME(3) NULL,
  last_login_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE sessions (
  token_hash CHAR(64) PRIMARY KEY,                 -- sha256(token aleatorio 32 bytes)
  user_id INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at DATETIME(3) NOT NULL,
  expires_at DATETIME(3) NOT NULL,                 -- máx. 7 días; inactividad 12 h
  ip VARCHAR(45) NULL, user_agent VARCHAR(255) NULL,
  INDEX ix_sessions_user (user_id), INDEX ix_sessions_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE site_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('draft','published','archived') NOT NULL,
  version INT NOT NULL DEFAULT 1,                  -- control optimista del draft (++ en cada PUT)
  data JSON NOT NULL,                              -- SiteData sin settings.users
  summary JSON NULL,                               -- {services, gallery, other} al publicar
  created_by INT NULL,                             -- users.id (NULL = seed)
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  published_at DATETIME(3) NULL,
  INDEX ix_versions_status (status, published_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
-- Invariante (aplicada en código, dentro de transacción): 1 draft, 1 published.

CREATE TABLE photos (                              -- registro de archivos; lo editorial va en el documento
  id VARCHAR(40) PRIMARY KEY,                      -- "p-" + 12 hex (compatible con Photo.id)
  sha256 CHAR(64) NOT NULL,
  mime VARCHAR(40) NOT NULL,                       -- del original recibido
  original_name VARCHAR(255) NULL,
  original_bytes INT UNSIGNED NOT NULL,
  width SMALLINT UNSIGNED NOT NULL, height SMALLINT UNSIGNED NOT NULL,
  variants JSON NOT NULL,                          -- [{w,format,path,bytes}]
  bytes INT UNSIGNED NOT NULL,                     -- suma de variantes
  uploaded_by INT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX ix_photos_sha (sha256), INDEX ix_photos_deleted (deleted_at),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE bookings (
  code CHAR(10) PRIMARY KEY,                       -- "EVO-XXXXXX"
  service_id VARCHAR(40) NOT NULL,
  service_name VARCHAR(120) NOT NULL,              -- en el idioma del cliente
  service_name_es VARCHAR(120) NOT NULL,
  cat ENUM('surf','surfskate','trip') NOT NULL,
  opt VARCHAR(10) NOT NULL,                        -- 'single' | '4' | '8' | '12'
  persons TINYINT UNSIGNED NOT NULL,
  date DATE NOT NULL, time VARCHAR(10) NOT NULL,   -- "07:00" o "07:00 AM" (trips)
  name VARCHAR(120) NOT NULL, email VARCHAR(160) NOT NULL, phone VARCHAR(40) NOT NULL,
  level VARCHAR(20) NOT NULL, class_lang ENUM('es','en','fr','de') NOT NULL,
  notes TEXT NULL,
  method ENUM('card','yape','plin') NOT NULL,
  currency VARCHAR(4) NOT NULL,
  total DECIMAL(10,2) NOT NULL, due DECIMAL(10,2) NOT NULL, paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pendiente','por verificar','pagada','completada','cancelada') NOT NULL,
  lang ENUM('es','en','fr','de') NOT NULL,
  source ENUM('web','admin','import') NOT NULL DEFAULT 'web',
  ip VARCHAR(45) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX ix_bookings_slot (cat, date, time, status),   -- cálculo de cupos
  INDEX ix_bookings_status (status, date),
  INDEX ix_bookings_created (created_at),
  INDEX ix_bookings_email (email)
);

CREATE TABLE booking_events (                      -- auditoría de cambios de estado
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code CHAR(10) NOT NULL,
  user_id INT NULL,                                -- NULL = público/sistema
  from_status VARCHAR(20) NULL, to_status VARCHAR(20) NOT NULL,
  paid DECIMAL(10,2) NULL, note VARCHAR(255) NULL,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX ix_events_booking (booking_code),
  FOREIGN KEY (booking_code) REFERENCES bookings(code) ON DELETE CASCADE
);
```

Tamaño esperado: `site_versions.data` ≈ 60–120 KB por versión (las fotos son URLs, no base64). Con 20 versiones archivadas, < 3 MB.

### 3.3 Cambios en el documento `SiteData`

- `settings.users` desaparece del documento (tabla `users`). El tipo `User` del frontend pierde `pass`.
- `Photo.src` pasa a ser una URL (`/uploads/2026/p-abc123-1600.webp`) o una ruta `src/assets/...` del seed. Se añaden opcionales `width`, `height`, `variants: {w:number; webp:string; avif?:string}[]`.
- `Service.cover` admite las mismas formas que `Photo.src`.
- `Booking.demo` se elimina.
- Sin otros cambios: el resto de tipos y `migrate()` se mueven a `shared/` y se reutilizan tal cual.

### 3.4 Migraciones

- Archivos `server/db/migrations/NNNN_nombre.sql` con sentencias separadas por `;` (sin DELIMITER, sin procedimientos). `0001_init.sql` crea todo lo anterior.
- Runner (`server/db/migrate.ts`): `GET_LOCK('evo_migrate', 30)` → crea `migrations` si no existe → aplica las pendientes en orden dentro de una conexión → `RELEASE_LOCK`. Idempotente.
- En Hostinger no hay consola garantizada: con `MIGRATE_ON_START=1` (valor por defecto) el runner corre en cada arranque antes de `listen`. Coste cuando no hay pendientes: una consulta. Si falla, el proceso termina con código 1 y el error queda en los logs del panel.
- Reversión: no hay `down`; una migración correctiva nueva. Antes de cambios destructivos, respaldo (sección 10).

### 3.5 Seed inicial

`server/db/seed.ts`, ejecutado tras migrar si `site_versions` está vacía:

1. `data = migrate(SEED)` desde `shared/seed.ts` y `shared/migrate.ts` (mismas reglas que hoy: `bookingDefaults`, álbumes, reseñas de ejemplo, `domain`), eliminando `settings.users`. Se fuerza `settings.booking.methods.card = false` (ver 5.4).
2. Inserta `published` (version 1, `published_at = NOW()`) y `draft` con los mismos datos.
3. Si `users` está vacía: crea `admin` (`name: "Administrador"`, role admin) con `ADMIN_INITIAL_PASSWORD` del entorno; si la variable no existe, genera una contraseña aleatoria de 16 chars y la escribe **una sola vez** en el log de arranque. No se crean `editor` ni `foto`: se gestionan desde Ajustes.
4. El seed nunca sobrescribe datos existentes. Las fotos del seed siguen siendo assets del bundle (`src/assets/`, 106 archivos, 39 MB) resueltos por `asset()`; no se copian a `UPLOADS_DIR`.

## 4. API REST

Prefijo `/api`. JSON UTF-8. Fechas ISO 8601 (UTC). Zona horaria de negocio: `America/Lima` (`TZ` fijado en env) para «hoy» y `lead`.

### 4.1 Convenciones

- Error: `{ "error": { "code": "SLOT_FULL", "message": "…", "details"?: zodIssues } }`.
- Códigos: 400 `VALIDATION`, 401 `UNAUTHENTICATED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `CONFLICT` | `SLOT_FULL` | `DRAFT_STALE`, 413 `TOO_LARGE`, 415 `UNSUPPORTED_MEDIA`, 423 `LOCKED` (cuenta), 429 `RATE_LIMITED`, 500 `INTERNAL` (sin stack en respuesta).
- Toda mutación del admin exige cookie válida **y** cabecera `X-Requested-With: evolushon` **y** `Origin` igual a `PUBLIC_URL` (CSRF, sección 7).
- Lectura pública: `Cache-Control` + `ETag`; escritura y admin: `Cache-Control: no-store`.

### 4.2 Público (sin sesión)

| Método y ruta | Respuesta | Caché / límites |
|---|---|---|
| `GET /api/public/site` | Documento publicado completo (`SiteData` sin usuarios) + `{ publishedAt, version }` | `public, max-age=60, stale-while-revalidate=600`, ETag. Caché en memoria del servidor, invalidada al publicar. |
| `GET /api/public/availability?service=ID&from=YYYY-MM-DD&to=YYYY-MM-DD` | `{ cat, capacity, slots: string[], taken: { "2026-11-15": { "07:00": 4 } } }` — personas ocupadas por fecha/horario, estados ≠ `cancelada`. Rango máx. 62 días. | `no-store`. 120/min por IP. |
| `POST /api/public/bookings` | 201 `{ code, status, date, time, total, due, currency, method }` | 5 por 10 min por IP, 40 por hora global. Honeypot `website` (si viene relleno → 201 falso sin insertar). |
| `GET /healthz` | `{ ok, db, uptimeSec, version, publishedAt }`; 503 si la BD no responde | `no-store`. Excluido de rate limit. |
| `GET /sitemap.xml`, `GET /robots.txt` | Ver sección 8 | `public, max-age=3600` |

Cuerpo de `POST /api/public/bookings` (zod):

```
sid: string (servicio activo publicado) · opt: "single" | number (paquete existente)
persons: int 1..capacity · date: YYYY-MM-DD · time: string (∈ slots de la categoría o depart del trip)
name: 2..120 · email: email · phone: 7..40 dígitos/+/espacios · level: "beginner"|"intermediate"|"advanced"
classLang: Lang · notes: ≤ 1000 · method: "yape"|"plin"|"card" (solo si methods[method] = true en publicado)
lang: Lang · website: "" (honeypot)
```

El servidor **recalcula** `total` y `due` desde el documento publicado (precio efectivo con oferta, paquete, `deposit`); ignora cualquier `status`, `paid`, `total` enviados. Reglas de fecha: `date` entre hoy+`lead` y hoy+`maxDays` (Lima), no en `blocked`, día de semana no en `closedDays`, trips solo en `tripDays`.

**Validación de cupo (anti sobreventa):**

```
BEGIN;
SELECT GET_LOCK(CONCAT('evo_slot_', cat, '_', date, '_', time), 5);   -- serializa por slot
SELECT COALESCE(SUM(persons),0) FROM bookings
  WHERE cat=? AND date=? AND time=? AND status <> 'cancelada';
-- si taken + persons > capacity → ROLLBACK, RELEASE_LOCK, 409 SLOT_FULL { left }
INSERT INTO bookings (...) VALUES (...);  INSERT INTO booking_events (...);
COMMIT; RELEASE_LOCK;
```

Estado asignado: `yape`/`plin` → `por verificar`; `card` → `pendiente` (sin pasarela no se marca pagada). `paid = 0`. `code = "EVO-" + 6 chars [A-Z0-9]` con reintento si colisiona.

### 4.3 Autenticación

| Método y ruta | Cuerpo / respuesta | Notas |
|---|---|---|
| `POST /api/auth/login` | `{ user, pass }` → `{ name, user, role }` + `Set-Cookie: evo_sid` | 10/15 min por IP. Tras 5 fallos la cuenta se bloquea 15 min (`locked_until`) → 423. Respuesta idéntica para usuario inexistente y contraseña errónea. |
| `POST /api/auth/logout` | 204 | Borra la fila de `sessions` y la cookie. |
| `GET /api/auth/me` | `{ name, user, role }` o 401 | Renueva `last_seen_at`/`expires_at` (sliding 12 h, tope 7 días). |
| `POST /api/auth/password` | `{ current, next }` → 204 | Propia contraseña; mínimo 10 chars; invalida las otras sesiones del usuario. |

Cookie `evo_sid`: `HttpOnly; Secure (prod); SameSite=Strict; Path=/`. Valor: token aleatorio (32 bytes base64url); en BD solo `sha256(token)`.

### 4.4 Contenido (admin)

Permisos por rol sobre el documento (el servidor **filtra** el PUT a estas rutas y descarta el resto):

| Rol | Puede escribir en el borrador | Publicar / descartar / restaurar |
|---|---|---|
| `admin` | todo | sí |
| `editor` | `services`, `gallery`, `albums`, `reviews`, `home`, `settings.booking` | sí |
| `fotografo` | `gallery`, `albums` | no |

| Método y ruta | Cuerpo / respuesta | Roles |
|---|---|---|
| `GET /api/admin/content` | `{ draft: { version, data, updatedAt }, published: { version, data, publishedAt }, history: [{ id, at, by, summary }] }` | todos |
| `PUT /api/admin/content/draft` | `{ baseVersion, data }` → `{ version, updatedAt }`. Si `baseVersion ≠ draft.version` → 409 `DRAFT_STALE` con el draft actual. `data` se valida con `shared/schemas.ts` (zod) y se normaliza con `migrate()`. | todos (filtrado por rol) |
| `POST /api/admin/content/publish` | `{ baseVersion }` → `{ publishedAt, version, summary }`. Transacción: published actual → `archived`; copia del draft → `published`; `summary` = `diff()` (misma función que hoy, movida a `shared/`); poda `archived` dejando los 20 más recientes; invalida caché; regenera sitemap. | admin, editor |
| `POST /api/admin/content/discard` | → draft := published (version++) | admin, editor |
| `POST /api/admin/content/restore/:id` | → draft := archived[id] **excepto** `gallery` (conserva la actual, igual que hoy) | admin, editor |
| `GET /api/admin/content/history/:id` | snapshot completo | admin, editor |
| `GET /api/admin/export` | JSON `{ draft, published, bookings, users(sin hash), exportedAt }` | admin |
| `POST /api/admin/import` | `{ data }` (formato `SiteData` del export o del localStorage) → se valida, se normaliza y se guarda como draft | admin |

### 4.5 Fotos (admin)

| Método y ruta | Cuerpo / respuesta | Roles |
|---|---|---|
| `POST /api/admin/photos` | multipart `file` (1 archivo) → 201 `Photo` `{ id, src, width, height, bytes, originalBytes, variants, alt: blank, focus: "50% 50%", featured: false, hidden: false, album: "" }` | todos |
| `POST /api/admin/photos/from-data-url` | `{ dataUrl, name? }` (≤ 8 MB decodificado) → igual que arriba. Solo para «importar desde este navegador». | admin |
| `DELETE /api/admin/photos/:id` | 204. Marca `deleted_at`; los archivos se borran en la limpieza diferida (6.5). | admin, editor |
| `GET /api/admin/storage` | `{ uploadsBytes, files, dbBytes, versions }` (sustituye el medidor de localStorage de Ajustes) | admin |

Límites: 15 MB por archivo; 60 subidas/hora por sesión; tipos `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/gif` (GIF se convierte a WebP estático; se rechaza con 415 cualquier otro, verificado por sharp, no por la extensión).

### 4.6 Reservas (admin)

| Método y ruta | Cuerpo / respuesta | Roles |
|---|---|---|
| `GET /api/admin/bookings?status=&from=&to=&q=&limit=200&cursor=` | `{ items: Booking[], next }` ordenado por `date, time` | admin, editor |
| `PATCH /api/admin/bookings/:code` | `{ status?, paid?, notes? }` → `Booking`. Si `status = pagada` y `paid = 0` → `paid := due` (regla actual). Registra `booking_events`. | admin, editor |
| `POST /api/admin/bookings` | reserva manual (mismo cuerpo que el público + `status`, `paid`), `source = 'admin'`, valida cupo | admin, editor |
| `POST /api/admin/bookings/import` | `Booking[]` del localStorage → upsert por `code`, `source = 'import'`, **sin** validar cupo (datos históricos) | admin |
| `GET /api/admin/bookings.csv?…` | CSV con las columnas actuales del export | admin, editor |

### 4.7 Usuarios (solo admin)

| Método y ruta | Cuerpo / respuesta |
|---|---|
| `GET /api/admin/users` | `[{ id, username, name, role, active, lastLoginAt }]` (nunca hashes) |
| `POST /api/admin/users` | `{ username, name, role, password }` → 201 |
| `PATCH /api/admin/users/:id` | `{ name?, role?, active?, password? }`. No se puede quitar/desactivar al último admin ni rebajar el propio rol. Cambiar contraseña o desactivar invalida sus sesiones. |
| `DELETE /api/admin/users/:id` | 204; mismas protecciones; las reservas/versiones conservan `NULL` por `ON DELETE SET NULL`. |

## 5. Cambios en el frontend

Principio: el admin sigue trabajando con un `SiteData` en memoria y la función `update(fn)`; solo cambia dónde se persiste.

### 5.1 Reorganización `src/store` → `shared/` + adaptador

- Mover a `shared/` (sin `window`, `localStorage`, `import.meta.glob`): `types.ts`, `seed.ts`, `migrate()`, `bookingDefaults`, `slugs`, `pathFor`, `tr`, `offerOn`, `effectivePrice`, `isoDate`, `fmt`, `money`, `diff()` (de `Admin.tsx`), `seo-defaults.ts`, el cálculo de título/descripción de `SEO.tsx` (`seoFor(data, lang, page, service)`), `ui.ts`/`booking-ui.ts`/`public-ui.ts`.
- `src/store/index.ts` re-exporta todo lo de `shared/` y conserva lo que necesita DOM: `asset()`, `download()`, `useSiteData()`, `waUrl()`.
- Nuevo `src/store/api.ts`: `api.get/post/put/patch/del(path, body)` con `credentials: "same-origin"`, cabecera `X-Requested-With: evolushon`, parseo de `{error}` a `ApiError { status, code, message, details }`, y `onUnauthorized` (callback que el admin usa para volver al login).
- Nuevo `src/store/remote.ts`: store público con la misma firma que hoy (`load`, `subscribe`, `useSiteData`). Fuente inicial: `window.__EVO_DATA__` inyectado por el servidor (sección 8.3); si falta, `GET /api/public/site`. Revalida en `visibilitychange` si han pasado > 60 s.
- `asset()` acepta además rutas que empiezan por `/` (uploads) y devuelve tal cual.
- `KEYS`, `readStored`, `writeStored`, `bookings()`, `history()` se mantienen **solo** en `src/store/legacy.ts` para la importación (5.5) y se eliminan de los componentes.

### 5.2 Admin (`src/admin/Admin.tsx`)

- Login: `POST /api/auth/login`; al montar, `GET /api/auth/me`. Se elimina `sessionStorage.evo-auth3` y el texto «Demo · admin / evolushon …».
- Carga inicial: `GET /api/admin/content` → `data = draft.data`, `live = published.data`, `entries = history`, `draftVersion`. Pantalla de esqueleto hasta que resuelva; error → pantalla con botón «Reintentar».
- `persist(next)`: en vez de `writeStored(KEYS.draft)`, encola `PUT /api/admin/content/draft { baseVersion, data }` con *debounce* 800 ms y coalescencia (solo el último estado viaja). Estados visibles en la toolbar: `Guardando…` / `Borrador guardado` / `Sin guardar — reintentar` (si falla). 409 `DRAFT_STALE` → modal «Otro usuario modificó el borrador» con opciones *Cargar el suyo* (descarta local) o *Sobrescribir* (re-PUT con la version recibida). Deshacer/rehacer siguen en memoria (sin cambios).
- `publish()`: espera a que no haya PUT pendiente, `POST /api/admin/content/publish { baseVersion }`, luego `live = data`, refresca `history`. Botón deshabilitado mientras hay guardado pendiente o fallido.
- Descartar / Restaurar → endpoints correspondientes y recarga del draft.
- Contador de «por verificar» en el menú → `useBookings()` (polling cada 60 s mientras el panel está visible).
- Copia local de seguridad: el borrador se sigue guardando en `localStorage` bajo `evolushon-draft-v2` **solo** como respaldo offline; al cargar, si existe y su `savedAt` es posterior al `updatedAt` del servidor, se ofrece «Recuperar borrador local». No se usa para nada más.

### 5.3 Editores

- `GalleryEditor`: `processFile` sigue reduciendo en el cliente a máx. 2000 px (ahorra subida) y luego `POST /api/admin/photos`; el `Photo` devuelto entra al draft con `update()`. Progreso por archivo y errores por archivo (413/415/429). «Optimizar» (recompresión en canvas) se elimina: el servidor ya genera variantes. Borrar foto → `update()` + `DELETE /api/admin/photos/:id`. El medidor «pesadas > 350 KB» usa `photo.bytes` (variante 1600).
- `ServicesEditor`: la portada se elige de la galería o se sube con el mismo endpoint.
- `BookingsEditor`: lista desde `GET /api/admin/bookings`; cambios de estado con `PATCH`; export CSV desde el servidor. La configuración (`settings.booking`) sigue en el draft (requiere publicar, igual que hoy; se indica en la UI).
- `SettingsEditor`: sección Usuarios pasa a la API (`username`, `name`, `role`, `active`, campo «Nueva contraseña» de solo escritura); se elimina `users` del documento. El medidor de almacenamiento usa `GET /api/admin/storage`. «Exportar JSON» → `GET /api/admin/export`. «Restaurar originales» → `POST /api/admin/import` con `migrate(SEED)` del bundle.
- `ContentEditors`/`LanguagesEditor`/`ReviewsEditor`/`HomeEditor`: sin cambios funcionales.

### 5.4 Sitio público y reservas (`Booking.tsx`)

- Disponibilidad: `useAvailability(service, from, to)` → `GET /api/public/availability`; `left(date, time) = capacity − taken[date][time]`. Se refresca al cambiar de mes y al entrar al paso 2. Estado de carga en el calendario; error → mensaje y reintento.
- Envío: `POST /api/public/bookings`. 409 `SLOT_FULL` → vuelve al paso 2 con `t.full` (flujo ya existente). 429 → mensaje «Demasiados intentos». Pantalla final usa `code`/`status` del servidor.
- **Tarjeta:** sin pasarela, se oculta la opción (seed `methods.card = false`; el admin puede activarla, en cuyo caso la reserva queda `pendiente` y se coordina por WhatsApp). Se eliminan los campos de número/vencimiento/CVC y los textos `demo`.
- Textos nuevos en `booking-ui.ts` (4 idiomas): «Cargando disponibilidad», «No se pudo cargar, reintentar», «Demasiados intentos, espera unos minutos», estado `pendiente`.
- `SEO.tsx`: sigue renderizando las etiquetas (React 19 las eleva al `<head>`), pero en el primer montaje elimina los nodos `[data-evo-seo]` inyectados por el servidor para no duplicarlos. Usa `seoFor()` de `shared/` (misma función que el servidor → mismo resultado).

### 5.5 Migración de datos locales existentes (opcional, botón en Ajustes)

«Importar desde este navegador» (solo admin):

1. Lee `evolushon-draft-v1` (o `evolushon-data-v1`), `evolushon-bookings-v1`.
2. Para cada `Photo.src` o `Service.cover` que sea `data:` → `POST /api/admin/photos/from-data-url` y sustituye por la URL devuelta (progreso N/M).
3. `POST /api/admin/import { data }` → borrador. Muestra «Importado al borrador: revisa y publica».
4. `POST /api/admin/bookings/import` con las reservas.
5. Al terminar, ofrece borrar las claves `evolushon-*-v1`.

## 6. Subidas de imágenes

### 6.1 Flujo

```
cliente: valida tipo → reduce a ≤ 2000 px (canvas, como hoy) → multipart POST
servidor: multer memoria (≤ 15 MB) → sharp(buffer).metadata() (verifica formato real)
        → rotate() (aplica orientación EXIF) → sin withMetadata() (elimina EXIF/GPS/ICC salvo sRGB)
        → por cada ancho ∈ {480, 960, 1600} con w ≤ ancho original: .resize({width, withoutEnlargement}).webp({quality: 82})
        → si IMAGE_AVIF=1: también .avif({quality: 55, effort: 4}) (CPU alta; por defecto 0 en Hostinger)
        → escribe UPLOADS_DIR/yyyy/mm/<id>-<w>.<ext> (escritura a .tmp + rename atómico)
        → INSERT photos → responde Photo
```

- `id = "p-" + 12 hex` aleatorio; los nombres incluyen el id, así que las URLs son inmutables y cacheables un año.
- `src` = variante de mayor ancho; `variants` ordenadas asc. El sitio público usa `srcset`/`sizes` con las variantes cuando existen (`PublicSite` y `ServicesEditor` ya reciben el objeto `Photo`).
- Deduplicación: si `sha256` del original ya existe y no está borrado, se devuelve el `Photo` existente sin reprocesar.
- Preset `settings.img` (`max`/`balanced`/`light`) se conserva como calidad WebP (90/82/72); `format` deja de usarse (siempre WebP, JPEG de respaldo no es necesario en 2026).

### 6.2 Rutas y servicio

- Disco: `UPLOADS_DIR` (p. ej. `/home/<user>/evolushon-uploads`), fuera del directorio de despliegue. El servidor crea la carpeta al arrancar; si no puede escribir, `healthz` lo reporta (`uploads: false`) y las subidas devuelven 500 `UPLOADS_UNAVAILABLE`.
- HTTP: `GET /uploads/*` → `express.static(UPLOADS_DIR, { immutable: true, maxAge: "365d", index: false, dotfiles: "deny", fallthrough: false })`. Solo extensiones `.webp`/`.avif`.

### 6.3 Límites

15 MB por archivo, 60/hora por sesión, 1 proceso sharp a la vez (`sharp.concurrency(1)`) para no agotar la CPU compartida; las subidas se encolan en el cliente de 2 en 2.

### 6.4 Respaldo

Ver sección 10. Los originales **no** se conservan (ahorro de disco); se guardan los 3 tamaños WebP. Si el cliente quiere originales, activar `KEEP_ORIGINALS=1` (los escribe en `UPLOADS_DIR/originals/`), decisión pendiente (11.3).

### 6.5 Limpieza diferida

Tarea `npm run cleanup`, ejecutada también en el arranque si pasaron > 24 h desde la última (marca de tiempo en el archivo `UPLOADS_DIR/.last-cleanup`): borra archivos de `photos` con `deleted_at` > 30 días **y** cuyo `id` no aparece en `draft` ni `published` (búsqueda `JSON_SEARCH` o en memoria). Borra `sessions` expiradas.

## 7. Seguridad

- **Auth:** sesión opaca en BD (7.1 arriba). Logout y cambio de contraseña invalidan. Comparación de hash siempre, incluso si el usuario no existe (tiempo constante).
- **CSRF:** cookie `SameSite=Strict` + cabecera `X-Requested-With: evolushon` obligatoria en toda mutación con sesión + verificación de `Origin`/`Referer` contra `PUBLIC_URL`. Sin tokens por formulario.
- **Rate limit** (`express-rate-limit`, memoria, `trust proxy` = 1): login 10/15 min/IP; reservas públicas 5/10 min/IP y 40/h global; availability 120/min/IP; subidas 60/h/sesión; API general 300/min/IP. `/healthz` y estáticos exentos. Al reiniciar el proceso los contadores se pierden (aceptable; el bloqueo de cuenta sí persiste en `users`).
- **Validación:** zod en todos los cuerpos; `migrate()` normaliza el documento antes de guardar; límites de longitud en todos los strings; `express.json({ limit: "2mb" })` (el documento ≈ 120 KB), `from-data-url` con límite 12 MB.
- **Cabeceras (helmet):** `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` mínima, HSTS (solo prod). CSP primero en `Content-Security-Policy-Report-Only` durante una semana y luego enforce: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`.
- **Subidas:** tipo verificado por sharp, nombres generados por el servidor, sin ejecución (`Content-Type` fijo, `X-Content-Type-Options`), carpeta fuera del árbol web.
- **SQL:** solo prepared statements (`pool.execute`). Nada de concatenación.
- **Admin oculto a buscadores:** `robots.txt Disallow: /admin`, `<meta name="robots" content="noindex">` inyectado por el servidor en `/admin*`.
- **Logs:** nunca contraseñas, tokens ni cuerpos de login; IP y `user_id` sí. Errores 500 con `requestId`.
- **Secretos solo por entorno.** Variables:

| Variable | Obligatoria | Ejemplo / notas |
|---|---|---|
| `NODE_ENV` | sí | `production` |
| `PORT` | la fija Hostinger | `3000` en local |
| `PUBLIC_URL` | sí | `https://evolushonsurfexperience.com` (Origin, canonical, sitemap) |
| `TZ` | sí | `America/Lima` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | sí | host interno de Hostinger (suele ser `localhost`) |
| `DB_POOL_SIZE` | no | `5` (Hostinger limita conexiones por usuario) |
| `SESSION_SECRET` | sí | ≥ 32 bytes aleatorios; firma de la cookie (defensa extra sobre el token opaco) |
| `UPLOADS_DIR` | sí | `/home/<user>/evolushon-uploads` |
| `ADMIN_INITIAL_PASSWORD` | solo 1.er arranque | borrar del panel tras el primer login |
| `MIGRATE_ON_START` | no | `1` (defecto) |
| `IMAGE_AVIF` | no | `0` (defecto) |
| `KEEP_ORIGINALS` | no | `0` |
| `MAX_UPLOAD_MB` | no | `15` |
| `TRUST_PROXY` | no | `1` (Hostinger pone un proxy delante) |
| `LOG_LEVEL` | no | `info` |
| `CSP_ENFORCE` | no | `0` → report-only; `1` → enforce |

`.env.example` versionado con valores de desarrollo y sin secretos reales; `.env` en `.gitignore` (añadir `.env`, `.env.*`, `!.env.example`, `server-dist`, `uploads-dev/`).

## 8. Servidor de estáticos y SEO

### 8.1 Orden de middlewares

1. `pino-http`, `helmet`, `compression`, `trust proxy`.
2. **Redirecciones heredadas** (antes de todo lo demás), con y sin barra final, `NE` (sin reescapar):

| Desde | Hacia | Código |
|---|---|---|
| `/` | `/es/` | 302 |
| `/clases/surf` | `/es/servicios?category=surf` | 301 |
| `/clases/surfskate` | `/es/servicios?category=surfskate` | 301 |
| `/surftrips` | `/es/servicios?category=trip` | 301 |
| `/en/surftrips` | `/en/services?category=trip` | 301 |
| `/galeria` | `/es/galeria` | 301 |
| `/contacto` | `/es/contacto` | 301 |
| `http://` o `www.` | `https://` sin `www` | 301 (si Hostinger no lo hace ya; configurable con `FORCE_HTTPS`) |

   La tabla vive en `server/routes/static.ts` (`LEGACY_REDIRECTS`) y la lista actual de `public/.htaccess` se elimina del repo junto con `public/sitemap.xml` (ambos pasan al servidor). `public/robots.txt` puede quedarse estático o servirse dinámico; se elige dinámico para que use `PUBLIC_URL`.
3. `/api/*`, `/healthz`, `/sitemap.xml`, `/robots.txt`.
4. `/uploads/*` (6.2).
5. `express.static("dist", { index: false, maxAge: "1h", setHeaders })`: `/assets/*` (hash de Vite) → `public, max-age=31536000, immutable`; `favicon.ico`, `logo.png`, `og-image.jpg`, `apple-touch-icon.png` → `max-age=86400`.
6. **Rutas de la SPA** (`GET` y `HEAD`, resto 405): se resuelven con el documento publicado:
   - `/admin` y `/admin/*` → 200, head mínimo + `noindex`.
   - `/:lang/` → 200 si `lang ∈ LANGS`.
   - `/:lang/:section` → 200 si `section` = slug localizado de `services|gallery|contact`.
   - `/:lang/:section/:slug` → 200 si `section` es servicios y `slug` ∈ `{s.seo.slug || s.id}` de servicios **activos** publicados.
   - Cualquier otra → **404** con el mismo `index.html` (React muestra su página 404) y `<meta name="robots" content="noindex">`.
   - Sin barra final ≠ con barra: se aceptan ambas; canonical siempre sin barra salvo la raíz de idioma (`/es/`), como hoy en `pathFor`.

### 8.2 Decisión: inyección del head por ruta (no SSR)

SSR completo exigiría `react-dom/server`, duplicar el router en Node, resolver `import.meta.glob` de assets y gestionar hidratación de 7 500 líneas de componentes; el beneficio marginal es el cuerpo indexable, que Googlebot ya renderiza. La inyección da título, descripción, canonical, hreflang, OG, JSON-LD y los datos publicados en el primer byte, que es lo que piden los pendientes del diseño. Se puede migrar a SSR después sin cambiar la API.

### 8.3 Inyección

- `index.html` (fuente Vite) incluye los marcadores `<!--evo:head-->` dentro de `<head>` y `<!--evo:data-->` antes del script del bundle; `<html lang="es">` se reescribe con el idioma de la ruta.
- Al arrancar, el servidor lee `dist/index.html` una vez (y lo recarga si cambia su `mtime`, útil tras redeploy sin reinicio).
- `services/head.ts` → `renderHead({ data, lang, page, service })` con `seoFor()` de `shared/`: `<title>`, `meta description/robots/og:*/twitter:*`, `link canonical`, 5 `link alternate hreflang`, `<script type="application/ld+json">` (idéntico al actual `SEO.tsx`, `<` escapado como `<`). Todos con `data-evo-seo`.
- `<!--evo:data-->` → `<script id="evo-data" type="application/json">{…publicado…}</script>`; `remote.ts` lo lee con `JSON.parse(textContent)`. Escape de `<`, ` `, ` `.
- Caché: HTML `Cache-Control: no-cache` + `ETag` derivado de `(publishedAt, ruta, mtime de index.html)`; el servidor cachea el HTML renderizado por ruta en un `Map` (máx. 200 entradas) invalidado al publicar.
- Para `/admin*` no se inyectan datos (el panel los pide con sesión).

### 8.4 Sitemap y robots dinámicos

- `GET /sitemap.xml`: genera desde el publicado las URLs de `home`, `services`, `gallery`, `contact` × 4 idiomas y cada servicio activo × 4 idiomas, con `xhtml:link hreflang` (incl. `x-default` → es) y `<lastmod>` = `publishedAt`. Mismo formato que el `public/sitemap.xml` actual (56 URLs hoy). Cacheado en memoria hasta la siguiente publicación.
- `GET /robots.txt`: `User-agent: *` / `Allow: /` / `Disallow: /admin` / `Disallow: /api` / `Sitemap: {PUBLIC_URL}/sitemap.xml`.

## 9. Despliegue en Hostinger y desarrollo local

### 9.1 Panel de Hostinger (hPanel), paso a paso

1. **Base de datos:** Bases de datos → MySQL → crear base `u<id>_evolushon` y usuario `u<id>_evo` con contraseña generada; anotar el host que indique el panel (normalmente `localhost`). Si se quiere acceso desde el Mac para respaldos: Bases de datos → MySQL remoto → añadir la IP pública actual (ver 11.1).
2. **Sitio Node.js:** Sitios web → Añadir → Node.js → conectar GitHub (`p4ranoic0/new-evolushon-web`, rama `main`, directorio raíz `/`). Despliegue automático en cada push.
3. **Configuración de la app:** versión de Node **22**; comando de build `npm ci && npm run build`; entry file `server.js` (equivale a `npm start`). Si el panel ofrece «comando de inicio», `npm start`.
4. **Variables de entorno** (sección 7): todas las obligatorias + `ADMIN_INITIAL_PASSWORD`. Fijar `NPM_CONFIG_PRODUCTION=false` si el build falla por falta de `devDependencies` (Vite y TypeScript son dev; alternativa: moverlas a `dependencies`, ver 11.4).
5. **Carpeta de uploads:** Administrador de archivos → crear `/home/<user>/evolushon-uploads` (fuera de `domains/`). Poner la ruta absoluta en `UPLOADS_DIR`. Si el administrador de archivos no muestra `/home/<user>`, el servidor la crea al arrancar; verificar con `/healthz` (`uploads: true`).
6. **Dominio:** apuntar `evolushonsurfexperience.com` al nuevo sitio (sustituye al WordPress, ya respaldado), activar SSL y «forzar HTTPS».
7. **Primer arranque:** revisar logs del panel: `migrations applied`, `seed done`, `listening`. Entrar a `/admin` con `admin` + `ADMIN_INITIAL_PASSWORD`, cambiar la contraseña, borrar la variable del panel y redeployar (o reiniciar).
8. **Verificación** (sección 11.5, lista de `curl`).
9. **Monitor externo** (UptimeRobot u otro, gratis) a `/healthz` cada 5 min: avisa de caídas y además mantiene el proceso caliente frente al apagado por inactividad (confirmar que Hostinger lo permite, 11.1).

### 9.2 Desarrollo local

- `docker compose up -d` con `mysql:8.4` (puerto `3307`, volumen local `./.mysql-data` ignorado por git) **o** MySQL instalado en el Mac; solo una de las dos, sin duplicar.
- `cp .env.example .env` → `DB_*` locales, `UPLOADS_DIR=./uploads-dev` (ignorado), `PUBLIC_URL=http://localhost:5173`, `ADMIN_INITIAL_PASSWORD=admin1234`.
- Terminal 1: `npm run dev:server` (API en :3000, migra y siembra). Terminal 2: `npm run dev` (Vite :5173 con `server.proxy` para `/api`, `/uploads`, `/healthz`, `/sitemap.xml`, `/robots.txt`). En dev la inyección del head no actúa (Vite sirve `index.html`); `remote.ts` hace fetch.
- `npm run build && npm start` reproduce producción en `http://localhost:3000` (Node 26 local funciona; `.nvmrc` 22 para paridad).
- `npm test`: unitarios de `shared/` (migrate, seoFor, diff, slugs), de `services/bookings` (cupo, fechas Lima), de `services/head` (inyección) y una suite `supertest` contra la BD local (`TEST_DB_NAME=evolushon_test`, se recrea en cada corrida).

## 10. Respaldos y monitoreo

- **Respaldo automático de Hostinger:** activar los semanales del plan (incluye MySQL y archivos del usuario; confirmar que cubre `/home/<user>/evolushon-uploads`, 11.1).
- **Respaldo propio** (`scripts/backup.sh`, se ejecuta desde el Mac, manual o `launchd` semanal): `mysqldump --single-transaction` por MySQL remoto + `rsync`/`sftp` de `UPLOADS_DIR` → carpeta de datos del cliente en OneDrive (`~/Library/CloudStorage/OneDrive-Personal/TRABAJOS/evolushon/backups/AAAA-MM-DD/`), conservando 8 copias. Requiere SSH/SFTP del plan y MySQL remoto habilitado.
- **Sin shell:** `GET /api/admin/export` (JSON completo) desde Ajustes → «Exportar», equivalente al botón actual; las imágenes se bajan con el respaldo de archivos del panel.
- **Restauración:** `mysql < dump.sql` + copiar `uploads` + reiniciar. Documentado en `docs/RUNBOOK.md` (tarea T16).
- **Monitoreo:** `/healthz` (BD `SELECT 1` con timeout 2 s, escritura en `UPLOADS_DIR`, `publishedAt`, `version` del `package.json`, `uptimeSec`). Logs pino a stdout (panel de Hostinger): una línea por petición (`method path status ms userId?`), arranques, migraciones, errores con `requestId`. Nivel `warn` para 4xx de login/cupo, `error` para 5xx.

## 11. Plan de tareas, riesgos y preguntas abiertas

### 11.1 Preguntas abiertas (confirmar antes de T9)

1. **Persistencia de disco:** ¿`/home/<user>/evolushon-uploads` sobrevive a redeploys y reinicios de la app Node? ¿Y a cambios de plan? Preguntar a soporte de Hostinger y hacer la prueba empírica en T9 (subir foto → redeploy → sigue). Si no persiste → plan B (11.2).
2. **MySQL:** host interno exacto para la app, límite de conexiones simultáneas por usuario, versión (8.0 vs MariaDB), y si «MySQL remoto» admite la IP dinámica del Mac (o `%`) para respaldos.
3. **Build:** ¿instala `devDependencies`? ¿Respeta `.nvmrc`/`engines`? ¿Hay campo de comando de inicio o solo entry file? ¿`PORT` se inyecta por entorno?
4. **Inactividad:** ¿cuánto tarda en dormir y en despertar? ¿Permiten un ping externo cada 5 min para mantenerlo activo?
5. **SSH/SFTP:** ¿disponible en el plan Node? Determina si el respaldo propio (sección 10) es viable o solo el del panel.
6. **Proxy:** cabeceras `X-Forwarded-For/Proto` presentes (necesarias para rate limit por IP y `Secure` cookies). ¿Hostinger fuerza HTTPS/no-www por su cuenta?
7. **Tarjeta:** confirmar con el cliente que se oculta la opción hasta integrar pasarela (decisión 5.4).

### 11.2 Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Disco no persistente en Hostinger | Plan B: adaptador `storage` con dos implementaciones (`local`, `s3`); Cloudflare R2 (10 GB gratis) con URL pública. Solo `services/images.ts` y `routes/static.ts` cambian. No se implementa salvo que 11.1-1 falle. |
| Arranque en frío (cold start) lento | Importar `sharp` perezosamente, `MIGRATE_ON_START` con una sola consulta cuando no hay pendientes, caché de HTML/publicado al primer uso, ping externo. Medir en T9 (`healthz` tras 1 h de inactividad). |
| Binarios nativos (`sharp`) no instalan | `sharp` trae binarios para linux-x64 glibc; si falla, fijar `--include=optional` o `SHARP_IGNORE_GLOBAL_LIBVIPS=1`. Sin otros módulos nativos por diseño (`bcryptjs`). |
| `devDependencies` no instaladas en el build | `NPM_CONFIG_PRODUCTION=false` o mover `vite`, `typescript`, `@vitejs/plugin-react`, `@tailwindcss/postcss`, `postcss`, `autoprefixer` a `dependencies`. |
| Dos editores pisándose el borrador | `version` + 409 `DRAFT_STALE` + modal (5.2). |
| Pérdida de rate limit en memoria tras dormir | Bloqueo de cuenta persistido en `users`; reservas protegidas además por honeypot y validación de cupo. |
| Documento JSON crece (muchas fotos) | 500 fotos ≈ 250 KB; aceptable. Si supera 1 MB, dividir `gallery` en tabla propia (migración futura, no afecta la API pública). |
| CSP rompe fuentes o estilos inline | Report-only una semana, luego `CSP_ENFORCE=1`. |
| Duplicado de `<title>`/metas (servidor + React 19) | `SEO.tsx` elimina `[data-evo-seo]` al montar; test e2e verifica un único `<title>`. |
| URL antigua no contemplada | Logs de 404 revisados tras el lanzamiento; la tabla `LEGACY_REDIRECTS` es editable sin tocar la SPA. |

### 11.3 Decisiones pendientes menores
- `KEEP_ORIGINALS` (conservar originales JPEG): por defecto no; consultar al cliente.
- Número de versiones archivadas: 20 (la UI del historial muestra todas).
- Redirección `/` → `/es/` fija (302) o por `Accept-Language`: se mantiene fija como en `.htaccess`.

### 11.4 Plan de tareas (orden de implementación; cada una es un commit/PR verificable)

| # | Tarea | Criterio de aceptación |
|---|---|---|
| T1 | Extraer `shared/` (types, seed, migrate, rutas, seoFor, diff, textos) sin dependencias de DOM; `src/store` re-exporta. | `npm run build` y `npm run lint` pasan; `node -e "import('./server-dist/shared/migrate.js')"` carga sin `window`; el sitio se ve igual en `npm run preview`. |
| T2 | Esqueleto del servidor: `server/`, `env.ts` (zod), `app.ts`, `index.ts`, `server.js`, scripts `build/start/dev:server`, pino, helmet, compression, `/healthz`. | `npm run build && npm start` sirve `dist/` en :3000; `curl -i /healthz` → 200 JSON; con `DB_HOST` inválido → 503 y log de error. |
| T3 | Pool MySQL, runner de migraciones, `0001_init.sql`, `docker-compose.yml`, `.env.example`. | `npm run migrate` crea las 7 tablas; segunda ejecución no hace nada; `SHOW CREATE TABLE bookings` incluye `ix_bookings_slot`. |
| T4 | Seed inicial + usuario admin desde `ADMIN_INITIAL_PASSWORD`. | Tras arrancar con BD vacía: `site_versions` tiene 1 `draft` y 1 `published` idénticos a `migrate(SEED)` sin `users`; `users` tiene 1 admin con hash bcrypt; reiniciar no duplica. |
| T5 | Estáticos, redirecciones heredadas, rutas SPA con 404 real, inyección de head y `evo-data`, sitemap/robots dinámicos. | `curl -I /clases/surf` → 301 `Location: /es/servicios?category=surf`; `/` → 302 `/es/`; `/es/servicios/s-grupal` → 200 con `<title>` del servicio, `rel=canonical`, 5 `hreflang`, JSON-LD y `<script id="evo-data">`; `/es/servicios/no-existe` y `/xx/` → 404 con `noindex`; `/sitemap.xml` lista 56 URLs válidas (`xmllint --noout`); `/assets/*.js` con `immutable`. |
| T6 | Auth: login/logout/me/password, sesiones en BD, guard por rol, rate limit y bloqueo de cuenta, CSRF (header + Origin). | `supertest`: login correcto devuelve cookie `HttpOnly; Secure; SameSite=Strict`; 5 fallos → 423; mutación sin `X-Requested-With` → 403; `fotografo` en `/api/admin/users` → 403; logout invalida la cookie. |
| T7 | API de contenido: `GET content`, `PUT draft` (version, filtro por rol, validación zod + migrate), `publish`, `discard`, `restore`, `history`, `export`, `import`; invalidación de caché pública y de HTML. | Publicar cambia `GET /api/public/site` (nuevo ETag) y el `<title>` servido; `PUT` con `baseVersion` viejo → 409; `fotografo` que envía `services` modificados no los altera; tras 21 publicaciones hay 20 `archived`; `restore` conserva `gallery`. |
| T8 | API de fotos: subida multipart, sharp (rotate, sin EXIF, 480/960/1600 WebP), dedupe por sha256, `from-data-url`, `DELETE`, `storage`, servicio `/uploads/*`, cleanup. | Subir un JPEG 4000×3000 con GPS → 3 archivos WebP en `UPLOADS_DIR/aaaa/mm/`, `exiftool` no muestra GPS, `width/height` correctos; `GET /uploads/...-1600.webp` → 200 `immutable`; segundo upload igual → mismo `id`; archivo de 20 MB → 413; PDF renombrado `.jpg` → 415. |
| T9 | **Despliegue inicial en Hostinger** (9.1) con T1–T8, dominio aún en WordPress (usar el subdominio temporal de Hostinger). Pruebas de persistencia y cold start. | `/healthz` 200 desde el subdominio; subir una foto, hacer un push trivial (redeploy) y la foto sigue; medir tiempo del primer `GET` tras 1 h de inactividad y anotarlo en `docs/RUNBOOK.md`; respuestas a 11.1 registradas. |
| T10 | API de reservas pública y admin: availability, `POST` con cupo (`GET_LOCK`), estados, eventos, CSV, import. | Test concurrente: 10 `POST` simultáneos de 1 persona con capacidad 6 → exactamente 6 × 201 y 4 × 409 `SLOT_FULL`; `date` fuera de `lead/maxDays`, en `blocked` o `closedDays` → 400; `method: card` con `methods.card=false` → 400; `PATCH status=pagada` fija `paid=due`; 6.ª reserva en 10 min desde la misma IP → 429. |
| T11 | Frontend: `api.ts`, `remote.ts` (`__EVO_DATA__` + fetch), `asset()` con `/uploads`, `SEO.tsx` limpia `[data-evo-seo]`. | Sitio público sin `localStorage` (DevTools → Application vacío salvo preferencias); en producción no hay fetch de `/api/public/site` en la carga inicial; un solo `<title>` en el DOM tras hidratar. |
| T12 | Frontend admin: login real, carga de `content`, `persist` → `PUT` con debounce y estados, publicar/descartar/restaurar, historial, 409 `DRAFT_STALE`, respaldo local `evolushon-draft-v2`. | Editar un servicio en dos pestañas: la segunda recibe el modal de conflicto; «Publicar» deshabilitado mientras dice `Guardando…`; recargar conserva el borrador del servidor; cerrar sesión → `GET /api/auth/me` 401 y vuelve al login. |
| T13 | Editores: galería (subida al servidor, progreso, borrar, sin «Optimizar»), portadas, reservas (API, CSV), Ajustes (usuarios por API, storage, export/import/restaurar originales), importar desde este navegador. | Subir 5 fotos muestra progreso y entran al borrador con `src=/uploads/...`; crear usuario `editor`, iniciar sesión con él y no ver Ajustes; «Importar desde este navegador» con un `evolushon-draft-v1` que contenga 2 fotos `data:` termina con 2 filas en `photos` y el borrador actualizado. |
| T14 | `Booking.tsx`: availability remota, `POST`, manejo 409/429, quitar tarjeta y textos demo, nuevos textos en 4 idiomas. | Reservar desde dos navegadores el último cupo: uno recibe «Lleno» y vuelve al paso 2; la reserva aparece en el panel como `por verificar`; no existe campo de tarjeta cuando `methods.card=false`; `grep -r demo src/` sin usos. |
| T15 | Limpieza: eliminar `public/.htaccess`, `public/sitemap.xml`, `src/store/legacy` tras la importación, `DEPLOYMENT.md` y `README.md` actualizados, `.gitignore` (`.env`, `server-dist`, `uploads-dev`, `.mysql-data`), CSP report-only. | `npm run lint`, `npm test`, `npm run build` en verde; `grep -rn "localStorage" src/` solo en `remote.ts` (preferencias) y respaldo del borrador; DevTools sin violaciones CSP en recorrido completo. |
| T16 | Lanzamiento: apuntar dominio, SSL, verificación 11.5, monitor externo, `scripts/backup.sh`, `docs/RUNBOOK.md` (restauración, rotación de secretos, cold start medido), borrar `ADMIN_INITIAL_PASSWORD`. | Toda la lista 11.5 en verde contra `https://evolushonsurfexperience.com`; primer respaldo en OneDrive con dump + uploads; Search Console acepta el sitemap. |

Dependencias: T1 → T2 → T3 → T4 → T5; T6 → T7 → T8 → T9; T10 independiente tras T6; T11–T14 tras sus endpoints; T15–T16 al final. T9 es la puerta de decisión del plan B.

### 11.5 Lista de verificación de producción

```
curl -I https://evolushonsurfexperience.com/                      # 302 → /es/
curl -I https://evolushonsurfexperience.com/clases/surf           # 301 → /es/servicios?category=surf
curl -I https://evolushonsurfexperience.com/en/surftrips/         # 301 → /en/services?category=trip
curl -s  https://evolushonsurfexperience.com/en/services/s-grupal | grep -c '<title>'   # 1, título del servicio en EN
curl -I https://evolushonsurfexperience.com/es/servicios/nada     # 404
curl -I https://evolushonsurfexperience.com/admin                 # 200, X-Robots/noindex
curl -s  https://evolushonsurfexperience.com/sitemap.xml | xmllint --noout -   # válido
curl -s  https://evolushonsurfexperience.com/healthz              # {"ok":true,"db":true,"uploads":true,...}
curl -I https://evolushonsurfexperience.com/assets/<hash>.js      # immutable
curl -X POST .../api/admin/content/publish                        # 401 sin cookie
```

Después: reserva real de prueba desde el móvil → aparece en el panel; subir foto desde el panel → visible en el sitio tras publicar; login con contraseña incorrecta ×5 → bloqueado 15 min.

## 12. Ajustes tras la crítica (prevalecen sobre lo anterior)

1. **Prueba de Hostinger primero (nueva T0).** Antes de T1–T8: un `server.js` mínimo desplegado desde GitHub que exponga `/healthz` y `/healthz/deep` (conecta a MySQL, crea y lee una fila, convierte una imagen con `sharp` a WebP, escribe y lee un archivo en `UPLOADS_DIR`). El usuario hace redeploy y reinicio, y se comprueba que el archivo y la fila siguen ahí. También se mide el primer acceso tras inactividad sin monitor. Si `UPLOADS_DIR` no persiste, se detiene el plan y se decide el plan B.
2. **Migraciones.** El runner crea `migrations` fuera de `0001`. Cada migración es un archivo con sentencias idempotentes (`CREATE TABLE IF NOT EXISTS`, comprobación de columna antes de `ALTER`) y se registra después de aplicarse. `GET_LOCK` con timeout de 10 s: si devuelve 0 o NULL, el arranque espera y reintenta, sin fallar en bucle. Si una migración falla, el servidor arranca igual en modo mantenimiento (503 en `/api/*` y `/healthz/deep` con el error) en lugar de caerse. Se prueba la interrupción a mitad de una migración.
3. **Head SEO.** Escape por contexto: texto y atributos con escape HTML de `& < > " '`, y JSON-LD con `<`. Mecanismo único: el servidor marca sus etiquetas con `data-ssr` y un solo hook (`useHead`) usado por `Seo`, el admin y el 404 las reemplaza. Hay pruebas con comillas, `</title>` y `</script>`, y de navegación público→admin→404 comprobando que no quedan títulos, canonical, robots, hreflang ni JSON-LD duplicados.
4. **Cupos.** Toda transición que consuma cupo (alta, reactivar desde `cancelada`, cambio de fecha, horario o personas) pasa por un único `reserveSlot()`: misma conexión, `GET_LOCK` debe devolver 1 (si no, 503 reintentable) y `RELEASE_LOCK` en `finally`. Los horarios se normalizan a `HH:mm`. La importación solo omite la validación para reservas con fecha pasada.
5. **Idempotencia y retención.** `POST /api/public/bookings` exige `Idempotency-Key` (UUID del cliente), con un índice único sobre `(idempotency_key)`; un reintento devuelve la reserva original. Las reservas `pendiente` o `por verificar` retienen cupo durante 24 h desde su creación (`HOLD_HOURS`, configurable). Pasado ese plazo dejan de contar en la disponibilidad; se calcula en la consulta, sin temporizadores. El admin ve el aviso «retención vencida».
6. **Fotos.** Solo borrado lógico (`deleted_at`) y una purga manual desde Ajustes, que verifica referencias por ID y por URL (`cover`, `src`) en el borrador, la versión publicada y todas las versiones archivadas. No hay borrado automático. Las subidas que nunca llegaron al borrador se listan en la misma purga.
7. **Usuarios y login.** `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` se leen del entorno y nunca se imprimen. Se eliminan los usuarios y contraseñas demo del seed y de `migrate()` en `src/store/index.ts`. Rate limit por IP y por cuenta con espera progresiva (1 s, 2 s, 4 s… hasta 60 s), sin bloqueo indefinido. Recuperación: `npm run reset-admin` con variables de entorno. `trust proxy` se configura según las cabeceras observadas en T0.
8. **Sesiones.** Token opaco aleatorio de 32 bytes con su hash SHA-256 en la BD, sin `SESSION_SECRET`. En cada petición se validan expiración, usuario activo y rol actual. Expiración deslizante de 7 días (se renueva como mucho una vez por hora) con tope absoluto de 30 días; la cookie usa el mismo `Max-Age`. Cambiar el rol o desactivar al usuario revoca sus sesiones.
9. **sharp.** Cola en proceso con un trabajo a la vez (mutex simple), `limitInputPixels` de 40 MP, multer en memoria con máximo 15 MB y 1 archivo por petición. Solo WebP. Las imágenes menores de 480 px generan una única variante a su tamaño. `sharp` se instala desde el lockfile en una instalación limpia dentro de T0.
10. **Concurrencia del borrador.** Toda mutación del borrador (PUT, discard, restore, import) exige `baseVersion` y se comprueba de forma atómica (`UPDATE … WHERE version = ?`); si no coincide, devuelve 409. Los permisos por rol también se aplican en restore y discard. El deshacer local se reinicia al cargar otra versión. Sin colaboración en tiempo real.

**Orden final:** T0 (prueba en Hostinger, con el usuario) → T1–T8 → resto según §11.

## 13. Imágenes: compresión en el frontend (decisión del usuario, prevalece sobre §6 y §12.9)

Modelo: el patrón de `p4ranoic0/autosell` (`arameoweb/src/app/core/services/file.service.ts`: `image-resize` → WebP + renombrado, `heic2any` con import dinámico), en una versión más limpia:
- Un único módulo `src/admin/image-pipeline.ts` usado por la galería, las portadas y cualquier subida del admin. Reemplaza la compresión por canvas actual.
- Librerías: `browser-image-compression` (Web Worker, orientación EXIF, `fileType: 'image/webp'`) y `heic2any` con `import()` dinámico solo para HEIC/HEIF (por MIME o por extensión).
- Dos variantes por foto: `full` (lado mayor según el nivel de Ajustes: Máxima 2000/0.9, Equilibrada 1600/0.8, Ligera 1280/0.72) y `thumb` (640 px, 0.75). Si el original ya es WebP y pesa menos, se conserva para `full`.
- Renombrado: `{album|portada}-{slug del alt ES o del nombre original}-{AAAAMMDD}-{6 caracteres base36}.webp` y `…-thumb.webp`, con el slug en minúsculas, sin tildes y con un máximo de 48 caracteres.
- Al volver a dibujar en canvas se pierden EXIF y GPS. Se guardan `width`, `height` y `bytes` de cada variante.
- Servidor **sin sharp**: `multer` acepta solo `image/webp`, como máximo 2 archivos por petición y 5 MB por archivo. Valida la firma `RIFF….WEBP` y las dimensiones leyendo la cabecera VP8/VP8L/VP8X sin dependencias nativas. Guarda tal cual en `UPLOADS_DIR`. Se eliminan `sharp`, `limitInputPixels` y la cola de trabajos.
- El sitio sirve `<img srcset="thumb 640w, full Nw" sizes=…>`.
