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
 * Escena en perspectiva con punto de fuga en el centro del logo.
 *
 * Cada palabra vive en coordenadas de MUNDO (`wx`, `wy`, en vw/vh medidos a
 * profundidad z = 1) mas una profundidad inicial `z0`. La camara avanza sobre
 * el eje Z con el scroll y la proyeccion es la de una camara estenopeica:
 *
 *   k = focal / z          -> escala y distancia radial comparten divisor
 *   pantalla = mundo * k
 *
 * Ese divisor compartido es lo que hace que una palabra cercana se agrande Y
 * se aleje del centro mas rapido que una lejana. Es el principio que sostiene
 * todo el efecto: sin el, la nube se lee como elementos flotando sueltos.
 *
 * z0 alto = nace diminuta junto al punto de fuga y tarda en crecer.
 * z0 bajo = ya esta cerca y cruza la camara temprano.
 * El escalonado de z0 evita que todas salgan de pantalla a la vez.
 */
export const HERO_SCENE = {
  focal: 1,
  /* Plano donde la palabra alcanza la camara y deja de verse. */
  zNear: 0.55,
  /* Profundidad del bloque central: mas cerca que esto, la palabra pasa delante. */
  zContent: 1.15,
  /* Recorrido de camara: cubre la z0 mas lejana hasta pasar zNear. */
  cameraTravel: 4.3,
  /* Fraccion del timeline que ocupa la nube; el resto es logo, pausa y salida. */
  cloudEnd: 0.62,
};

export const HERO_WORDS = [
  {
    id: 'estrategia', label: 'Estrategia', size: 'xl', accent: true,
    wx: 34, wy: -28, z0: 1.25, opacity: 1, rotation: 0.6,
    floatX: 8, floatY: -7, floatRotate: -0.8, floatDuration: 6.8, floatDelay: -3.6,
    mobile: { wx: 28, wy: -18 },
  },
  {
    id: 'resultados', label: 'Resultados', size: 'sm', accent: true,
    wx: -50, wy: 36, z0: 1.45, opacity: 1, rotation: 1.5,
    floatX: -8, floatY: -7, floatRotate: -1.2, floatDuration: 8.6, floatDelay: -3.9,
    tabletHidden: true, mobile: { wx: 30, wy: 20 },
  },
  {
    id: 'medios-pago', label: 'Medios de pago', size: 'lg', accent: true,
    wx: 46, wy: -16, z0: 1.7, opacity: 1, rotation: -0.9,
    floatX: 9, floatY: 6, floatRotate: 0.9, floatDuration: 6.6, floatDelay: -1.7,
    tablet: { wx: 40, wy: -14 }, mobile: { wx: 32, wy: -12 },
  },
  {
    id: 'financiamiento', label: 'Financiamiento', size: 'xl', accent: true,
    wx: -44, wy: -30, z0: 2.1, opacity: 1, rotation: -1.4,
    floatX: 10, floatY: -8, floatRotate: 1.1, floatDuration: 7.2, floatDelay: -2.4,
    tablet: { wx: -38, wy: -27 }, mobile: { wx: -32, wy: -24 },
  },
  {
    id: 'crecimiento', label: 'Crecimiento', size: 'md',
    wx: -34, wy: -22, z0: 2.35, opacity: 0.92, rotation: -0.7,
    floatX: -7, floatY: 5, floatRotate: -1.1, floatDuration: 6.9, floatDelay: -2.1,
    mobileHidden: true,
  },
  {
    id: 'procesos-ia', label: 'Procesos con IA', size: 'lg',
    wx: -40, wy: 30, z0: 2.6, opacity: 0.95, rotation: 1.1,
    floatX: -7, floatY: -9, floatRotate: -1, floatDuration: 7.4, floatDelay: -3.2,
    tablet: { wx: -34, wy: 26 }, mobile: { wx: -28, wy: 22 },
  },
  {
    id: 'cobros-pagos', label: 'Cobros y pagos', size: 'md',
    wx: 50, wy: 8, z0: 2.9, opacity: 0.88, rotation: -1.2,
    floatX: -10, floatY: -5, floatRotate: -1, floatDuration: 7.1, floatDelay: -5.8,
    tablet: { wx: 44, wy: 6 }, mobileHidden: true,
  },
  {
    id: 'liquidez', label: 'Liquidez', size: 'md',
    wx: -48, wy: -4, z0: 3, opacity: 0.9, rotation: 1.2,
    floatX: -9, floatY: 7, floatRotate: -1.2, floatDuration: 7.8, floatDelay: -5.1,
    tablet: { wx: -42, wy: -2 }, mobile: { wx: -34, wy: -4 },
  },
  {
    id: 'gestion-integral', label: 'Gestion integral', size: 'md',
    wx: 38, wy: 28, z0: 3.2, opacity: 0.85, rotation: -0.8,
    floatX: -8, floatY: 8, floatRotate: -1.2, floatDuration: 8.5, floatDelay: -1.1,
    tablet: { wx: 34, wy: 24 }, mobileHidden: true,
  },
  {
    id: 'inversiones', label: 'Inversiones', size: 'md',
    wx: 42, wy: -32, z0: 3.4, opacity: 0.86, rotation: 1.4,
    floatX: 8, floatY: -6, floatRotate: -1.3, floatDuration: 8.2, floatDelay: -4.4,
    tablet: { wx: 36, wy: -28 }, mobile: { wx: 30, wy: -20 },
  },
  {
    id: 'automatizacion', label: 'Automatizacion', size: 'sm',
    wx: -46, wy: 20, z0: 3.7, opacity: 0.82, rotation: 1.3,
    floatX: 7, floatY: 6, floatRotate: 1.2, floatDuration: 7.9, floatDelay: -4.8,
    tablet: { wx: -40, wy: 18 }, mobile: { wx: -30, wy: 16 },
  },
  {
    id: 'soluciones-financieras', label: 'Soluciones financieras', size: 'xs', depth: 'far',
    wx: 6, wy: 40, z0: 3.9, opacity: 0.7, rotation: -1,
    floatX: 5, floatY: 7, floatRotate: 1.3, floatDuration: 9.6, floatDelay: -7.2,
    tabletHidden: true, mobileHidden: true,
  },
  {
    id: 'capital-trabajo', label: 'Capital de trabajo', size: 'sm', depth: 'far',
    wx: -18, wy: -38, z0: 4, opacity: 0.72, rotation: -1.5,
    floatX: 6, floatY: 9, floatRotate: 1.1, floatDuration: 8.1, floatDelay: -2.9,
    tablet: { wx: -16, wy: -34 }, mobileHidden: true,
  },
  {
    id: 'mercado-capitales', label: 'Mercado de capitales', size: 'sm', depth: 'far',
    wx: 48, wy: 34, z0: 4.3, opacity: 0.72, rotation: 0.8,
    floatX: -6, floatY: 7, floatRotate: 1.2, floatDuration: 8.9, floatDelay: -6.3,
    tablet: { wx: 42, wy: 30 }, mobileHidden: true,
  },
  {
    id: 'respaldo', label: 'Respaldo', size: 'sm',
    wx: 26, wy: -38, z0: 4.55, opacity: 0.78, rotation: 0.9,
    floatX: 6, floatY: -8, floatRotate: 1, floatDuration: 7.5, floatDelay: -6,
    mobileHidden: true,
  },
  {
    id: 'ejecucion', label: 'Ejecucion', size: 'xs', depth: 'far',
    wx: 50, wy: -40, z0: 4.8, opacity: 0.68, rotation: -1.6,
    floatX: 7, floatY: -6, floatRotate: 1.4, floatDuration: 9.3, floatDelay: -5.5,
    tabletHidden: true, mobileHidden: true,
  },
];

/*
 * La narrativa necesita recorrido: nube, revelado del logo, pausa y salida no
 * entran en una pantalla. Los 80vh previos comprimian las cuatro fases hasta
 * volverlas ilegibles.
 */
export const HERO_WORD_LAYOUTS = {
  desktop: { scrollDistanceVh: 235, xFactor: 1.14, yFactor: 1.1 },
  tablet: { scrollDistanceVh: 205, xFactor: 1.08, yFactor: 1.06 },
  mobile: { scrollDistanceVh: 175, xFactor: 1.02, yFactor: 1.02 },
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
