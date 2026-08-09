/*
 * Variante IMAGES del hero.
 *
 * Cada entrada tiene EXACTAMENTE la misma forma que un satelite de `HERO_WORDS`
 * (posicion, profundidad, deriva ambiental y ventana de convergencia) mas los
 * campos propios de una imagen. Esa igualdad no es casual: es lo que permite
 * que el runtime trate a los dos modos con el mismo codigo y que la variante de
 * imagenes herede el movimiento ya validado sin duplicar el motor.
 *
 * `src`    ruta del asset.
 * `alt`    vacio a proposito: la capa de satelites es decorativa y va dentro de
 *          un contenedor `aria-hidden`. Se deja el campo explicito para no
 *          olvidarlo si alguna imagen pasara a ser informativa.
 * `tile`   variante de tamano del recuadro: xl | lg | md | sm | xs.
 * `ratio`  proporcion del recuadro: wide (16/10), photo (4/3) o square.
 *
 * Los assets viven en `/public/hero/satellites` y estan optimizados para el
 * tamano real de los recuadros del hero.
 */
export const HERO_IMAGES = [
  {
    id: 'tile-estrategia',
    src: '/hero/satellites/estrategia.webp', alt: '', tile: 'lg', ratio: 'wide',
    x: 18, y: -14, depth: 0.06, rotation: 0.6,
    idle: { angle: 214, speed: 4.1, radius: 132, spin: 1, rotate: 0.9, scale: 0.024 },
    converge: { start: 0.03, end: 0.26, pull: 'out', curve: -34, spin: -6 },
    mobile: { x: 16, y: -30 },
  },
  {
    id: 'tile-medios-pago',
    src: '/hero/satellites/medios-pago.webp', alt: '', tile: 'md', ratio: 'photo',
    x: 20, y: 10, depth: 0.16, rotation: -0.9,
    idle: { angle: 118, speed: 3.6, radius: 118, spin: -1, rotate: -1.2, scale: 0.018 },
    converge: { start: 0.04, end: 0.30, pull: 'inOut', curve: 26, spin: 5 },
    tablet: { x: 28, y: 9 }, mobile: { x: 20, y: 28 },
  },
  {
    id: 'tile-liquidez',
    src: '/hero/satellites/liquidez.webp', alt: '', tile: 'md', ratio: 'wide',
    x: -19, y: -12, depth: 0.3, rotation: 1.2,
    idle: { angle: 8, speed: 2.9, radius: 104, spin: 1, rotate: 0.7, scale: 0.012 },
    converge: { start: 0.05, end: 0.31, pull: 'out', curve: 18, spin: 4 },
    tablet: { x: -17, y: -11 }, mobile: { x: -17, y: -31 },
  },
  {
    id: 'tile-resultados',
    src: '/hero/satellites/resultados.webp', alt: '', tile: 'sm', ratio: 'square',
    x: -9, y: 22, depth: 0.12, rotation: 1.5,
    idle: { angle: 288, speed: 3.3, radius: 96, spin: -1, rotate: 1.4, scale: 0.02 },
    converge: { start: 0.09, end: 0.29, pull: 'in', curve: -22, spin: -8 },
    tabletHidden: true, mobile: { x: -6, y: 38 },
  },
  {
    id: 'tile-financiamiento',
    src: '/hero/satellites/financiamiento.webp', alt: '', tile: 'xl', ratio: 'wide',
    x: -24, y: -24, depth: 0.1, rotation: -1.4,
    idle: { angle: 62, speed: 3.9, radius: 126, spin: 1, rotate: -1.1, scale: 0.022 },
    converge: { start: 0.15, end: 0.40, pull: 'inOut', curve: 30, spin: 6 },
    tablet: { x: -24, y: -22 }, mobile: { x: -22, y: -40 },
  },
  {
    id: 'tile-procesos-ia',
    src: '/hero/satellites/procesos-ia.webp', alt: '', tile: 'lg', ratio: 'photo',
    x: -20, y: 12, depth: 0.22, rotation: 1.1,
    idle: { angle: 156, speed: 3.1, radius: 110, spin: -1, rotate: -0.8, scale: 0.016 },
    converge: { start: 0.16, end: 0.44, pull: 'out', curve: -28, spin: -4 },
    tablet: { x: -28, y: 11 }, mobile: { x: -19, y: 29 },
  },
  {
    id: 'tile-cobros',
    src: '/hero/satellites/cobros.webp', alt: '', tile: 'md', ratio: 'wide',
    x: -32, y: 24, depth: 0.26, rotation: -1.2,
    idle: { angle: 244, speed: 2.7, radius: 92, spin: 1, rotate: 1, scale: 0.014 },
    converge: { start: 0.18, end: 0.41, pull: 'in', curve: 34, spin: 7 },
    tablet: { x: -35, y: 26 }, mobileHidden: true,
  },
  {
    id: 'tile-crecimiento',
    src: '/hero/satellites/crecimiento.webp', alt: '', tile: 'sm', ratio: 'square',
    x: 2, y: -34, depth: 0.44, rotation: -0.7,
    idle: { angle: 334, speed: 3.4, radius: 114, spin: -1, rotate: 1.2, scale: 0.015 },
    converge: { start: 0.17, end: 0.47, pull: 'inOut', curve: -16, spin: 5 },
    mobileHidden: true,
  },
  {
    id: 'tile-inversiones',
    src: '/hero/satellites/inversiones.webp', alt: '', tile: 'md', ratio: 'photo',
    x: 30, y: -26, depth: 0.34, rotation: 1.4,
    idle: { angle: 96, speed: 3.7, radius: 122, spin: 1, rotate: -1.3, scale: 0.013 },
    converge: { start: 0.27, end: 0.52, pull: 'out', curve: 22, spin: -5 },
    tablet: { x: 31, y: -25 }, mobile: { x: 23, y: -41 },
  },
  {
    id: 'tile-gestion',
    src: '/hero/satellites/gestion.webp', alt: '', tile: 'sm', ratio: 'square',
    x: 28, y: 14, depth: 0.38, rotation: -0.8,
    idle: { angle: 190, speed: 2.4, radius: 88, spin: -1, rotate: -1, scale: 0.011 },
    converge: { start: 0.29, end: 0.55, pull: 'in', curve: 26, spin: 4 },
    tablet: { x: 33, y: 23 }, mobileHidden: true,
  },
  {
    id: 'tile-automatizacion',
    src: '/hero/satellites/automatizacion.webp', alt: '', tile: 'sm', ratio: 'wide',
    x: -36, y: 16, depth: 0.5, rotation: 1.3,
    idle: { angle: 42, speed: 3, radius: 100, spin: 1, rotate: 1.1, scale: 0.017 },
    converge: { start: 0.30, end: 0.50, pull: 'inOut', curve: -30, spin: -7 },
    tablet: { x: -24, y: 33 }, mobile: { x: 25, y: 39 },
  },
  {
    id: 'tile-respaldo',
    src: '/hero/satellites/respaldo.webp', alt: '', tile: 'xs', ratio: 'square',
    x: 33, y: 30, depth: 0.58, rotation: 0.9,
    idle: { angle: 272, speed: 2.2, radius: 84, spin: -1, rotate: 0.8, scale: 0.01 },
    converge: { start: 0.36, end: 0.58, pull: 'out', curve: 14, spin: 3 },
    mobileHidden: true,
  },
  {
    id: 'tile-capital',
    src: '/hero/satellites/capital.webp', alt: '', tile: 'xs', ratio: 'wide',
    x: 10, y: 32, depth: 0.56, rotation: -1.5,
    idle: { angle: 128, speed: 2.6, radius: 94, spin: 1, rotate: -1.4, scale: 0.012 },
    converge: { start: 0.38, end: 0.61, pull: 'in', curve: -20, spin: 6 },
    tablet: { x: 11, y: 30 }, mobileHidden: true,
  },
  {
    id: 'tile-mercado',
    src: '/hero/satellites/mercado.webp', alt: '', tile: 'xs', ratio: 'square',
    x: -34, y: -26, depth: 0.62, rotation: 0.8,
    idle: { angle: 208, speed: 2.5, radius: 90, spin: -1, rotate: 1.3, scale: 0.009 },
    converge: { start: 0.45, end: 0.64, pull: 'inOut', curve: 24, spin: -4 },
    tablet: { x: -33, y: -24 }, mobileHidden: true,
  },
];
