# Value Latam

Sitio de consultoría financiera. Next.js 16 (App Router, Turbopack), React 19,
JavaScript sin TypeScript, Sass, y animaciones con GSAP + ScrollTrigger + Lenis.

## Instalar

```bash
npm install
```

## Ejecutar

```bash
npm run dev      # desarrollo
npm run build    # build de produccion
npm run start    # produccion local, requiere build previo
```

En Windows, si hay un `dev` corriendo, `build` falla por archivos bloqueados en
`.next`. `next.config.mjs` puede leer `VL_DIST_DIR` para compilar a otro
directorio de forma temporal.

## Validar

```bash
npm run lint     # eslint, --max-warnings=0
npm run check    # lint + build
```

No hay tests automatizados ni type checking; `check` es toda la validación
disponible por comando. Un cambio visual o de animación además necesita
verificación en navegador — ver la sección "Verificar un cambio" de
[CLAUDE.md](CLAUDE.md).

## Documentación

- [CLAUDE.md](CLAUDE.md) — mapa del proyecto, sistema de color, motion, reglas
  operativas para agentes de IA.
- [docs/refactor-maintainability-report.md](docs/refactor-maintainability-report.md)
  — auditoría de mantenibilidad, historial de decisiones y deuda técnica
  registrada.
