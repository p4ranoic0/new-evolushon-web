# T0: puerta de despliegue Hostinger

El ensayo local no acredita persistencia ni compatibilidad en Hostinger. No cambiar el dominio ni retirar WordPress hasta completar esta lista. Si los uploads no persisten, detener el lanzamiento y decidir almacenamiento externo.

## Preparar el panel

- Crear una base MySQL y usuario dedicado; anotar host interno, versión y límite de conexiones.
- Crear app Node desde GitHub, raíz `/`, Node 22, entry `server.js`, build `npm ci && npm run build`, inicio `npm start` si hay campo. Usar primero el subdominio temporal.
- Configurar `NODE_ENV=production`, `T0_ONLY=1`, `PUBLIC_URL=https://subdominio-temporal`, `TZ=America/Lima`, `DB_HOST`, `DB_PORT=3306`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `UPLOADS_DIR=/home/USUARIO/evolushon-uploads`, `TRUST_PROXY=0` inicialmente. No poner contraseñas en GitHub.
- Crear el directorio de uploads fuera del despliegue y permitir escritura al usuario Node. Confirmar con soporte que sobrevive a redeploy, reinicio y cambio de plan, y que los respaldos del panel lo incluyen.
- Si el build omite Vite/TypeScript, fijar `NPM_CONFIG_PRODUCTION=false`.

## Comprobar con evidencia

1. `curl -i https://SUBDOMINIO/healthz`: 200 y `ok`, `db`, `uploads` verdaderos.
2. Guardar fuera del repo `curl -fsS https://SUBDOMINIO/healthz/deep`: debe incluir `webp:true`, `persistedRow` y `persistedFile`. Crea una fila y un WebP de prueba y los reutiliza.
3. Hacer redeploy desde GitHub, repetir `/healthz/deep`; comparar el marcador, fecha y archivo. Después reiniciar la app y volver a comparar. Deben seguir idénticos.
4. Dejar al menos 1 h sin monitor y medir `curl -w '%{http_code} %{time_starttransfer} %{time_total}\n' -o /dev/null https://SUBDOMINIO/healthz/deep`. Registrar tiempo y duración de inactividad en RUNBOOK.
5. Observar `X-Forwarded-For` y `X-Forwarded-Proto` en las herramientas del panel/proxy; fijar `TRUST_PROXY` a los saltos reales. Confirmar `PORT` inyectado, redirección HTTPS y no-www. No confiar cabeceras del cliente sin proxy verificado.
6. Consultar disponibilidad de SSH/SFTP, MySQL remoto para respaldos, instalación de devDependencies y permiso para monitor cada 5 minutos.
7. Solo tras superar esta puerta: quitar `T0_ONLY`, configurar `ADMIN_INITIAL_EMAIL` y contraseña inicial robusta por entorno, redeployar, entrar como `admin`, cambiar contraseña, borrar ambas variables iniciales del panel y reiniciar.

## Resultado local

MySQL Homebrew aislado en puerto 3307 para no alterar el servicio existente. Validar instalación limpia (`npm ci`), y ambos healthchecks antes de seguir. La tabla `t0_probe` y `.t0-persistence.webp` sirven exclusivamente para este ensayo.

## Pendiente del usuario

Desplegar el código revisado (este encargo no autoriza commit/push), configurar hPanel y registrar los resultados reales de los pasos anteriores. Persistencia, arranque en frío y cabeceras del proxy en Hostinger siguen sin validar.
