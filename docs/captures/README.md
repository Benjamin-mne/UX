# Capturas y comparativas

Evidencia visual del sitio implementado y del Figma de referencia. Generadas el **3/11/2026** con Playwright 1.50 sobre Microsoft Edge headless, servidor `serve@14` y viewport exacto. Las capturas de página completa se guardaron en WebP para reducir peso; las comparativas y el moodboard en JPG.

## Sitio implementado

| Archivo | Página | Ancho | Tema |
| --- | --- | ---: | --- |
| `home-375-light.webp` | Home | 375 | Light |
| `home-375-dark.webp` | Home | 375 | Dark |
| `home-768-light.webp` | Home | 768 | Light |
| `home-768-dark.webp` | Home | 768 | Dark |
| `home-1440-light.webp` | Home | 1440 | Light |
| `home-1440-dark.webp` | Home | 1440 | Dark |
| `caso-375-light.webp` | Caso Miel | 375 | Light |
| `caso-375-dark.webp` | Caso Miel | 375 | Dark |
| `caso-768-light.webp` | Caso Miel | 768 | Light |
| `caso-768-dark.webp` | Caso Miel | 768 | Dark |
| `caso-1440-light.webp` | Caso Miel | 1440 | Light |
| `caso-1440-dark.webp` | Caso Miel | 1440 | Dark |
| `404-375-light.webp` | 404 | 375 | Light |
| `404-1440-light.webp` | 404 | 1440 | Light |

`capture-metrics.json` registra ancho, alto, viewport, overflow horizontal, tema aplicado, título y cantidad de `h1` por captura. En las 14 capturas: **un solo `h1`**, **sin overflow horizontal** y **sin imágenes pendientes**.

## Figma de referencia

| Archivo | Frame | Tamaño original |
| --- | --- | ---: |
| `figma/figma-home-desktop-light.png` | Home Desktop Light | 1440 × 6554 |
| `figma/figma-home-mobile-light.png` | Home Mobile Light | 390 × 10598 |
| `figma/figma-caso-desktop-light.png` | Caso Desktop | 1440 × 7229 |

## Comparativas

- `comparativas/comparativa-home-desktop.jpg`: Figma vs. sitio a 1440.
- `comparativas/comparativa-home-mobile.jpg`: Figma 390 vs. sitio 375.
- `comparativas/comparativa-caso-desktop.jpg`: Figma vs. sitio a 1440.

Las columnas se escalan al mismo ancho; no se recorta el contenido. La diferencia de alto entre Figma y sitio es esperable porque la implementación agrega estados y contenido real.

## Moodboard

`moodboard.jpg` resume concepto, palabras guía, tipografía, paleta, contraste y dos capturas del sitio. Palabras guía: **preciso, cálido, directo**.

## Método

1. Servir el proyecto en `http://localhost:4173`.
2. Abrir cada página con Playwright y emular `prefers-color-scheme` y `localStorage.theme`.
3. Forzar `.reveal` visible y desactivar transiciones para que la captura full-page sea determinista.
4. Recorrer la página para disparar imágenes lazy, esperar fuentes y volver al inicio.
5. Capturar a 375 × 812, 768 × 1024 y 1440 × 900.
6. Convertir a WebP con `sharp` calidad 82.
7. Exportar los frames de Figma vía MCP y componer las comparativas con `sharp`.

**Pendiente:** revisión visual manual de encuadres y detalles en navegador. Las capturas verifican layout y overflow de forma automatizada, no reemplazan una inspección de diseño píxel por píxel.
