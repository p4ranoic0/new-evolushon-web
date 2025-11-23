# 🌊 Guía de Estilo Evolushon Surf

## Paleta de Colores

### Colores Principales (basados en el logo)

#### Brand - Azul Océano

- `brand` / `#00A8E8` - Azul brillante principal
- `brand-dark` / `#0077B6` - Azul más oscuro
- `brand-light` / `#48CAE4` - Azul cielo

#### Ocean - Tonos de Océano

- `ocean-50` a `ocean-900` - Escala completa de azules
- Uso: Fondos, textos, bordes

#### Sand - Tonos de Arena

- `sand-50` a `sand-900` - Escala de naranjas/amarillos cálidos
- Uso: Acentos cálidos, highlights

#### Sunset - Naranja Coral

- `sunset` / `#FF6B35` - Naranja vibrante
- `sunset-light` / `#FF8C61`
- `sunset-dark` / `#E85D2F`
- Uso: CTAs, elementos destacados

#### Wave - Azul Claro

- `wave` / `#00B4D8` - Azul ola
- `wave-light` / `#48CAE4`
- `wave-dark` / `#0096C7`

#### Elementos

- `foam` / `#E3F7FF` - Espuma del mar (fondos claros)
- `coral` / `#FF6B35` - Acentos coral

## Tipografía

### Fuentes

1. **Permanent Marker** (`font-surf`)

   - Uso: Títulos principales (h1, h2, h3), logo
   - Estilo: Surf, informal, enérgico
   - Ejemplo: "Evolushon Surf Experience"

2. **Roboto Slab** (`font-heading`)

   - Uso: Subtítulos, descripciones importantes
   - Estilo: Serif moderna, legible

3. **Inter** (`font-sans`)
   - Uso: Textos de cuerpo, navegación
   - Estilo: Sans-serif limpia, moderna

## Gradientes

### Gradientes de Luz

```css
bg-gradient-ocean: linear-gradient(135deg, #023E8A → #0096C7 → #48CAE4)
bg-gradient-sunset: linear-gradient(135deg, #FF6B35 → #FFA726)
bg-gradient-wave: linear-gradient(180deg, #E3F7FF → #90DDFF)
```

### Gradientes Oscuros (Dark Mode)

```css
bg-gradient-dark-ocean: linear-gradient(135deg, #021b3d → #023e8a → #0077b6);
```

## Sombras

- `shadow-soft` - Sombra suave con tinte azul
- `shadow-wave` - Sombra más pronunciada estilo ola
- `shadow-sunset` - Sombra cálida naranja
- `shadow-neon` - Efecto de brillo neón

## Animaciones

### Clases CSS Personalizadas

- `.surf-card` - Tarjeta con hover animado (levita y rota)
- `.wave-text` - Texto con efecto de onda
- `.animate-float` - Flotación suave
- `.animate-wave` - Movimiento ondulante

### Animaciones Anime.js

Usadas en:

- Hero (títulos con efecto letra por letra)
- AnimatedSection (fade-up, slide, zoom con scroll)

## Componentes Principales

### Hero

- Video de fondo con overlay gradient
- Título animado letra por letra
- CTA con gradiente sunset

### Navbar

- Fondo con blur y transparencia
- Logo con hover rotate
- Links con transiciones suaves

### Footer

- Gradientes de fondo
- Iconos con colores sunset
- Enlaces con hover interactivos

### Cards

- Bordes ocean-200/700
- Hover con transform y scale
- Sombras wave

## Dark Mode

El tema oscuro utiliza:

- Fondos: `gradient-dark-ocean`
- Textos: `ocean-100`, `ocean-200`, `wave-light`
- Acentos: `wave-light`, `sunset`
- Bordes: `ocean-700`, `ocean-800`

## Iconografía

- Lucide React para iconos generales
- Heroicons para elementos UI
- Tamaños: 16px, 18px, 24px

## Espaciado

- Secciones: `space-y-20` (80px)
- Cards grid: `gap-6` o `gap-8`
- Padding contenedor: `px-4` mobile, `max-w-6xl` desktop

## Responsive

- Mobile first approach
- Breakpoints: `md:` (768px), `lg:` (1024px)
- Grid: 1 columna mobile → 2-3 desktop

---

**Objetivo del diseño:** Transmitir la energía, libertad y conexión con el océano que representa el surf, combinando colores vibrantes del mar y atardecer con tipografías que evocan el estilo de vida surf.
