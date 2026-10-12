# Coffea — Landing Page (HTML + CSS)

Landing page estática de una sola página para la cafetería ficticia **Coffea**,
replicando el diseño de Figma *Coffea — Free Responsive Coffee Shop Website
Template (Community)*. Construida únicamente con **HTML5 semántico y CSS3**, sin
JavaScript, frameworks ni preprocesadores.

- **Diseño de referencia (Figma):** file key `eabGjMVgh5VBgB5TwnjqNC`
- **Frame:** `Websites Design` (`0:3`), 1920 × 4343 px (solo desktop)
- **PRD:** `TP4 PRD_Landing_Coffea.pdf`

## Estructura

```
.
├── index.html
├── 404.html
├── netlify.toml
├── css/
│   ├── main.css              # @layer + @import en orden
│   ├── tokens.css            # design tokens (custom properties)
│   ├── base.css              # reset, tipografía base, :focus-visible
│   ├── layout.css            # .container, franjas, títulos de sección
│   ├── utilities.css         # .visually-hidden, .skip-link, helpers
│   └── components/
│       ├── header.css
│       ├── hero.css
│       ├── categories.css
│       ├── product-card.css
│       ├── carousel.css
│       ├── promo.css
│       ├── testimonial-card.css
│       ├── newsletter.css
│       └── footer.css
└── assets/
    ├── img/                  # fotos + avatares (raster)
    └── icons/                # SVG (categorías, UI y redes)
```

## Cómo levantar en local

No requiere build. Sirve la raíz con cualquier servidor estático:

```bash
# Opción 1: Node
npx serve .

# Opción 2: Python
python -m http.server 8080
```

Luego abre <http://localhost:8080/>.

## Design tokens

Todos los colores, fuentes, radios y espaciados viven en `css/tokens.css` como
custom properties. Convención BEM (`.product-card`, `.product-card__title`,
`.product-card--featured`) y capas CSS (`tokens, base, layout, components,
utilities`) para controlar la cascada sin `!important`.

## Assets

Los assets reales se exportaron desde Figma y ya están colocados. Las fotos y
avatares son **AVIF** (export a 2x, sin fallback JPG por decisión de proyecto:
todos los navegadores objetivo soportan AVIF).

**Raster → `assets/img/`** (AVIF):

| Archivo | Tamaño (2x) | Nodo Figma |
| --- | --- | --- |
| `hero.avif` | 3840×2000 | 0:4 |
| `coffee-1..4.avif` | 668×728 | 0:54, 0:67, 0:80, 0:93 |
| `dessert-1..4.avif` | 668×728 | 0:118, 0:131, 0:144, 0:157 |
| `promo-hand.avif` | 1041×670 | 0:188 |
| `promo-beans.avif` | 1005×670 | 0:189 |
| `newsletter-beans.avif` | 3840×642 | 0:253 (+ 0:254 espejado) |
| `avatar-1..3.avif` | 112×112 | 0:196, 0:214, 0:228 |

**SVG → `assets/icons/`**: `cat-hot`, `cat-cold`, `cat-cup`, `cat-dessert`
(0:16, 0:20, 0:24, 0:28); `search` (0:45); `heart` + `heart-filled` (0:55);
`arrow-left` + `arrow-right` (0:104/109); `star` (0:200); `mail` (0:247);
`social-x` (0:286), `social-instagram` (0:282), `social-facebook` (0:295),
`social-linkedin` (0:293).

> **Pendientes de exportar:** `chevron.svg` (doble chevron del CTA, 0:184) y
> `favicon.svg` no venían en la exportación, así que por ahora son placeholders.

## Interacciones (sin JavaScript)

- **Carrusel:** `overflow-x: auto` + `scroll-snap-type: x mandatory`, flechas como
  anclas a las cards con `scroll-behavior: smooth`.
- **Menú mobile:** toggle CSS-only (checkbox oculto + label) — equivalente al
  `<details>/<summary>` del PRD, elegido por robustez en todos los breakpoints.
- **Favorito (corazón):** `input[type=checkbox]` + `label` con `:checked`.
- **Newsletter:** validación nativa con `type="email" required` + `:user-invalid`.
- **`prefers-reduced-motion`:** desactiva transiciones y scroll suave.

## Responsive

Mobile-first con breakpoints en `base` (360+), `md` (768), `lg` (1024) y `xl`
(1440, diseño original). Sin scroll horizontal entre 360 y 1920 px.

## Deploy (Netlify)

`netlify.toml` publica la raíz (`publish = "."`) sin build command, con headers
de seguridad y caché `immutable` para `css/` y `assets/`. Conectar el repositorio
a Netlify para deploy continuo desde `main` y Deploy Previews por PR.

## Notas de implementación / decisiones

- Contenido en **inglés** (`lang="en"`); typos del diseño corregidos
  ("Explore Out" → "Explore Our Products", marca consistente "Coffea", etc.).
- Copy de productos/testimonios del diseño es **placeholder** ("Lungo coffee",
  "Rs. 200", lorem ipsum).
- `--color-star` es un valor por defecto; ajustar al color del SVG `star` (0:200).
