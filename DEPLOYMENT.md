# Despliegue en Hostinger

Esta app está preparada para la raíz de `https://evolushonsurfexperience.com`, con Apache y React Router. GitHub Pages quedó desactivado en `.github/workflows/deploy.yml.disabled`.

## Construir y subir

1. Ejecuta `npm install`, `npm run lint` y `npm run build` (Node 20.19+ o 22.12+).
2. Prueba `npm run preview -- --host 127.0.0.1`. La vista previa de Vite no interpreta `.htaccess`; las respuestas HTTP/301 de Apache se verifican después de subir.
3. En hPanel abre **Archivos → Administrador de archivos → public_html** del dominio. Haz una copia de los archivos actuales antes de reemplazarlos.
4. Sube **el contenido de `dist/`**, incluido el archivo oculto `.htaccess`, directamente a `public_html/`. No subas la carpeta `dist` como subdirectorio. También puedes usar FTP/SFTP con las credenciales gestionadas en hPanel.
5. Deben existir `public_html/index.html`, `public_html/.htaccess`, `public_html/assets/`, `public_html/robots.txt` y `public_html/sitemap.xml`.
6. Activa el certificado SSL desde hPanel y la redirección a HTTPS. Si usas CDN/caché de Hostinger, purga la caché tras reemplazar `index.html`.
7. Comprueba `/es/`, `/en/services`, `/fr/services`, `/de/angebote`, un detalle (`/es/servicios/s-grupal`), `/es/galeria`, `/es/contacto` y `/admin` recargando cada URL directamente.
8. Comprueba `curl -I https://evolushonsurfexperience.com/clases/surf`: debe devolver `301` a `/es/servicios?category=surf`. Las rutas desconocidas fuera de los patrones de la SPA devuelven `404` y muestran la pantalla React. Los slugs de servicio desconocidos también devuelven HTTP 404.

No requiere procesos Node, backend, base de datos ni variables de entorno en Hostinger. Los archivos reales no se reescriben. Los recursos con hash tienen caché de un año; HTML y metadatos se revalidan. `.htaccess` activa deflate cuando Apache ofrece el módulo.

## Alcance de la demo local

- `/admin` usa las credenciales demo `admin` / `evolushon`. También existen `editor` / `editor` y `foto` / `foto`, con los roles del prototipo. Es una interfaz demo, no autenticación de servidor.
- **Publicar guarda solamente en localStorage del origen y navegador actuales.** No modifica `dist`, no sube archivos a Hostinger y no transmite cambios a otros clientes. Borrador y publicado comparten claves con el prototipo. Recarga o navega a «Ver sitio publicado» para verlo; otras pestañas del mismo origen se sincronizan por `storage`.
- Las reservas y cupos también son locales. El pago por tarjeta es simulado; no se envían ni persisten número, vencimiento o CVC. Usa números ficticios. Yape/Plin quedan «por verificar». No se procesa ningún cobro.
- El contenido inicial trae reseñas de ejemplo claramente señaladas; se pueden reemplazar o quitar en Reseñas.
- El número de WhatsApp viene vacío del original. En Ajustes configura un número con país (por ejemplo, prefijo `51`) para garantizar el mensaje prellenado en `wa.me`. Mientras tanto se conserva el enlace corto del diseño; su proveedor puede ignorar el parámetro `text`.
- La traducción asistida del prototipo dependía de `window.claude.complete`, que no existe fuera de Claude Design. Los botones lo explican. La edición manual de ES/EN/FR/DE y el fallback español funcionan sin servicios externos.
- Los tres perfiles de compresión son Máxima (2000 px, 90%), Equilibrada (1600 px, 82%) y Ligera (1280 px, 72%). Los nuevos archivos se convierten a WebP o JPEG en canvas. Hay avisos si el navegador se queda sin cuota.
- El historial conserva hasta 8 publicaciones de servicios, ajustes, reseñas, álbumes y textos; no duplica imágenes. Restaurar una versión la lleva al borrador y conserva las fotos actuales. Exportar JSON en Ajustes incluye todo el contenido, imágenes subidas y usuarios **demo**. No uses credenciales reales en esta fase.

## Cambiar el contenido inicial para todos

El contenido base está en `src/store/seed.ts`, los textos UI en `src/store/ui.ts` y `src/store/booking-ui.ts`, y el SEO en `src/store/seo-defaults.ts`. Actualiza esos archivos, recompila y vuelve a subir `dist/`. Los navegadores con una publicación local seguirán usando su localStorage; se puede restaurar el contenido original desde Ajustes.

Si se añaden servicios o cambian sus slugs de forma permanente, actualiza también las reglas de detalle de `public/.htaccess` y `public/sitemap.xml`. Incluye los cuatro idiomas y `x-default`; el sitemap y Apache no pueden conocer cambios guardados solo en un navegador. Un slug nuevo de la demo puede navegarse desde React; su carga directa en Apache devolverá 404 hasta actualizar la lista de rutas del despliegue. Para un CMS compartido, reservas globales o autenticación real hace falta una fase posterior con backend.

## Fuentes visuales

`design/claude-design/` conserva íntegros los cinco archivos fuente. `support.js` y las plantillas `.dc.html` solo son referencias: no se importan en producción. Las ilustraciones SVG se portaron a React en `src/components/Doodle.tsx`. Las fotografías y el vídeo existentes permanecen en `src/assets/` y Vite genera sus URLs con hash.
