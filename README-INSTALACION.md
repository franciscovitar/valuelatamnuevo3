# Líneas de fondo estilo TRIONN — Value Latam

Este paquete está preparado específicamente para:

- Repositorio: `franciscovitar/valuelatamnuevo3`
- Branch base: `hero-word-cloud-clean-separation`

## Qué modifica

- Activa la capa de líneas en `app/page.jsx`.
- Reemplaza el SVG de fondo por tres rutas independientes.
- Agrega una cabeza luminosa por línea.
- Agrega descargas eléctricas en las convergencias y dos descargas puente.
- Vincula el recorrido al scroll real de las secciones existentes.
- Mantiene la capa fija al viewport y detrás del contenido.
- Incluye perfiles desktop, tablet y mobile.
- Respeta `prefers-reduced-motion`.

## Archivos reemplazados

- `app/page.jsx`
- `components/value-latam/BackgroundCanvas.jsx`
- `lib/scroll/home/backgroundLines.js`
- `app/styles/8-theme/_background-lines.scss`

## Instalación en PowerShell

1. Descargá y descomprimí este ZIP.
2. Copiá las carpetas `app`, `components` y `lib` sobre la raíz de tu repositorio, aceptando reemplazar los cuatro archivos.
3. Desde la raíz del repositorio ejecutá:

```powershell
git switch hero-word-cloud-clean-separation
git pull origin hero-word-cloud-clean-separation
npm install
npm run lint
npm run build
git status
git add app/page.jsx components/value-latam/BackgroundCanvas.jsx lib/scroll/home/backgroundLines.js app/styles/8-theme/_background-lines.scss
git commit -m "feat: add scroll-driven background lines"
git push origin hero-word-cloud-clean-separation
```

## Instalación extrayendo directamente sobre el repositorio

Si el ZIP está en Descargas y tu terminal ya está ubicada en la raíz del repositorio:

```powershell
Expand-Archive "$HOME\Downloads\value-latam-trionn-lines.zip" -DestinationPath . -Force
npm run lint
npm run build
git add app/page.jsx components/value-latam/BackgroundCanvas.jsx lib/scroll/home/backgroundLines.js app/styles/8-theme/_background-lines.scss
git commit -m "feat: add scroll-driven background lines"
git push origin hero-word-cloud-clean-separation
```

`README-INSTALACION.md` también se extrae en la raíz, pero no hace falta subirlo. Podés borrarlo antes de `git add` o dejarlo sin trackear.

## Volver atrás rápidamente

Antes de copiar los archivos podés crear una rama de respaldo:

```powershell
git branch backup/hero-before-trionn-lines
```

Para desactivar el efecto sin eliminar el código, cambiá en `app/page.jsx`:

```js
const SHOW_BACKGROUND_LINES = true;
```

por:

```js
const SHOW_BACKGROUND_LINES = false;
```

## Ajustes rápidos

Los colores, grosores y opacidades están en:

`app/styles/8-theme/_background-lines.scss`

Las posiciones de los puntos de convergencia están en:

`lib/scroll/home/backgroundLines.js`

Constantes principales:

- `DESKTOP_NODES`
- `TABLET_NODES`
- `MOBILE_NODES`

Cada coordenada está normalizada entre `0` y `1` respecto del viewport.
