# Value Latam

Sitio de consultoría financiera. Next.js 16 (App Router, Turbopack), React 19,
**JavaScript sin TypeScript**, Sass, y animaciones con GSAP + ScrollTrigger +
Lenis.

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de produccion
npm run lint     # eslint, --max-warnings=0
```

No hay tests ni type checking. `lint` y `build` son toda la validación
automática disponible.

En Windows, si hay un `dev` corriendo, `build` falla por archivos bloqueados en
`.next`. `next.config.mjs` puede leer `VL_DIST_DIR` para compilar a otro
directorio de forma temporal.

## Mapa

```
app/
  page.jsx              home
  <ruta>/page.jsx       paginas internas
  styles/               Sass en capas ITCSS (ver mas abajo)
  api/contact/          envio de formulario (Resend)
components/
  value-latam/          secciones y componentes de UI
    runtime/            logica imperativa de animacion por componente
  scroll/               providers: Lenis, transiciones de pagina, campo ambiental
lib/
  motion/               lenguaje de movimiento compartido (tokens, efectos de texto)
  scroll/               orquestacion por ruta
    home/               una animacion por seccion de la home
    internal/           idem para paginas internas
data/                   contenido y configuracion del sitio
docs/                   auditoria de mantenibilidad
```

Dirección de dependencias: `app` → `components` → `lib` → `data`.
**`lib/` no importa nada de `components/`.** Mantenerlo así.

## Color

`app/styles/1-settings/_palette.scss` es la **única fuente de literales de
color**. Cuatro bloques: escala cruda, roles, capa semántica `--vl-*`, y alias
heredados.

Para cambiar un color se edita la escala; todo lo demás deriva.

Cada color base publica también su terna RGB (`--p-cream-rgb: 244 244 241`)
porque la web usa ~680 colores con transparencia. **Si cambiás el hex, cambiá la
terna**: son el mismo color.

> Renombrar una variable CSS **no rompe el build** — las custom properties se
> resuelven en runtime. Ya pasó una vez: una versión definía `--p-gold-*`
> mientras 31 archivos consumían `--p-accent-*`, compilaba limpio y los colores
> se habrían roto en el navegador. Cualquier renombrado exige verificación en
> navegador.

## Estilos

Capas ITCSS en `app/styles/`, importadas en orden por `app/value-latam.scss`.
El orden importa: `10-trumps/` pisa a las anteriores y usa `!important` de forma
deliberada. Es deuda conocida (ver `docs/refactor-maintainability-report.md`).

## Motion

- `lib/motion/tokens.js` — amplitudes, duraciones, easings y los tres volúmenes
  (`lead` / `base` / `quiet`). La jerarquía viene del contraste entre ellos:
  un protagonista por sección y silencio alrededor.
- `lib/motion/textEffects.js` — reveals de texto reutilizables.
- `lib/motion/bandTransition.js` — transiciones por bandas. **Solo para cambios
  de mundo visual** (oscuro ↔ marfil). Aplicarlas a todos los cortes las
  convierte en decoración.
- `lib/scroll/home/*.js` — una secuencia por sección, local a esa sección.

Todo módulo de scroll debe registrar su cleanup (rAF, ScrollTrigger,
ResizeObserver, ticker de GSAP) y respetar `prefers-reduced-motion`.

## Reglas que no romper

- No reintroducir literales de color fuera de `_palette.scss`.
- No hacer que `lib/` importe de `components/`.
- No aplicar `initBandWipe` a cortes que no cambian de mundo visual.
- El hero (`video-hero--word-orbit`) lleva `padding: 0`: la regla global
  `section { padding: 108px 0 }` desplazaba el contenedor del sticky y la escena
  arrancaba descolgada.
- `.hero-word-scene__words` no lleva `z-index` ni `will-change`: crearían un
  stacking context que impediría a las palabras cercanas pasar delante del logo.

## Verificar un cambio

`lint` y `build` no detectan regresiones visuales. Para eso hay un arnés de
paridad descrito en `docs/refactor-maintainability-report.md`: huella caja
delimitadora más 35 propiedades computadas por elemento, en 7 rutas × 4
viewports.

Dos advertencias de método:

1. **Esperar `document.fonts.ready`** antes de medir. Sin eso se mide con
   métricas de la fuente de respaldo y aparecen ~50% de falsos positivos.
2. **El movimiento no se puede verificar automáticamente** en el panel de
   navegador de Claude Code: no compone frames, así que `requestAnimationFrame`
   no corre. Todo cambio que toque una animación necesita revisión humana.
