export const HERO_TIMELINE = {
  scrub: 0.42,
  hintFade: 0.09,
  markOutlinePeak: 0.94,
  markNormalizeAt: 0.62,
  haloAt: 0.54,
  markSettleAt: 0.70,
  /*
   * Salida del bloque central. Entre markSettleAt y exitAt queda una pausa
   * deliberada: la escena limpia tiene que poder leerse antes de irse. Y sin
   * esta fase el ultimo 20% del recorrido era scroll congelado, con el hero
   * esperando a que el sticky lo soltara.
   */
  exitAt: 0.78,
};

/*
 * La escena tiene DOS movimientos que no se parecen en nada.
 *
 * 1. Ambiente (tiempo). Antes de que el usuario toque nada, cada palabra ya
 *    esta viva: deriva en SU direccion, a SU velocidad, sosteniendola. No hay
 *    una animacion compartida con delays distintos — eso se lee como un grupo
 *    animado en bloque, que es justo lo que hay que evitar.
 *
 *    La deriva es un arco de circunferencia de radio grande y periodo muy
 *    largo, no un vaiven. Un seno se lee mal: la palabra baja, frena, y vuelve
 *    a subir por donde vino. En cambio con velocidad angular constante el
 *    modulo de la velocidad no cambia nunca y la direccion rota unos pocos
 *    grados por minuto, asi que en el tiempo que alguien mira el hero la
 *    trayectoria se lee recta y sostenida — y sigue acotada, sin escaparse de
 *    la escena ni necesitar un salto de reciclado.
 *
 * 2. Convergencia (scroll). El scroll genera una fuerza de atraccion hacia el
 *    centro. Cada palabra abandona su trayectoria ambiental en SU momento y
 *    viaja desde SU posicion hasta el logo, con su propia duracion y su propia
 *    curva de velocidad, hasta integrarse y desaparecer.
 *
 * La profundidad (`depth`, 0 = cerca, 1 = lejos) no se anima: solo define
 * escala, presencia, desenfoque y si la palabra pasa por delante o por detras
 * del bloque central. Es lo que da volumen a la constelacion en reposo.
 */
export const HERO_SCENE = {
  nearScale: 1.12,
  farScale: 0.6,
  farOpacity: 0.42,
  /* A partir de esta profundidad empieza un desenfoque leve. */
  blurFrom: 0.55,
  blurMax: 2,
  /* Mas cerca que esto, la palabra pasa por delante del logo y del titulo. */
  contentDepth: 0.3,
  /* Estado final: la palabra se integra al centro, no aterriza sobre el. */
  absorbScale: 0.14,
  /* Tramo final de la convergencia en el que la palabra se apaga. */
  absorbFadeFrom: 0.58,
};

/**
 * Traduce la profundidad de una palabra a su presencia visual en reposo.
 * La comparten el primer render (React) y el runtime, para que la escena no
 * salte cuando la animacion toma el control.
 */
export function resolveDepthVisual(depth) {
  const {
    nearScale,
    farScale,
    farOpacity,
    blurFrom,
    blurMax,
    contentDepth,
  } = HERO_SCENE;

  return {
    scale: nearScale + (farScale - nearScale) * depth,
    opacity: 1 + (farOpacity - 1) * depth,
    blur: depth <= blurFrom
      ? 0
      : Math.min(blurMax, (depth - blurFrom) * 4),
    // Delante o detras del bloque central (`.hero-word-scene__core`, z-index 100).
    zIndex: depth < contentDepth
      ? Math.round(150 + (contentDepth - depth) * 130)
      : Math.round(40 - depth * 20),
  };
}

/*
 * Configuracion fija por palabra en vez de `Math.random()`: la irregularidad
 * esta disenada y es reproducible. Con random, cada carga produciria una
 * composicion distinta y no habria forma de ajustarla.
 *
 * `x` / `y`   posicion de reposo, en vw / vh desde el centro de la escena.
 * `depth`     profundidad estatica (escala, presencia, blur, z-index).
 * `idle`      deriva ambiental propia: `angle` es la direccion en grados (0 =
 *             derecha, 90 = abajo), `speed` la velocidad en px/s, `radius` el
 *             radio del arco — a mas radio, mas recta se ve la trayectoria — y
 *             `spin` el sentido en el que la direccion rota.
 * `converge`  ventana de atraccion en progreso de scroll, con `pull` (curva de
 *             velocidad propia), `curve` (arco lateral del viaje, en px) y
 *             `spin` (giro acumulado durante el viaje).
 */
export const HERO_WORDS = [
  {
    id: 'estrategia', label: 'Estrategia', size: 'xl', accent: true,
    x: 28, y: -3, depth: 0.06, rotation: 0.6,
    idle: { angle: 214, speed: 4.1, radius: 132, spin: 1, rotate: 0.9, scale: 0.024 },
    converge: { start: 0.03, end: 0.26, pull: 'out', curve: -34, spin: -6 },
    tablet: { x: 20, y: -27 }, mobile: { x: 26, y: -20 },
  },
  {
    id: 'medios-pago', label: 'Medios de pago', size: 'lg', accent: true,
    x: 33, y: -20, depth: 0.16, rotation: -0.9,
    idle: { angle: 118, speed: 3.6, radius: 118, spin: -1, rotate: -1.2, scale: 0.018 },
    converge: { start: 0.04, end: 0.30, pull: 'inOut', curve: 26, spin: 5 },
    tablet: { x: 30, y: -18 }, mobile: { x: 26, y: -30 },
  },
  {
    id: 'liquidez', label: 'Liquidez', size: 'md',
    x: -26, y: -9, depth: 0.3, rotation: 1.2,
    idle: { angle: 8, speed: 2.9, radius: 104, spin: 1, rotate: 0.7, scale: 0.012 },
    converge: { start: 0.05, end: 0.31, pull: 'out', curve: 18, spin: 4 },
    tablet: { x: -27, y: -17 }, mobile: { x: -26, y: -17 },
  },
  {
    id: 'resultados', label: 'Resultados', size: 'sm', accent: true,
    x: -23, y: 19, depth: 0.12, rotation: 1.5,
    idle: { angle: 288, speed: 3.3, radius: 96, spin: -1, rotate: 1.4, scale: 0.02 },
    converge: { start: 0.09, end: 0.29, pull: 'in', curve: -22, spin: -8 },
    tabletHidden: true, mobile: { x: 24, y: 26 },
  },
  {
    id: 'financiamiento', label: 'Financiamiento', size: 'xl', accent: true,
    x: -30, y: -27, depth: 0.1, rotation: -1.4,
    idle: { angle: 46, speed: 4.4, radius: 145, spin: -1, rotate: -1.1, scale: 0.022 },
    converge: { start: 0.15, end: 0.40, pull: 'inOut', curve: 30, spin: 6 },
    tablet: { x: -28, y: -25 }, mobile: { x: -24, y: -28 },
  },
  {
    id: 'procesos-ia', label: 'Procesos con IA', size: 'lg',
    x: -28, y: 25, depth: 0.22, rotation: 1.1,
    idle: { angle: 162, speed: 3.8, radius: 126, spin: 1, rotate: -0.8, scale: 0.016 },
    converge: { start: 0.16, end: 0.44, pull: 'out', curve: -28, spin: -4 },
    tablet: { x: -26, y: 23 }, mobile: { x: -22, y: 21 },
  },
  {
    id: 'cobros-pagos', label: 'Cobros y pagos', size: 'md',
    x: 29, y: 14, depth: 0.26, rotation: -1.2,
    idle: { angle: 232, speed: 3.1, radius: 112, spin: -1, rotate: 1, scale: 0.014 },
    converge: { start: 0.18, end: 0.41, pull: 'in', curve: 34, spin: 7 },
    tablet: { x: 27, y: 13 }, mobileHidden: true,
  },
  {
    id: 'diagnostico', label: 'Diagnostico', size: 'md',
    x: -10, y: 21, depth: 0.42, rotation: -0.5,
    idle: { angle: 115, speed: 2.4, radius: 70, spin: 1, rotate: 0.6, scale: 0.015 },
    converge: { start: 0.06, end: 0.33, pull: 'inOut', curve: -16, spin: 4 },
    mobile: { x: -9, y: 34 },
  },
  {
    id: 'instrumentos', label: 'Instrumentos', size: 'md',
    x: 22, y: 9, depth: 0.28, rotation: 0.7,
    idle: { angle: 26, speed: 2.3, radius: 66, spin: -1, rotate: -0.7, scale: 0.013 },
    converge: { start: 0.11, end: 0.36, pull: 'out', curve: 20, spin: -5 },
    tablet: { x: 25, y: 20 }, mobileHidden: true,
  },
  {
    id: 'crecimiento', label: 'Crecimiento', size: 'md',
    x: -17, y: -33, depth: 0.44, rotation: -0.7,
    idle: { angle: 302, speed: 3.5, radius: 121, spin: 1, rotate: 1.2, scale: 0.015 },
    converge: { start: 0.17, end: 0.47, pull: 'inOut', curve: -16, spin: 5 },
    mobileHidden: true,
  },
  {
    id: 'acreditacion', label: 'Acreditacion', size: 'sm',
    x: -22, y: 5, depth: 0.4, rotation: 1,
    idle: { angle: 198, speed: 2.2, radius: 64, spin: 1, rotate: 0.9, scale: 0.011 },
    converge: { start: 0.13, end: 0.38, pull: 'in', curve: -24, spin: 6 },
    tablet: { x: -23, y: 17 }, mobileHidden: true,
  },
  {
    id: 'inversiones', label: 'Inversiones', size: 'md',
    x: 30, y: -34, depth: 0.34, rotation: 1.4,
    idle: { angle: 148, speed: 4, radius: 138, spin: -1, rotate: -1.3, scale: 0.013 },
    converge: { start: 0.27, end: 0.52, pull: 'out', curve: 22, spin: -5 },
    tablet: { x: 27, y: -31 }, mobile: { x: 25, y: -13 },
  },
  {
    id: 'gestion-integral', label: 'Gestion integral', size: 'md',
    x: 26, y: 28, depth: 0.38, rotation: -0.8,
    idle: { angle: 264, speed: 2.8, radius: 108, spin: 1, rotate: -1, scale: 0.011 },
    converge: { start: 0.29, end: 0.55, pull: 'in', curve: 26, spin: 4 },
    tablet: { x: 24, y: 26 }, mobileHidden: true,
  },
  {
    id: 'comercio-exterior', label: 'Comercio exterior', size: 'sm',
    x: 24, y: -6, depth: 0.46, rotation: 0.6,
    idle: { angle: 346, speed: 2.5, radius: 74, spin: -1, rotate: -0.8, scale: 0.01 },
    converge: { start: 0.22, end: 0.49, pull: 'inOut', curve: 16, spin: -4 },
    tablet: { x: 20, y: 15 }, mobileHidden: true,
  },
  {
    id: 'automatizacion', label: 'Automatizacion', size: 'sm',
    x: -33, y: 20, depth: 0.5, rotation: 1.3,
    idle: { angle: 96, speed: 3.7, radius: 128, spin: -1, rotate: 1.1, scale: 0.017 },
    converge: { start: 0.30, end: 0.50, pull: 'inOut', curve: -30, spin: -7 },
    tablet: { x: -31, y: 19 }, mobile: { x: -26, y: 30 },
  },
  {
    id: 'canales', label: 'Canales', size: 'sm',
    x: -13, y: -16, depth: 0.52, rotation: -1.1,
    idle: { angle: 231, speed: 2.1, radius: 62, spin: 1, rotate: 1, scale: 0.012 },
    converge: { start: 0.24, end: 0.45, pull: 'out', curve: 22, spin: 5 },
    mobile: { x: -14, y: -38 },
  },
  {
    id: 'respaldo', label: 'Respaldo', size: 'sm',
    x: 18, y: -38, depth: 0.58, rotation: 0.9,
    idle: { angle: 178, speed: 3.4, radius: 116, spin: 1, rotate: 0.8, scale: 0.01 },
    converge: { start: 0.36, end: 0.58, pull: 'out', curve: 14, spin: 3 },
    mobileHidden: true,
  },
  {
    id: 'banca', label: 'Banca', size: 'sm', far: true,
    x: 12, y: -15, depth: 0.6, rotation: 0.4,
    idle: { angle: 309, speed: 2.6, radius: 76, spin: -1, rotate: -0.6, scale: 0.009 },
    converge: { start: 0.33, end: 0.56, pull: 'in', curve: -18, spin: -3 },
    tabletHidden: true, mobileHidden: true,
  },
  {
    id: 'capital-trabajo', label: 'Capital de trabajo', size: 'sm', depth: 0.56,
    x: -12, y: 34, rotation: -1.5,
    idle: { angle: 352, speed: 3, radius: 100, spin: -1, rotate: -1.4, scale: 0.012 },
    converge: { start: 0.38, end: 0.61, pull: 'in', curve: -20, spin: 6 },
    tablet: { x: -11, y: 32 }, mobileHidden: true,
  },
  {
    id: 'mercado-capitales', label: 'Mercado de capitales', size: 'sm', far: true,
    x: 31, y: 32, depth: 0.62, rotation: 0.8,
    idle: { angle: 208, speed: 3.9, radius: 134, spin: 1, rotate: 1.3, scale: 0.009 },
    converge: { start: 0.45, end: 0.64, pull: 'inOut', curve: 24, spin: -4 },
    tablet: { x: 29, y: 30 }, mobileHidden: true,
  },
  {
    id: 'ejecucion', label: 'Ejecucion', size: 'xs', far: true,
    x: 36, y: -38, depth: 0.7, rotation: -1.6,
    idle: { angle: 132, speed: 4.3, radius: 142, spin: -1, rotate: -0.9, scale: 0.008 },
    converge: { start: 0.47, end: 0.66, pull: 'out', curve: -12, spin: 5 },
    tabletHidden: true, mobileHidden: true,
  },
  {
    id: 'soluciones-financieras', label: 'Soluciones financieras', size: 'xs', far: true,
    x: 5, y: 39, depth: 0.74, rotation: -1,
    idle: { angle: 66, speed: 2.7, radius: 98, spin: 1, rotate: 1, scale: 0.007 },
    converge: { start: 0.44, end: 0.66, pull: 'in', curve: 18, spin: -3 },
    tabletHidden: true, mobileHidden: true,
  },
];

/*
 * La narrativa necesita recorrido: constelacion viva, convergencia escalonada,
 * revelado del logo, pausa y salida no entran en una pantalla.
 */
/*
 * `convergeStretch` reparte la convergencia sobre todo el tramo disponible
 * cuando el breakpoint esconde palabras. Sin el, en mobile las ocho visibles
 * terminaban de entrar en 0.52 y quedaba un tramo muerto hasta que el logo se
 * asienta: la escena limpia demasiado pronto y el scroll siguiente no avanza
 * nada.
 */
export const HERO_WORD_LAYOUTS = {
  desktop: {
    scrollDistanceVh: 235, xFactor: 1.14, yFactor: 1.1,
    idleScale: 1, convergeStretch: 1,
  },
  tablet: {
    scrollDistanceVh: 205, xFactor: 1.08, yFactor: 1.06,
    idleScale: 0.8, convergeStretch: 1.03,
  },
  mobile: {
    scrollDistanceVh: 175, xFactor: 1.02, yFactor: 1.02,
    idleScale: 0.58, convergeStretch: 1.27,
  },
};

export const HERO_MARK_REVEALS = [
  {
    id: 'small', axis: 'x', origin: 'left center', at: 0.2,
    duration: 0.14, scanAxis: 'x', scanFrom: 34, scanTo: 60,
  },
  {
    id: 'middle', axis: 'y', origin: 'center bottom', at: 0.32,
    duration: 0.15, scanAxis: 'y', scanFrom: 68, scanTo: 31,
  },
  {
    id: 'tall', axis: 'y', origin: 'center top', at: 0.44,
    duration: 0.16, scanAxis: 'y', scanFrom: 13, scanTo: 59,
  },
];
