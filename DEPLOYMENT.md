# Despliegue Node en Hostinger

## Puerta previa

Completar [T0](docs/hostinger-t0.md) en un subdominio temporal: MySQL, persistencia tras redeploy y reinicio, arranque tras inactividad y cabeceras del proxy. Si el disco no persiste, detener el lanzamiento y decidir almacenamiento externo. El código local y los tests no acreditan esas propiedades de Hostinger.

## Configuración

- GitHub: repo `p4ranoic0/new-evolushon-web`, raíz `/`, rama que el usuario decida publicar.
- Node **22**, entry **`server.js`**; build **`npm ci && npm run build`**; inicio **`npm start`** si el panel lo admite.
- MySQL dedicado con usuario exclusivo. Charset utf8mb4. Las migraciones usan collation compatible con MySQL/MariaDB.
- Variables de [.env.example](.env.example), con `NODE_ENV=production`, `PUBLIC_URL=https://evolushonsurfexperience.com`, `TZ=America/Lima`, conexión DB real y `UPLOADS_DIR=/home/USUARIO/evolushon-uploads` fuera de la carpeta de despliegue.
- `TRUST_PROXY`: número de proxies observado durante T0; valor local 0. No fijar 1 sin comprobar las cabeceras. `FORCE_HTTPS=1` solo tras validar proxy/TLS; el panel puede encargarse de HTTPS/no-www.
- `T0_ONLY=1` durante la prueba mínima; quitarlo o poner 0 para la app completa.
- Primer arranque: `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD` robusta. Nunca se imprimen. Sin esas variables y con usuarios vacíos, inicia en mantenimiento. Login: usuario `admin`; cambiar contraseña y retirar ambas variables iniciales antes de reiniciar.
- `MIGRATE_ON_START=1` por defecto. Si falla una migración, el proceso permanece activo en mantenimiento (API y deep health 503); corregir la causa y reiniciar. Cada DDL tolera repetición tras interrupción. No editar migraciones ya aplicadas.
- Si Vite/TypeScript no se instalan: `NPM_CONFIG_PRODUCTION=false`. No hay módulos nativos: las fotos se comprimen a WebP en el navegador.
- CSP en report-only (`CSP_ENFORCE=0`). Revisar el recorrido completo y activar `1` después de la observación inicial.

## Validación antes de cambiar dominio

```sh
curl -i https://SUBDOMINIO/healthz
curl -i https://SUBDOMINIO/healthz/deep
curl -s https://SUBDOMINIO/es/servicios/s-grupal
curl -I https://SUBDOMINIO/surftrips/
curl -I https://SUBDOMINIO/es/servicios/no-existe
curl -s https://SUBDOMINIO/sitemap.xml | xmllint --noout -
curl -s https://SUBDOMINIO/robots.txt
```

Verificar head (title/canonical/5 hreflang/JSON-LD), 301, 404 HTTP, cookie HttpOnly/Secure/SameSite=Strict con HTTPS, assets/uploads immutable. Probar login → editar precio → publicar → verlo desde sesión privada; subir foto → publicar → verla en galería; reserva pública → panel; dos reservas sobre el último cupo; edición simultánea en dos pestañas → conflicto.

Activar respaldos del plan, confirmar cobertura de uploads y preparar [respaldo propio/restauración](docs/RUNBOOK.md). Solo entonces cambiar DNS, activar SSL/HTTPS y repetir la verificación con el dominio definitivo. El servidor gestiona redirecciones WordPress, robots y sitemap; ya no se despliega `.htaccess` ni sitemap estático.

No incluir código, dependencias ni builds en OneDrive. No hacer commit de `.env`, dumps, credenciales ni uploads de clientes. Los logs van a stdout con requestId; no registran cuerpos de login ni tokens.
