# Value Latam

Sitio web de Value Latam desarrollado con Next.js 16 (App Router, Turbopack), React 19, JavaScript, Sass y animaciones con GSAP + ScrollTrigger + Lenis.

## Instalar

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Inicia el entorno de desarrollo.

Para generar y ejecutar el build de producción:

```bash
npm run build
npm run start
```

> En Windows, si hay un servidor de desarrollo activo, `build` puede fallar por archivos bloqueados dentro de `.next`. `next.config.mjs` permite utilizar `VL_DIST_DIR` para compilar temporalmente en otro directorio.

---

## Validar

```bash
npm run lint
```

Ejecuta ESLint con `--max-warnings=0`.

```bash
npm run test:e2e
```

Ejecuta la suite E2E de Playwright.

```bash
npm run check
```

Ejecuta la validación principal del proyecto:

```text
lint
+
tests E2E
+
build de producción
```

`npm run check` debe ejecutarse después de cambios relevantes antes de considerar una tarea terminada.

---

## Tests

El proyecto cuenta con una suite E2E mínima basada en Playwright.

La suite protege principalmente:

* Carga de la home.
* Navegación desktop.
* Navegación mobile.
* Dropdown de Soluciones.
* Formulario de contacto.
* Validaciones del formulario.
* Estados de éxito y error del formulario.
* Páginas internas principales.
* Accesibilidad funcional básica.
* `prefers-reduced-motion`.

Los tests del formulario interceptan `/api/contact`, por lo que no envían emails reales mediante Resend.

Los tests E2E funcionan como red de seguridad funcional, pero no reemplazan la verificación visual cuando un cambio afecta diseño, responsive o animaciones.

---

## Stack

* Next.js 16.
* React 19.
* JavaScript.
* Sass.
* GSAP.
* ScrollTrigger.
* Lenis.
* Resend.
* Playwright.
* ESLint.

El proyecto utiliza JavaScript, no TypeScript, por lo que actualmente no existe un paso independiente de type checking.

---

## Estructura principal

```text
app/
  page.jsx
  <ruta>/page.jsx
  api/
  styles/

components/
  value-latam/
  scroll/

data/

lib/
  motion/
  scroll/
    home/
    internal/

docs/

e2e/
```

### `app/`

Rutas, layouts, API y estilos globales.

### `components/value-latam/`

Componentes y secciones visuales de Value Latam.

### `components/scroll/`

Providers y runtimes relacionados con scroll, transiciones y comportamiento global.

### `data/`

Contenido y configuración centralizada del sitio.

### `lib/motion/`

Lenguaje compartido de movimiento:

* Tokens.
* Easings.
* Duraciones.
* Efectos reutilizables.

### `lib/scroll/`

Animaciones y comportamiento asociado al scroll.

Las secuencias específicas se mantienen separadas por página o sección.

### `e2e/`

Suite de pruebas Playwright.

---

## Documentación

### `CLAUDE.md`

Fuente principal de reglas operativas para trabajar sobre el proyecto.

Incluye:

* Arquitectura.
* Convenciones.
* Sistema de color.
* Sistema de motion.
* Reglas que no deben romperse.
* Cómo verificar cambios.
* Restricciones importantes para agentes de IA.

Toda sesión de Claude Code que modifique el proyecto debe leer este archivo antes de editar.

### `docs/refactor-maintainability-report.md`

Contiene:

* Auditoría de mantenibilidad.
* Historial del refactor.
* Decisiones arquitectónicas.
* Estrategia de paridad visual.
* Código legacy eliminado.
* Deuda técnica conocida.
* Bugs detectados durante las pruebas.
* Motivos por los que determinadas áreas se conservaron sin refactorizar.

---

## Reglas importantes para contribuir

Antes de realizar cambios relevantes:

1. Leer `CLAUDE.md`.
2. Entender la feature afectada.
3. Buscar sus componentes, estilos, datos y animaciones relacionadas.
4. Modificar únicamente lo necesario.
5. Ejecutar:

```bash
npm run check
```

6. Si el cambio afecta visualmente la web, verificar también el resultado en navegador.

No asumir que un `build` correcto garantiza que el diseño siga funcionando.

En particular, modificaciones de:

* CSS.
* Variables CSS.
* Layout.
* Responsive.
* Animaciones.
* Selectores.
* `className`.
* `id`.
* `data-*`.
* Estructura del DOM.

pueden generar regresiones que no son detectadas por el compilador.

---

## Fuente de verdad visual

La paleta principal está definida en:

```text
app/styles/1-settings/_palette.scss
```

Ese archivo es la fuente canónica del sistema de color.

No deben introducirse nuevos colores visuales hardcodeados fuera de ese sistema salvo excepciones técnicas explícitamente justificadas y documentadas.

---

## Fuente de verdad de contenido

Antes de duplicar información institucional, revisar:

```text
data/siteConfig.js
data/valueLatamContent.js
```

Allí se centralizan datos reutilizados como:

* Información de contacto.
* URLs.
* Navegación.
* Contenido del sitio.
* Configuraciones compartidas.

---

## Motion

El lenguaje compartido de animaciones vive principalmente en:

```text
lib/motion/
```

Las secuencias específicas relacionadas con scroll viven en:

```text
lib/scroll/home/
lib/scroll/internal/
```

No agregar nuevas librerías de animación ni un nuevo sistema de motion sin una necesidad técnica concreta.

Todo código relacionado con animaciones, listeners, observers, `requestAnimationFrame`, GSAP o ScrollTrigger debe limpiar correctamente sus recursos al desmontarse.

También debe respetarse:

```css
prefers-reduced-motion
```

---

## Deuda técnica conocida

Hay ciertas áreas que se mantienen deliberadamente sin refactorizar porque actualmente funcionan y modificarlas tendría más riesgo que beneficio:

* Parte de la navegación utiliza lógica DOM imperativa.
* El formulario de contacto utiliza lógica DOM imperativa.
* `app/styles/10-trumps/` contiene overrides e `!important` deliberados.

Estas áreas no deben refactorizarse únicamente por limpieza.

Cualquier modificación debe responder a una necesidad concreta y estar protegida por las pruebas existentes y verificación visual.

---

## Criterio general

La prioridad del proyecto es:

1. Preservar funcionalidad.
2. Preservar diseño.
3. Mantener una arquitectura clara.
4. Evitar duplicación real.
5. Reducir acoplamiento.
6. Facilitar cambios futuros.
7. Mantener el proyecto comprensible tanto para desarrolladores como para agentes de IA.

Un cambio pequeño debería requerir modificar la menor cantidad razonable de archivos sin introducir abstracciones innecesarias.
