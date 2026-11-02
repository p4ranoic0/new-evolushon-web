# Operación y recuperación

## Estado de validación

T0 local: MySQL Homebrew 9.6 en instancia aislada, ambos healthchecks 200; marcador y WebP conservados al reiniciar Node. MySQL 8/MariaDB y Linux/Hostinger deben verificarse en el panel. La instancia MySQL que ya estaba activa en el Mac no se modifica.

**Pendiente en Hostinger:** persistencia tras redeploy/reinicio, garantías del plan, versión/límite MySQL, PORT y devDependencies, cabeceras reales del proxy, SSH/SFTP/MySQL remoto y tiempo del primer acceso tras ≥1 h sin monitor. Registrar aquí fecha, duración de inactividad, TTFB, tiempo total y evidencia de la fila/archivo. No se ha medido el cold start remoto.

## Diagnóstico

- `/healthz` comprueba MySQL y escritura/lectura de uploads, versión, uptime y publishedAt. `/healthz/deep` además lee/escribe una fila persistente y prueba WebP. No usar deep como monitor frecuente.
- 503 de mantenimiento: revisar stdout de Hostinger usando requestId, corregir DB/permisos/migración/variables iniciales y reiniciar. El runner espera si otro proceso tiene el bloqueo; no iniciar procesos adicionales para desbloquearlo.
- No hay purga automática de fotos. Ajustes lista archivos sin referencias y permite purgar manualmente; comprueba ID y URL en borrador, publicado y las 20 versiones archivadas. Exportar/respaldo antes de una purga.
- Las sesiones expiran tras 7 días de inactividad con máximo absoluto de 30 días. Se renuevan a lo sumo cada hora. Rol/desactivación/contraseña administrativa revocan las sesiones; logout elimina su token hash.

## Recuperar administrador y rotar secretos

Con SSH/consola: configurar temporalmente `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` en entorno, ejecutar `npm run reset-admin` desde el proyecto y entrar como `admin`. Cambiar contraseña y retirar variables. El comando nunca imprime credenciales y revoca las sesiones de admin. Sin consola, usar una tarea de inicio temporal del panel para ejecutar el comando antes de `npm start`; no publicar una ruta HTTP de recuperación.

Para rotar DB: crear/cambiar credencial en hPanel, actualizar variables, reiniciar, verificar deep, retirar credencial anterior. No existe SESSION_SECRET: los tokens son aleatorios y en DB solo hay SHA-256. Para cerrar todas las sesiones: `DELETE FROM sessions` desde la consola MySQL autorizada.

## Respaldo desde el Mac

Requiere MySQL remoto permitido para la IP del Mac y SSH/rsync en el plan. Configurar por entorno `BACKUP_DB_HOST`, `BACKUP_DB_PORT` (3306), `BACKUP_DB_NAME`, `BACKUP_DB_USER`, `BACKUP_DB_PASSWORD`, `BACKUP_SSH_HOST=usuario@host`, `BACKUP_SSH_PORT` (22) y `BACKUP_UPLOADS_DIR=/home/USUARIO/evolushon-uploads`. No poner esas variables en el repositorio ni en archivos sincronizados. Por defecto exige TLS MySQL (`BACKUP_SSL_MODE=REQUIRED`); usar el modo/certificado indicado por el proveedor.

Ejecutar `scripts/backup.sh`. Usa opciones temporales con permisos 600 para no pasar la contraseña en argv, dump consistente, gzip y checksum, rsync de uploads y conservación de 8 copias completas identificadas por su marcador. Destino por defecto: `~/Library/CloudStorage/OneDrive-Personal/TRABAJOS/evolushon/backups/AAAA-MM-DD/`. Puede configurarse `BACKUP_ROOT`. Un fallo deja `.partial.*` para diagnóstico; no cuenta como copia válida. Revisar y retirar esa carpeta parcial después de resolverlo. Programar semanalmente con launchd solo tras probar las credenciales y una restauración.

Sin SSH: exportar JSON desde Ajustes y descargar los archivos con el respaldo del panel. El JSON incluye contenido, reservas y usuarios sin hashes; **no es un dump restaurable de contraseñas/sesiones**. Para recuperación íntegra usar dump MySQL más uploads.

## Restauración

1. Detener la app/poner mantenimiento en el panel para evitar nuevas escrituras.
2. Hacer copia del estado actual y verificar `shasum -a 256 -c SHA256SUMS` en la copia elegida.
3. Restaurar el dump con cliente MySQL y credenciales externas: `gunzip -c dump.sql.gz | mysql --defaults-extra-file=/ruta/segura/mysql.cnf BASE`. Atención: sobrescribe las tablas de esa base; comprobar el destino.
4. Copiar `uploads/` a `UPLOADS_DIR` con el usuario/permisos de la app, sin alterar nombres ni estructura.
5. Reiniciar, comprobar health/deep, galería, login, precio publicado y reservas. Invalidar sesiones restauradas con `DELETE FROM sessions` antes de abrir al público.
6. Verificar sitemap/robots y SEO. Documentar fecha y copia restaurada.

Activar también el respaldo semanal del plan y confirmar explícitamente que incluye el directorio externo de uploads. No se ha ejecutado un respaldo remoto real ni una restauración sobre Hostinger desde este entorno.

## Google Places: reseñas opcionales

**Condición pendiente antes de activar en producción:** la [política oficial de Places](https://developers.google.com/maps/documentation/places/web-service/policies) no otorga un permiso general de caché de reseñas durante 30 días. Ese plazo no acredita por sí mismo que se puedan almacenar reseñas; confirmar las condiciones o una excepción aplicable con Google. Esta implementación conserva la caché pedida por el dueño, con límite técnico de 30 días, pero no certifica permiso contractual. Mantener las dos variables vacías hasta resolverlo. Las páginas públicas de términos y privacidad deben incorporar las condiciones de Google aplicables.

1. En Google Cloud, elegir/crear proyecto con facturación y habilitar **Places API (New)**. Crear clave en APIs y servicios → Credenciales. Restringirla a Places API (New); usar restricción por IP del servidor si Hostinger garantiza IP de salida estable (no por dominio/referer, la llamada es de servidor). [Pasos oficiales](https://developers.google.com/maps/documentation/places/web-service/get-api-key).
2. Abrir el [buscador oficial de Place ID](https://developers.google.com/maps/documentation/places/web-service/place-id), buscar la ficha y copiar el Place ID. No confundirlo con el enlace corto de Maps ni con un CID numérico.
3. Tras resolver la condición anterior, configurar `GOOGLE_PLACES_API_KEY` y `GOOGLE_PLACE_ID` en las variables del servidor Node de Hostinger, reiniciar y abrir Admin → Reseñas. Debe indicar activa, última actualización, N reseñas y puntuación. Sin una de las variables indica inactiva. Una clave configurada pero inválida sigue figurando activa, con aviso de error.
4. Comprobar `/api/public/reviews?lang=es` (también en/fr/de): no expone clave ni Place ID. Primera visita a cada idioma consulta `GET /v1/places/{id}?languageCode=...` con máscara `rating,userRatingCount,reviews,googleMapsUri`. Places devuelve hasta 5 reseñas, no todas; el total global y la cantidad descargada difieren. Se factura la selección de campos solicitada; revisar cuotas y precios en Google Cloud.

La tabla `google_reviews_cache` separa ficha e idioma mediante hash. Conserva el último resultado y el último intento; un bloqueo MySQL evita peticiones duplicadas entre procesos y la memoria agrupa peticiones concurrentes. Cada idioma reintenta como máximo una vez por 24 h, incluidos fallos y reinicios. Fallos/timeout (8 s) producen un aviso saneado en stdout, mantienen el resultado anterior si tiene menos de 30 días y nunca añaden datos al historial editorial. El admin señala resultado antiguo/fallo. No hay botón de refresco que salte el TTL. Cambiar Place ID crea una caché independiente.

Se purgan resultados a los 29 días al arrancar, en consultas nuevas y cada hora mientras el servidor está activo, también tras retirar las variables. Ese día de margen evita que el intervalo horario supere el máximo de 30 días. No se sirven datos con antigüedad de 29 días o más. Si la app permanece apagada no puede ejecutar purgas: limpiar la tabla desde MySQL o asegurar una tarea externa para cumplir una retención física estricta durante apagados. No copiar esta tabla a exportaciones, versiones editoriales ni respaldos: `scripts/backup.sh` excluye sus filas y conserva solo el esquema. Excluirla también de los respaldos automáticos del proveedor o resolver su retención por separado. Al restaurar un dump, la tabla vacía se vuelve a llenar en la siguiente consulta. Los backups previos a esta función no contienen la tabla.

Para desactivar: retirar las variables, reiniciar y, si se quiere eliminación inmediata de las copias de Google, ejecutar `DELETE FROM google_reviews_cache` sobre la base correcta. Las reseñas manuales permanecen disponibles. Configurar enlaces/puntuación manuales en Admin → Reseñas si se quiere un respaldo; los valores sincronizados prevalecen mientras están disponibles. La sección usa «Lo que dicen nuestros alumnos» con fuentes ajenas a Google y «Lo que dicen en Google» si todas son de Google.

La limpieza de ejemplos ocurre dentro de la transacción y bloqueo del seed, solo en borrador/publicado y solo para registros `sample: true`; conserva el resto del documento e incrementa `version`. El dueño puede seguir usando «Quitar ejemplos» tras importar un respaldo antiguo. Aunque permanezcan en snapshots archivados o se restauren, los ejemplos nunca salen por las rutas públicas.
