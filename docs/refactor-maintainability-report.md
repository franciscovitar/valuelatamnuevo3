# Auditoría de mantenibilidad — Value Latam

Diagnóstico con evidencia y plan incremental. Condición superior: **la web no
debe cambiar visual ni funcionalmente**.

Línea base: commit `b942a2c`, rama `hero-word-cloud-clean-separation`.

---

## 1. Estado inicial

| | |
|---|---|
| Stack | Next.js 16.2.10 (App Router, Turbopack), React 19.2.4, JavaScript |
| Estilos | Sass, estructura 7-1 con capas ITCSS |
| Motion | GSAP + ScrollTrigger + Lenis |
| Código | 121 archivos JS/JSX (16.512 líneas), 83 SCSS (11.851 líneas) |
| Scripts | `dev`, `build`, `start`, `lint` |
| Tests | ninguno |
| Lint / build | ambos limpios antes de empezar |

### Lo que ya está bien

No conviene tocarlo:

- **Dirección de capas correcta.** `lib/` no importa nada de `components/`.
  Verificado por grep: cero violaciones.
- **Configuración de sitio centralizada.** `data/siteConfig.js` es fuente única
  de contacto, URLs y datos regulatorios, y se consume por import en todos
  lados.
- **Paleta de color centralizada.** `app/styles/1-settings/_palette.scss` es la
  única fuente de literales de color. Ver sección 5.
- **Limpieza de animaciones.** Los módulos de scroll registran cleanups
  (rAF, ScrollTrigger, ResizeObserver, ticker de GSAP) de forma consistente.

---

## 2. Hallazgos

### H1 — Código muerto: 2.726 líneas, 19 archivos

**Riesgo de eliminar: bajo. Prioridad: alta.**

Alcanzabilidad calculada desde los puntos de entrada de Next
(`app/**/{page,layout,route,sitemap,robots}`) siguiendo imports estáticos.

Evidencia adicional: **el proyecto no tiene ningún import dinámico**
(`import()`, `next/dynamic`, `require()`), así que el grafo estático es
completo. Ningún archivo se rescata en runtime.

Dos grupos:

**a) Sistema de motion basado en la librería `motion`** — reemplazado por GSAP:

```
components/motion/Reveal{Card,Fade,Stagger,Text,X,Y}.jsx   174
components/motion/index.js                                   6
lib/motion/{variants,hooks,useHomeMotion,homeSections}.js   551
lib/motion/index.js                                          5
components/ValueLatamClient.jsx                              1
```

**b) Runtimes de Three.js** — reemplazados por implementaciones SVG:

```
components/value-latam/runtime/heroThreeScene.js           809
components/value-latam/runtime/heroThreeGeometry.js        105
components/value-latam/runtime/background-lines/*.js       811
components/value-latam/AmbientParticleField.jsx            264
```

### H2 — `three` es una dependencia sin uso

**Riesgo: bajo. Prioridad: alta.**

`three` (^0.185.1) sólo aparece en los 4 archivos del grupo (b), todos
inalcanzables. `BackgroundCanvas.jsx` —lo que dibuja las líneas de fondo hoy—
es SVG puro y no importa Three.

`motion` (^12.42.2) **sí sigue en uso**: `CityVideo.jsx` y
`runtime/microInteractions.js` la importan y son alcanzables. No se toca.

### H3 — Dos archivos concentran demasiada responsabilidad

**Riesgo: medio. Prioridad: media.**

- `lib/scroll/home/backgroundLines.js` (1.457 líneas): geometría de la ruta,
  proyección, deformación, controlador de destellos, anclas de scroll y ciclo
  de render, todo junto.
- `components/value-latam/runtime/videoHeroAnimation.js` (588 líneas):
  proyección de la nube, revelado del logo, salida y montaje del ScrollTrigger.

Ambos funcionan y están comentados. Dividirlos es deseable pero toca las dos
animaciones más complejas del sitio, que son también las más difíciles de
verificar en este entorno (ver sección 4).

### H4 — La capa `10-trumps` resuelve con `!important`

**Riesgo: alto. Prioridad: baja — registrado, no se aborda.**

`_visual-direction-pass.scss` (905 líneas) reescribe estilos de secciones
enteras con `!important`. Es deuda real, pero desarmarla toca prácticamente
todo el CSS visible y no puede verificarse con la confianza necesaria sin
comparación de píxeles.

---

## 3. Plan por oleadas

| # | Oleada | Riesgo | Estado |
|---|---|---|---|
| 1 | Línea base verificable | — | hecha |
| 2 | Eliminar código muerto (H1) y `three` (H2) | bajo | hecha — `e258bc8` |
| 3 | Componentes repetidos reales | bajo | hecha — `a8b6bd2` |
| 4 | `CLAUDE.md` y documentación | bajo | hecha |

Descartado por riesgo desproporcionado frente al beneficio: H3 y H4.

Las oleadas originalmente planeadas para *fuentes de verdad* se cancelaron: la
paleta y `siteConfig` ya estaban centralizadas.

### Resultado

| | Antes | Después |
|---|---|---|
| Archivos JS/JSX | 121 | 102 |
| Líneas JS/JSX | 16.512 | 13.799 |
| Archivos inalcanzables | 19 (2.726 líneas) | 0 |
| Dependencias de producción | 10 | 9 |
| Duplicados de `sec-head` | 5 | 0 |

Re-ejecutado el análisis de alcanzabilidad al cerrar: **102 de 102 archivos
alcanzables, cero código muerto restante.**

Paridad en las tres oleadas: **8.478 elementos comparados en 7 rutas × 4
viewports, cero diferencias.**

---

## 4. Estrategia de paridad

### Arnés

Huella por elemento de las 7 rutas en 4 viewports (1440×900, 1280×800,
768×1024, 390×844): caja delimitadora redondeada más 35 propiedades
computadas (color, fondo, borde, radio, sombra, tipografía, opacidad,
transform, z-index, display, position, márgenes, padding, filtro).

Se hashea cada elemento y se guarda en `localStorage` bajo `vl_baseline`.
Tras cada oleada se recaptura y se comparan las huellas; sólo se inspeccionan
en detalle los elementos que difieren.

**Cobertura: 8.478 elementos** en 28 combinaciones de ruta y viewport.

### Determinismo verificado

Dos capturas consecutivas sin cambios deben ser idénticas. La primera
validación dio diferencias; la causa se rastreó a `.vl-tx-char`, cuyos offsets
iniciales los genera `gsap.utils.random()` en `initCharConverge`. Son
aleatorios por diseño, así que esos elementos se excluyen (48 en total). Su
estado *final* sí es determinista.

Tras excluirlos, dos capturas consecutivas dan cero diferencias.

**Regla de uso:** una diferencia menor a 5 elementos se re-verifica antes de
darla por real; se observó un flake intermitente. Nunca confiar en el número
sin mirar qué elementos cambiaron.

### Límite conocido del entorno

El panel de navegador de la herramienta **no compone frames**: medido, 0
frames de `requestAnimationFrame` en 500 ms, `visibilityState: hidden`.

Consecuencia: **las animaciones no pueden ejercitarse**. El arnés verifica
estados estáticos y de layout, no movimiento. Todo cambio que toque una
secuencia animada necesita verificación humana en un navegador real.

### Riesgo que ninguna validación automática cubre

Renombrar una variable CSS **no rompe el build**: las custom properties se
resuelven en runtime. Ya ocurrió una vez en este proyecto — una versión de
`_palette.scss` definía `--p-gold-*` mientras 31 archivos consumían
`--p-accent-*`; compilaba limpio y los colores se habrían roto en el navegador.

Cualquier renombrado de variables CSS exige verificación en navegador.

---

## 5. Sistema de color

`app/styles/1-settings/_palette.scss` es la fuente única. Cuatro bloques:

1. **Escala cruda** — los únicos literales del proyecto.
2. **Roles** — nombrados por función (`--role-text-primary`), no por color.
3. **Capa semántica `--vl-*`** — la que consumen los componentes.
4. **Alias heredados** — nombres viejos conservados para no reescribir cientos
   de reglas.

Cada color base publica también su terna RGB (`--p-cream-rgb: 244 244 241`)
porque la web usa ~680 colores con transparencia, y un hex no sirve para eso.
Si se cambia el hex hay que cambiar la terna: son el mismo color.

Historial relevante: las variables `--vl-*` vivían duplicadas en dos bloques
`:root` de `_visual-direction-pass.scss` con valores distintos; el segundo
pisaba al primero, así que editar el primero no tenía efecto.

---

## 6. Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de produccion
npm run lint     # eslint, --max-warnings=0
```

No hay tests ni type checking: el proyecto es JavaScript sin TypeScript.

Para compilar sin pisar el `.next` de un `dev` en curso (Windows bloquea los
archivos), `next.config.mjs` puede leer `VL_DIST_DIR` de forma temporal.
