# 🚀 Guía de Despliegue en GitHub Pages

Esta guía te ayudará a desplegar tu proyecto React + Vite en GitHub Pages usando GitHub Actions.

## ✅ Pre-requisitos

1. Un repositorio en GitHub
2. Node.js 20.x o superior instalado localmente
3. El proyecto debe construirse correctamente con `npm run build`

## 📋 Pasos para el Despliegue

### 1. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, selecciona **Pages**
4. En **Source** (Origen), selecciona **GitHub Actions**

![GitHub Pages Settings](https://docs.github.com/assets/cb-47528/mw-1440/images/help/pages/create-site-from-source.webp)

### 2. Verificar la Configuración de Vite

El archivo `vite.config.ts` debe incluir la propiedad `base` con el nombre de tu repositorio:

```typescript
export default defineConfig({
  base: "/new-evolushon-web/", // 👈 Cambiar por tu nombre de repo
  plugins: [react()],
});
```

**⚠️ Importante**: La ruta debe coincidir con el nombre de tu repositorio:

- Formato: `/<nombre-del-repo>/`
- Ejemplo: Si tu repo es `my-surf-app`, usa `/my-surf-app/`

### 3. Verificar el Workflow

El archivo `.github/workflows/deploy.yml` ya está configurado y listo para usar. Este workflow:

- ✅ Se ejecuta automáticamente en cada push a `main`
- ✅ Instala las dependencias con `npm ci`
- ✅ Construye el proyecto con `npm run build`
- ✅ Despliega la carpeta `dist/` a GitHub Pages

### 4. Hacer Push de los Cambios

```bash
# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "Configure GitHub Pages deployment"

# Push a la rama main
git push origin main
```

### 5. Monitorear el Despliegue

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Una vez completado (✅), tu sitio estará disponible en:
   ```
   https://[tu-usuario].github.io/[nombre-del-repo]/
   ```

## 🔄 Despliegues Posteriores

Una vez configurado, cada vez que hagas push a la rama `main`, el sitio se actualizará automáticamente.

```bash
# Hacer cambios en tu código
# ...

# Commit y push
git add .
git commit -m "Update surf classes content"
git push origin main

# El despliegue inicia automáticamente
```

## 🐛 Solución de Problemas

### ❌ Error: "Failed to load resource: the server responded with a status of 404"

**Causa**: La configuración de `base` en `vite.config.ts` no coincide con el nombre del repositorio.

**Solución**:

```typescript
// vite.config.ts
export default defineConfig({
  base: "/nombre-correcto-del-repo/", // 👈 Verificar esto
  plugins: [react()],
});
```

### ❌ Error: "Process completed with exit code 1" durante el build

**Causa**: Errores de compilación o linting en el código.

**Solución**:

1. Ejecuta localmente: `npm run build`
2. Corrige los errores mostrados
3. Commit y push de nuevo

### ❌ Las rutas no funcionan después del despliegue

**Causa**: React Router necesita configuración especial para GitHub Pages.

**Solución**: Verifica que estés usando `BrowserRouter` con el `basename`:

```typescript
// src/App.tsx
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter basename="/new-evolushon-web">
      {/* ... tus rutas */}
    </BrowserRouter>
  );
}
```

### ❌ Los assets (imágenes, CSS) no cargan

**Causa**: Las rutas de los assets son absolutas en lugar de relativas.

**Solución**:

- Usa rutas relativas: `./image.jpg` en lugar de `/image.jpg`
- O importa los assets: `import logo from './assets/logo.png'`

## 🎯 Verificación Rápida

Antes de cada despliegue, verifica:

```bash
# 1. Compilar localmente
npm run build

# 2. Previsualizar la build
npm run preview

# 3. Verificar que todo funcione en http://localhost:4173
```

## 🔧 Despliegue Manual (Opcional)

Si prefieres desplegar manualmente sin GitHub Actions:

```bash
# 1. Construir el proyecto
npm run build

# 2. Instalar gh-pages
npm install --save-dev gh-pages

# 3. Agregar script en package.json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# 4. Desplegar
npm run deploy
```

## 📚 Recursos Adicionales

- [Documentación de Vite sobre despliegue](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/es/pages)
- [GitHub Actions Documentation](https://docs.github.com/es/actions)

## 💡 Tips de Performance

1. **Optimiza las imágenes**: Usa formatos modernos (WebP, AVIF)
2. **Code Splitting**: React Router ya lo hace automáticamente
3. **Lazy Loading**: Usa `React.lazy()` para componentes grandes
4. **Analiza el bundle**:
   ```bash
   npm run build -- --mode production
   ```

## 🎉 ¡Listo!

Tu sitio ahora se despliega automáticamente en GitHub Pages. Cualquier cambio que hagas en la rama `main` se reflejará en tu sitio en pocos minutos.

**URL del sitio**: https://p4ranoic0.github.io/new-evolushon-web/

---

¿Problemas? Abre un issue en el repositorio o contacta al equipo de desarrollo.
