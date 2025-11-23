# 🌊 Evolushon Surf Experience

[![Deploy to GitHub Pages](https://github.com/p4ranoic0/new-evolushon-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/p4ranoic0/new-evolushon-web/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC)](https://tailwindcss.com/)

Sitio web oficial de **Evolushon Surf School** - Tu conexión entre cuerpo, mente y mar. Escuela de surf en Lima, Perú, ofreciendo clases personalizadas en múltiples idiomas.

🌐 **[Ver sitio en vivo](https://p4ranoic0.github.io/new-evolushon-web/)**

## ✨ Características

- 🏄‍♂️ **Clases de Surf**: Grupales, privadas, coaching y tandem
- 🛹 **SurfSkate**: Entrena tu surf en tierra
- ✈️ **Surftrips**: Escapadas de un día y aventuras de camping
- 📸 **Galería**: Momentos capturados de nuestras sesiones
- 🌍 **Multiidioma**: Español, Inglés (con soporte para Francés y Alemán)
- 🌓 **Modo Oscuro**: Tema claro/oscuro adaptativo
- 📱 **Responsive**: Diseño optimizado para todos los dispositivos
- ⚡ **Performance**: Carga rápida con React + Vite
- 🎨 **Animaciones**: Transiciones suaves con Framer Motion

## 🛠️ Tecnologías

Este proyecto está construido con tecnologías modernas:

- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.2.2** - Build tool ultrarrápido
- **Tailwind CSS 4.1.17** - Framework CSS utility-first
- **React Router 7.9.6** - Enrutamiento
- **Framer Motion 12.23.24** - Animaciones
- **react-i18next 16.3.3** - Internacionalización
- **Lucide React** - Iconos
- **GSAP** - Animaciones avanzadas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/p4ranoic0/new-evolushon-web.git
cd new-evolushon-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta ESLint para verificar el código
```

## 🚀 Despliegue en GitHub Pages

Este proyecto está configurado con **GitHub Actions** para despliegue automático en GitHub Pages.

### Configuración Inicial

1. **Habilita GitHub Pages en tu repositorio**:

   - Ve a `Settings` → `Pages`
   - En `Source`, selecciona `GitHub Actions`

2. **Actualiza la configuración base en `vite.config.ts`**:

   ```typescript
   export default defineConfig({
     base: "/nombre-de-tu-repo/",
     // ...
   });
   ```

3. **Push a la rama main**:

   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

4. El workflow se ejecutará automáticamente y desplegará el sitio.

### Workflow de CI/CD

El archivo `.github/workflows/deploy.yml` contiene el workflow de despliegue que:

- ✅ Se ejecuta automáticamente en cada push a `main`
- ✅ Instala dependencias
- ✅ Construye la aplicación
- ✅ Despliega a GitHub Pages
- ✅ Puede ejecutarse manualmente desde la pestaña Actions

## 📁 Estructura del Proyecto

```
new-evolushon-web/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de GitHub Actions
├── public/                     # Archivos estáticos
├── src/
│   ├── assets/                 # Imágenes y recursos
│   ├── components/             # Componentes reutilizables
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── Navbar.tsx
│   │   ├── PhotoGrid.tsx
│   │   └── ThemeToggle.tsx
│   ├── pages/                  # Páginas de la aplicación
│   │   ├── About.tsx
│   │   ├── Calendar.tsx
│   │   ├── Classes.tsx
│   │   ├── Contact.tsx
│   │   ├── Gallery.tsx
│   │   ├── Home.tsx
│   │   ├── Instructors.tsx
│   │   ├── Prices.tsx
│   │   ├── Surf.tsx
│   │   ├── SurfSkate.tsx
│   │   └── SurfTrips.tsx
│   ├── App.tsx                 # Componente principal
│   ├── i18n.ts                 # Configuración de i18next
│   ├── index.css               # Estilos globales
│   └── main.tsx                # Punto de entrada
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Personalización

### Colores y Tema

Los colores se definen en `src/index.css` usando custom properties de Tailwind CSS v4:

```css
@theme {
  --color-brand: #00a8e8;
  --color-ocean-*: ...;
  --color-sunset-*: ...;
  /* ... más colores */
}
```

### Traducciones

Las traducciones se gestionan en `src/i18n.ts`. Para agregar un nuevo idioma:

1. Agrega el objeto de traducción en `resources`
2. Actualiza el componente `LanguageSwitcher`

### Rutas

Las rutas están definidas en `src/App.tsx` usando React Router:

```typescript
<Route path="/" element={<Home />} />
<Route path="/surf" element={<Surf />} />
// ... más rutas
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y pertenece a Evolushon Surf School.

## 📧 Contacto

**Evolushon Surf School**

- Website: [https://p4ranoic0.github.io/new-evolushon-web/](https://p4ranoic0.github.io/new-evolushon-web/)
- Email: info@evolushon.com
- Instagram: [@evolushonsurf](https://instagram.com/evolushonsurf)

---

Hecho con 💙 y 🏄‍♂️ por el equipo de Evolushon
