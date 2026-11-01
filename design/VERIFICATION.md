# Verificación de la portación

Fecha: 2026-11-01. Worktree: `evolushon-rediseno`. Sin commit ni push.

## Archivos

| Archivo | Cambio |
|---|---|
| `design/claude-design/Evolushon Sitio v2.dc.html` | Copia íntegra de la referencia pública. |
| `design/claude-design/Evolushon Admin v3.dc.html` | Copia íntegra de la referencia del panel. |
| `design/claude-design/evo-store.js` | Fuente original del contenido, conservada. |
| `design/claude-design/doodles.js` | Fuente original de las ilustraciones, conservada. |
| `design/claude-design/support.js` | Runtime original, solo referencia; no se importa en producción. |
| `src/store/types.ts` | Tipos de servicios, ofertas, fotos, álbumes, reseñas, ajustes, usuarios demo, reservas e historial. |
| `src/store/seed.ts` | Datos de `evo-store.js` portados sin cambios de contenido. |
| `src/store/ui.ts` | Los cuatro diccionarios UI originales. |
| `src/store/booking-ui.ts` | Textos de reserva y reseñas de Sitio v2 en cuatro idiomas. |
| `src/store/public-ui.ts` | Textos auxiliares localizados: footer, accesibilidad y 404. |
| `src/store/reviews.ts` | Las tres reseñas de ejemplo originales, identificadas como tales. |
| `src/store/seo-defaults.ts` | Títulos y descripciones de `applySeo()`. |
| `src/store/index.ts` | Migración, publicación y suscripción local, claves originales, fallback ES, precios/ofertas, WhatsApp, rutas, resolución Vite de assets, descarga de archivos. |
| `src/components/PublicSite.tsx` | Header y menú, hero, presentación, categorías, destacadas, reseñas, catálogo, detalle, galería, contacto, footer y lightbox. |
| `src/components/Booking.tsx` | Opciones/paquetes, personas, calendario, cupos, horarios, datos, adelanto/total, tarjeta/Yape/Plin demo, confirmación, WhatsApp e ICS. |
| `src/components/SEO.tsx` | Metadatos React 19, `html[lang]`, canonical, hreflang, JSON-LD LocalBusiness/SportsActivityLocation, Offer y TouristTrip. |
| `src/components/Doodle.tsx` | SVG originales convertidos a componente React; sin web component ni runtime del prototipo. |
| `src/components/Modal.tsx` | Escape, foco atrapado/restaurado y bloqueo del scroll en menú, reserva y lightbox. |
| `src/admin/Admin.tsx` | Login/roles demo, shell responsive, resumen, borrador/publicación, undo/redo e historial. |
| `src/admin/ServicesEditor.tsx` | CRUD y orden, precios/paquetes, portada y foco, ofertas temporales, logística, listas y SEO con vista previa Google/servicio. |
| `src/admin/GalleryEditor.tsx` | Álbumes, carga múltiple y drag/drop, compresión, búsqueda/filtros, selección/rangos, operaciones múltiples, orden, alt/foco, destacadas/ocultas y vista bento. |
| `src/admin/BookingsEditor.tsx` | Lista y búsqueda de reservas, estados, confirmación, WhatsApp, CSV y configuración de calendario, cupos y pagos demo. |
| `src/admin/ContentEditors.tsx` | Reseñas manuales, textos del inicio, idiomas, ajustes, usuarios demo, SEO por página, importación/exportación e historial. |
| `src/admin/images.ts` | Compresión canvas con los tres perfiles y fallback WebP → JPEG. |
| `src/admin/shared.tsx` | Controles y paneles comunes, selector de idioma y aviso de traducción asistida no disponible. |
| `src/admin/utils.ts` | Orden de listas, tamaños y recuento de traducciones pendientes. |
| `src/admin/asset-sizes.ts` | Tamaños de los assets originales para identificar fotos pesadas sin descargarlas para medir. |
| `src/admin/admin.css` | Sistema visual del panel, tablas, editores, previews y navegación inferior móvil. |
| `src/App.tsx` | Rutas por idioma y detalle, redirects antiguos, 404 y `React.lazy` del panel. |
| `src/main.tsx` | Arranque sin basename, i18next, QueryClient ni modo oscuro. |
| `src/index.css` | Tailwind 4, tokens, tipografías, composición responsive, reveal, título, marquee, hover y reduced-motion. |
| `index.html` | Tipografías nuevas, metadatos estáticos comunes, eliminación de SEO duplicado del sitio anterior. |
| `vite.config.ts` | `base: '/'`. |
| `public/.htaccess` | Rutas SPA válidas, 301 antiguos, 404 HTTP con documento React, archivos reales, caché immutable y deflate. |
| `public/robots.txt` | Dominio correcto y exclusión de `/admin`. |
| `public/sitemap.xml` | 56 URLs iniciales, cuatro idiomas y x-default por URL. |
| `.github/workflows/deploy.yml.disabled` | Workflow GitHub Pages conservado y desactivado mediante renombrado. |
| `package.json`, `package-lock.json` | Solo React, React DOM, Router y Tabler en runtime; eliminación de dependencias sin uso y actualización compatible del lockfile. |
| `README.md` | Arquitectura y comandos actuales. |
| `DEPLOYMENT.md` | Subida de dist a public_html por File Manager/FTP, Apache, alcance local y límites de la demo. |

Retirados: las 11 páginas antiguas de `src/pages/`; AnimatedSection, DestinationItem, Footer, Hero, ImageCarousel, LanguageSwitcher, MobileMenu, Navbar, PhotoGrid, PriceCard, SurfCard y ThemeToggle; `src/i18n.ts`, `public/vite.svg` y `ENCARGO.md`. No se modificó ni borró ningún archivo de `src/assets/`.

## Instalación, build y lint

Ejecutado `npm install && npm run build && npm run lint`, con código de salida 0. Después del último ajuste al orden de fotos, build y lint repetidos con código 0.

Salida de instalación: `up to date in 274ms`.

Salida de build: Vite 7.3.7, `6432 modules transformed`, `✓ built in 1.65s` en la ejecución completa. El panel se genera en un JS y CSS aparte. El JS público ronda 318 kB (102 kB gzip), el panel 63 kB (19 kB gzip). Una visita pública comprobada no pidió el bundle Admin.

Salida de lint: `> eslint .`, sin errores ni warnings de lint. Node emitió una advertencia de deprecación de `module.register()` durante build; npm avisó de scripts de instalación de esbuild/fsevents pendientes en la política local, sin impedir compilar.

`npm audit --omit=dev`: `found 0 vulnerabilities`. Tras actualizar versiones compatibles permanecen 12 avisos moderados en la cadena de ESLint/TypeScript ESLint/minimatch; no se forzaron cambios incompatibles.

`git diff --check`: sin salida. El nombre `SEO.tsx` conserva las mismas mayúsculas en disco e imports para despliegues con filesystem sensible a mayúsculas.

## Navegador

Preview Vite en `127.0.0.1:4173`, referencias originales en `127.0.0.1:4174`, sesión de navegador aislada. Comparación a **1440 × 1000** y **390 × 844**: hero, servicios, presentación/categorías, galería, contacto, login/resumen del admin y reserva. Se revisaron también los editores del panel. No es una certificación píxel a píxel.

| Ruta probada | Resultado |
|---|---|
| `/` | Redirige a `/es/`. |
| `/es/` | Hero, vídeo de escritorio, contenido y navegación. |
| `/en/services` | UI inglesa, html lang=en, canonical y cinco hreflang. |
| `/fr/services` | UI francesa y SEO francés. |
| `/de/angebote` | UI alemana, SEO alemán y fallback español del contenido faltante. También revisado a 390 px. |
| `/es/servicios/s-grupal` | Detalle, precio y reserva. |
| `/es/servicios/t-bermejo` | Detalle del trip y datos estructurados. |
| `/es/galeria` | 27 fotos; filtro Trips → 4; lightbox y teclado. Revisada a ambos anchos. |
| `/es/contacto` | CTA WhatsApp, datos y foto. Revisada a ambos anchos. |
| `/clases/surf` | Router redirige a `/es/servicios?category=surf`. |
| `/es/no-existe`, `/es/servicios/no-existe` | Pantalla 404, robots noindex, sin canonical/hreflang residual. |
| `/admin` | Login demo, todas las secciones, noindex/nofollow, navegación móvil y editores. |

En las rutas públicas inspeccionadas el ancho del documento fue igual al viewport (390 o 1440), sin imágenes rotas detectadas. En Resumen, Reservas, Galería, Ajustes, Reseñas, Textos e Idiomas del admin también se comprobó el ancho a 390 px. Las tablas de servicios tienen scroll propio.

Otras comprobaciones:

- Header con scroll nativo: scrollY=300/1000 y clase `site-header solid`.
- Reveal normal: opacidad final 1, transform final none; se activa al entrar en viewport.
- Escritorio sin reduced-motion: un vídeo con `preload=metadata` y póster; móvil: cero vídeos.
- Reduced-motion a 1440 px: cero vídeos, opacidad de contenido 1 y `animationName=none` en el marquee.
- SEO: un title y una meta description; cinco alternates, 10 ofertas y 3 TouristTrip en JSON-LD.
- Lightbox: filtro de cuatro trips, flecha derecha → `02 / 04`, aria-modal=true, scroll del body bloqueado, Escape cierra.
- Admin: login admin/evolushon → editar precio 120 a 125 → publicar → navegar al sitio en la misma pestaña → `.price = S/ 125`, publicado=125, borrador=125, historial con una entrada.
- Reserva: paquete de 4 clases, 2026-11-02 a las 07:00, datos ficticios, tarjeta ficticia. Guardó total 400, adelanto/pagado 200, status pagada y demo=true. No se guardó el número de tarjeta. CTA WhatsApp incluyó servicio, opción, fecha/hora y código.
- Estado de reserva cambiado desde el admin a «por verificar», persistido y reflejado en contador.
- Datos de prueba eliminados al terminar; precio inicial comprobado de nuevo: S/ 120, sin reservas de prueba.

Compresión real de `galeria-sesion-16.jpg` (605445 bytes), cargando desde la UI:

| Perfil | Dimensiones resultantes | Bytes WebP |
|---|---|---:|
| Máxima | 1500 × 2000 | 636072 |
| Equilibrada | 1200 × 1600 | 331542 |
| Ligera | 960 × 1280 | 181191 |

Como en el prototipo, el perfil determina calidad y tamaño máximo; no garantiza que cada conversión pese menos. Máxima produjo un archivo mayor en esta foto. La UI muestra el tamaño real y los rangos de Ajustes son estimaciones.

## Apache

Prueba con Apache 2.4.67 local en `127.0.0.1:4175`, sirviendo dist con AllowOverride All. Configuración: `Syntax OK`.

- `/clases/surf`: HTTP 301 y Location `/es/servicios?category=surf`.
- `/contacto`: HTTP 301 y Location `/es/contacto`.
- `/es/galeria`, `/es/servicios/s-grupal`: HTTP 200.
- `/no-existe`, `/es/servicios/no-existe`: HTTP 404, cuerpo index.html para la pantalla React.
- Asset JS con hash: `Cache-Control: public, max-age=31536000, immutable`.
- HTML con Accept-Encoding gzip: `Content-Encoding: gzip`, `Vary: Accept-Encoding`, `Cache-Control: no-cache`.
- `dist/.htaccess`, `dist/robots.txt` y `dist/sitemap.xml` existen.

No se ha subido ni probado en la cuenta real de Hostinger.

## Integridad y diferencias

Comprobación programática: los cinco archivos copiados son idénticos byte por byte a los originales; SEED y UI se evaluaron y compararon con DEFAULT/UI del `evo-store.js` original, con igualdad exacta. Sitemap parseado como XML: 56 URLs, cinco alternates cada una. Búsqueda en código de producción sin imports de support.js/.dc.html ni dependencias retiradas.

Diferencias visuales/funcionales deliberadas o menores:

- Marquee dorado con contenido y movimiento: en el HTML original el contenedor de esa banda está vacío; el encargo pide implementarlo.
- Los nombres del catálogo enlazan al detalle con URL propia, añadido por el encargo. Se conserva el detalle desplegable de listas/trips.
- Tabler renderiza SVG React en vez de glifos de webfont; pueden variar unos píxeles sus trazos y el espacio de botones.
- El admin conserva paleta/tipografía/shell y navegación inferior, pero algunos controles se agrupan de otra forma y se añadió acceso al menú lateral en móvil. Tamaños/posiciones de algunos doodles y espaciados no son idénticos al píxel.
- Focus trap, Escape y bloqueo/restauración del foco en modales; vídeo sustituido por imagen en móvil/reduced-motion según el encargo.

Pendientes externos y límites explícitos:

- Configurar el número real de WhatsApp. El original solo trae un enlace corto; su proveedor podría ignorar el parámetro text. Con número se usa wa.me con mensaje prellenado.
- Traducción asistida: el original dependía de window.claude.complete, ausente en producción. Se conserva la edición manual de cuatro idiomas y los botones explican la indisponibilidad, sin inventar una traducción automática.
- Admin, publicación, imágenes y reservas son locales al navegador. Los pagos son demo. No se ha añadido backend, autenticación real ni pagos.
- Para publicar nuevos servicios/slugs para todos, hay que actualizar contenido inicial, sitemap y lista de rutas de .htaccess y recompilar. Apache no conoce slugs guardados solo en localStorage.
- El vídeo original se conserva (~59 MB); dist ocupa ~92 MB con todos los assets. No se recodificaron ni borraron fotos/vídeo.
- Las fuentes se cargan desde Google Fonts, como en el prototipo.
- Quedan los avisos moderados de dependencias de desarrollo antes descritos. No se forzaron versiones mayores.
