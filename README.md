# Evolushon Surf Experience

Sitio público multilingüe y panel demo del equipo, portados desde **Claude Design: Sitio v2 + Admin v3** a React 19, TypeScript, Vite 7 y Tailwind 4. Iconos Tabler; tipografías Bricolage Grotesque, Instrument Serif y Figtree (Google Fonts).

```sh
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Requiere Node 20.19+ o 22.12+. El despliegue usa la raíz `/` del dominio, sin basename de GitHub Pages. Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para subir `dist/` a Hostinger y para las limitaciones de la demo.

- `/` redirige a `/es/`. Idiomas ES, EN, FR, DE con rutas localizadas y selector que conserva la página o servicio.
- Servicios: `/es/servicios`, `/en/services`, `/fr/services`, `/de/angebote`; detalle por ID o slug SEO.
- Galería y contacto tienen sus slugs localizados. Las URLs antiguas redirigen a español.
- `/admin` se carga por separado mediante `React.lazy`. Login demo: `admin` / `evolushon`. Borrador, publicación, historial y reservas se guardan únicamente en el navegador.
- Pagos simulados, sin backend. No se guardan los campos de tarjeta. El contenido FR/DE vacío usa español, igual que el prototipo.

## Código

- `src/store/`: modelo tipado, datos originales, textos UI, migración y persistencia con las claves `evolushon-*-v1`, rutas y resolución de assets.
- `src/components/PublicSite.tsx`: sitio público y estados del catálogo/galería.
- `src/components/Booking.tsx`: opciones, cupos/calendario, datos, pago demo y confirmación (WhatsApp/ICS).
- `src/components/SEO.tsx`: metadatos, canonical/hreflang y JSON-LD por página e idioma.
- `src/admin/`: pantallas y editores del panel, compresión de imágenes y publicación local.
- `src/index.css`: tokens Tailwind 4 y sistema visual responsive con reduced-motion.
- `public/`: `.htaccess`, sitemap, robots e imágenes públicas para SEO.
- `design/claude-design/`: fuentes originales versionadas, sin runtime de prototipo en el bundle.

El sitio antiguo, su modo oscuro y dependencias que dejaron de usarse se retiraron. No se eliminaron fotografías de `src/assets/`.

El detalle archivo por archivo y la evidencia de QA están en [design/VERIFICATION.md](design/VERIFICATION.md).
