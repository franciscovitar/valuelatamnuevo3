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

`motion` (^12.42.2) **sí sigue en uso**: `runtime/microInteractions.js` la
importa de forma independiente. No se toca. (`CityVideo.jsx`, la otra
consumidora citada originalmente, se eliminó en la pasada de seguridad — ver
sección 7 — pero `microInteractions.js` sostiene la dependencia por sí sola.)

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
npm run check    # lint + build
```

No hay tests ni type checking: el proyecto es JavaScript sin TypeScript.

Para compilar sin pisar el `.next` de un `dev` en curso (Windows bloquea los
archivos), `next.config.mjs` puede leer `VL_DIST_DIR` de forma temporal.

---

## 7. Pasada de seguridad y arquitectura (post-refactor)

Segunda pasada, quirúrgica: no repite el refactor de la sección 1-6, corrige
inconsistencias puntuales y deja una red de seguridad mínima. Línea base:
commit `2997bc6`.

### 7.1 Bug real: paleta JS leía variables inexistentes

`lib/scroll/home/palette.js` leía `--p-gold`, `--p-gold-bright`,
`--p-gold-rgb`, `--p-gold-bright-rgb` — nombres de **antes** de que la escala
se renombrara a `--p-accent-*` durante la conversión a paleta monocroma (ver
sección 5). Como esas variables ya no existen, `getPropertyValue` devolvía
string vacío y cada lectura caía siempre al `FALLBACK` hardcodeado, que
además era el dorado cálido de la identidad previa (`#ccb487`), no el acento
monocromo actual (`#f4f4f1`).

Impacto real medido: dos `boxShadow` de resplandor (`glowGoldSoft`, en el
pullquote de "Por qué Value Latam" y el CTA de referenciadores) renderizaban
el color viejo. Ambos se aplican `onEnter`/`scrub` de ScrollTrigger, así que
no aparecían en una captura estática sin scroll — el arnés de paridad no
podía verlos por diseño (ver 7.4). Corregido: `palette.js` ahora lee
`--p-accent*` y su `FALLBACK` está sincronizado con la escala actual.

`lib/motion/textEffects.js` tenía el mismo patrón en sus fallbacks locales
(`MUTED`/`ACTIVE`/`GOLD`), pero esos SÍ resuelven la variable CSS correcta —
solo el literal de reserva estaba desactualizado. Cambio de fallback puro,
cero impacto (esa rama es inalcanzable en render normal: las funciones se
invocan siempre en cliente).

### 7.2 Deuda registrada, no corregida: `MOTION_GLOW`

`lib/motion/tokens.js` → `MOTION_GLOW.primaryHover` tiene un dorado cálido
hardcodeado (`rgba(191, 160, 90)`) que tampoco deriva de la paleta y es
residuo de la misma identidad previa. A diferencia de 7.1, **no se corrige**:
es el hover de todo botón `.btn-primary` del sitio, un estado que la paridad
exige preservar exactamente, y ese entorno no puede ejercitar estados de
hover para verificarlo visualmente. Derivarlo de `--p-accent` es un cambio de
diseño real (dorado → casi blanco), no una corrección de bug. Queda
documentado en el propio archivo.

### 7.3 Cuatro heroes legacy eliminados

Una segunda pasada de alcanzabilidad (Fase 12 del prompt de esta sesión)
encontró un caso que la de la sección 1 no había cubierto: componentes
exportados desde el barrel `components/value-latam/index.js` pero sin
consumidor real en ninguna página, algunos ni siquiera comentados.

| Componente | Estado previo | Causa |
|---|---|---|
| `Intro.jsx` | cero referencias, ni comentadas | export de barrel nunca importado — la alcanzabilidad de la sección 1 no verificaba consumo real de cada export |
| `CoverStory.jsx` | comentado "retained for rollback" | hero anterior a `VideoHero` |
| `ImageHero.jsx` | comentado "retained for rollback"; su `@use` de SCSS ya estaba comentado (0% compilado) | hero intermedio, nunca terminó de activarse |
| `CityVideo.jsx` | comentado; dependía de `/portada.mp4`, ya eliminado por el usuario | sección descartada |

Eliminado por componente, con su infraestructura exclusiva confirmada por
alcanzabilidad (cero consumidores fuera del propio grupo):

- **Intro**: componente + `app/styles/6-sections/_hero.scss` (exclusivo al
  100%, verificado selector por selector) + `data/valueLatamContent.js` →
  `introHome` (sin otro consumidor).
- **CoverStory**: componente + `runtime/coverAnimation.js` +
  `runtime/heroKeyframes.js` (ambos exclusivos) + `public/hero-smoke.png` +
  bloque `.hero-title`/`.ht-inner` de `_cover-presentation.scss` (ya marcado
  `// Legacy hero-title (Intro sin uso) — conservado` por una sesión previa;
  ahora confirmado y eliminado).
- **ImageHero**: componente + `runtime/imageHeroAnimation.js` (exclusivo) +
  `app/styles/8-theme/_image-hero.scss` + `public/hero-city-{mobile,desktop}.webp`.
- **CityVideo**: componente + `app/styles/6-sections/_city-video.scss`
  (exclusivo al 100%).

`lib/motion/tokens.js` → `EXCLUDED_ANCESTORS` (consumido por
`isMotionExcluded`, activo en `microInteractions.js`) tenía seis selectores
— `.cover`, `.cover-scroll`, `.cover-sticky`, `.cover-brain`, `.hero-title`,
`.cover-caption` — todos exclusivos de CoverStory/Intro. Verificado que
ninguno coincidía con nada más del árbol activo antes de vaciar la lista; el
mecanismo (`isMotionExcluded`) se conserva.

**No se tocó**: el CSS de `.cover-hero*` sigue disperso en 8 archivos de
`app/styles/` (además del bloque ya limpiado), mezclado con selectores
activos en 6 de ellos. Purgarlo exige revisar cada archivo línea por línea
para no arrastrar una regla activa — well fuera del alcance de una pasada
quirúrgica. Queda selector muerto pero inerte (no puede coincidir con ningún
elemento del DOM real). Candidato a una migración chica y dedicada, con
comparación visual antes/después, igual que H4.

### 7.4 Corrección de método: el arnés de paridad puede dar falsos positivos en sesiones largas

Al comparar contra la línea base capturada más temprano en esta misma sesión
aparecieron ~1.171 diferencias — no reproducibles. Aislado por comparación
A/B inmediata (`git stash` → capturar → `git stash pop` → capturar → comparar
campo por campo, sin intervalo), que dio **cero diferencias reales** en las
mismas rutas: el `dev server` llevaba corriendo largo tiempo dentro de la
sesión y algo (Fast Refresh acumulado, estado de sesión del tab) hizo derivar
la comparación contra una línea base vieja.

**Regla de método añadida**: para sesiones largas, la comparación confiable
es A/B inmediata vía `git stash`, no contra una línea base capturada minutos
u horas antes en la misma sesión de navegador. La línea base de la sección 4
sigue siendo válida como snapshot de referencia entre sesiones distintas;
dentro de una sesión larga, preferir A/B inmediata.

### 7.5 Documentación

`README.md` describía una migración de un prototipo HTML
(`value-latam-cinematic-prototype.html`) y un `components/ValueLatamClient.jsx`
que ya no existe (eliminado en la oleada 2 de la sección 3). Reescrito:
instalar / ejecutar / validar / dónde está cada documento — sin duplicar
`CLAUDE.md`.

Eliminados `README-INSTALACION.md` y `ARCHIVOS-MODIFICADOS.txt`: instrucciones
de instalación de un ZIP de un solo uso (la funcionalidad de líneas de fondo
de la sección 7 de commits previos), ya aplicadas e integradas. El propio
archivo indicaba que no hacía falta subirlo.

### 7.6 Suite E2E mínima y dos bugs reales que encontró

`@playwright/test` como dependencia de desarrollo únicamente, config mínima
(`playwright.config.js`), 5 archivos en `e2e/`: home, navegación
desktop/mobile, formulario de contacto (mockeado, sin pegar a Resend), rutas
internas, accesibilidad básica + `prefers-reduced-motion`. 54 tests, 49
corren, 5 se saltan a propósito (flujos de teclado/dropdown de escritorio
contra el proyecto emulado táctil — cobertura duplicada, no hueco real).
`npm run test:e2e`; integrado a `npm run check`.

Esta suite corre en un Chromium real, que sí compone frames — a diferencia
del panel de navegador de este entorno (sección 4). Eso le permitió encontrar
dos bugs genuinos que ninguna verificación anterior de este proyecto pudo ver
nunca, en ninguna sesión:

**Bug 1 — recursión infinita en `lib/scroll/lenis.js`.** El listener de
scroll hacía `window.dispatchEvent(new Event('scroll'))` para avisarle a
`lib/scroll/ambientField.js` de cada tick. Pero Lenis también escucha scroll
nativo para detectar input del usuario, así que ese evento sintético volvía a
entrar a Lenis, que volvía a emitir `'scroll'`, que volvía a despachar el
evento — `RangeError: Maximum call stack size exceeded`, de forma
determinística, en cualquier página, con cualquier scroll real. Invisible en
40+ turnos de verificación previa porque el panel de navegador nunca corre
`requestAnimationFrame` ni dispara scroll de verdad. Encontrado por
`home.spec.js` al revisar `pageerror` en la carga. Corregido eliminando esa
única línea; `ambientField.js` no necesitó cambios (ya recibe eventos nativos
genuinos, porque Lenis mueve el scroll real del documento).

**Bug 2 — el foco nunca se movía al primer campo inválido.**
`runtime/leadCapture.js` marca campos inválidos con
`field.toggleAttribute('aria-invalid', true)` — un atributo booleano, queda
`aria-invalid=""`. Pero la línea que mueve el foco buscaba
`form.querySelector('[aria-invalid="true"]')`, el string literal `"true"`,
que ese atributo nunca tiene. La búsqueda no encontraba nunca nada y el foco
no se movía — ni para teclado ni para lector de pantalla, siempre, desde que
se escribió. No cambia ningún píxel (los campos sí se marcaban visualmente
via `.field-error`), así que tampoco lo hubiera visto el arnés de paridad.
Encontrado por `contact-form.spec.js` al aserir `toBeFocused()`. Corregido
cambiando el selector a `[aria-invalid]` (presencia, no valor).

Ambos verificados sin impacto visual con A/B inmediata (7.4) antes y después
de cada fix.

### 7.7 Deuda arquitectónica conservada a propósito

- **Header y Contact dependen de DOM imperativo**
  (`runtime/navigationCards.js`, `runtime/leadCapture.js`) en vez de estado de
  React. Funcionan, la interacción real depende de ellos, y ahora hay
  cobertura E2E (7.6). No se migran en esta pasada: el beneficio de mover a
  React no justifica el riesgo sobre código estable. Migrar solo si aparece
  una necesidad funcional concreta, y con la suite E2E como red antes de
  tocarlos.
- **`10-trumps/`** sigue sin tocarse (H4). Ver CLAUDE.md, regla explícita
  contra parchear ahí por un problema local.
- **`.cover-hero*` disperso en 8 archivos de `app/styles/`** (7.3): selector
  muerto (no matchea nada, `CoverStory` ya no existe) pero mezclado con reglas
  activas en 6 de esos archivos. Purgarlo exige revisión línea por línea;
  fuera de alcance de una pasada quirúrgica.
- **5 vulnerabilidades `high` de `npm audit`**, todas preexistentes:
  `brace-expansion`/`js-yaml` (transitivas de `eslint`), `postcss`/`sharp`
  (empaquetadas dentro de `next`, no dependencias directas del proyecto). Se
  comprobó que ninguna la introdujo esta pasada — ya estaban antes de instalar
  Playwright. `npm audit fix` implicaría subir la versión mayor de `next`,
  fuera de alcance ("no cambiar versiones mayores durante esta
  refactorización"). Pendiente de una decisión explícita del equipo, no de un
  fix automático.

### 7.8 Verificación

Lint, build y `test:e2e` limpios tras cada cambio. Paridad verificada con A/B
inmediata (7.4) en las 7 rutas, viewport 1440×900 completo y 390×844 con
verificación adicional sobre el único resultado dudoso (4 diferencias en
`/financiamiento`, rastreadas a `SCRIPT`/`NEXTJS-PORTAL` — el overlay de
Next.js en modo desarrollo, no contenido del sitio).
