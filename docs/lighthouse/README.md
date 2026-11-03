# Lighthouse

Mediciones locales del **3/11/2026** con **Lighthouse 12.8.2**, Microsoft Edge headless y `serve@14` sobre `http://localhost:4173`. Los reportes se regeneraron después de los últimos ajustes de imágenes, tinte y textura.

| Página | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `index.html` (mobile) | 97 | 100 | 100 | 100 |
| `caso-estudio.html` (mobile) | 100 | 100 | 100 | 100 |
| `index.html` (desktop) | 85 | 100 | 100 | 100 |

Métricas mobile de `index.html`:

- FCP: 0.8 s
- LCP: 2.6 s
- TBT: 10 ms
- CLS: 0
- Speed Index: 0.8 s

Métricas mobile de `caso-estudio.html`:

- FCP: 0.9 s
- LCP: 1.7 s
- TBT: 0 ms
- CLS: 0
- Speed Index: 0.9 s

Reportes HTML y JSON:

- `index-mobile.html` / `index-mobile.json`
- `caso-estudio-mobile.html` / `caso-estudio-mobile.json`
- `index-desktop.html` / `index-desktop.json`

Comando usado:

```bash
CHROME_PATH="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
npx --yes lighthouse@12.8.2 http://localhost:4173/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --screenEmulation.width=375 \
  --screenEmulation.height=812 \
  --screenEmulation.deviceScaleFactor=1 \
  --throttling-method=simulate \
  --output=html --output=json \
  --output-path=docs/lighthouse/index-mobile \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --quiet
```

Para el caso mobile se repite el comando con `http://localhost:4173/caso-estudio.html` y `--output-path=docs/lighthouse/caso-estudio-mobile`. Para desktop se usa `--form-factor=desktop`, `--screenEmulation.mobile=false`, `--screenEmulation.width=1440` y `--screenEmulation.height=900`.

**Alcance:** son mediciones locales, no una garantía de producción. Deben repetirse sobre la URL final de Vercel. La performance desktop no se fuerza a un número: se reporta el valor medido.
