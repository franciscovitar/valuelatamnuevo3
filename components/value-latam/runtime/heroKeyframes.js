/** Datos visuales puros — canvas Figma 1440×900. Nodos: 45:2199, 45:5306, 45:2396, 45:3491 */

export const HERO_DESIGN = {
  width: 1440,
  height: 900,
};

export const HERO_COPY = {
  eyebrow: 'La evolución de tu operación',
  titleLines: ['Soluciones', 'Financieras', 'Inteligentes'],
  paragraphLead:
    'Potenciamos la liquidez y automatizamos los procesos financieros de tu empresa con una plataforma integrada.',
  paragraphCloser: 'Un solo socio para toda tu operación.',
};

export const HERO_CARDS = [
  {
    id: '01',
    title: 'Financiamiento',
    desc: 'Capital de trabajo e inversión',
    icon: '/hero-icon-01.svg',
  },
  {
    id: '02',
    title: 'Procesos con IA',
    desc: 'Automatización financiera',
    icon: '/hero-icon-02.svg',
  },
  {
    id: '03',
    title: 'Liquidez',
    desc: 'Gestión de activos',
    icon: '/hero-icon-03.svg',
  },
  {
    id: '04',
    title: 'Medios de pago',
    desc: 'Infraestructura de cobros',
    icon: '/hero-icon-04.svg',
  },
];

export const HERO_THEME = {
  blue: {
    '--hero-accent': '#8FB2D6',
    '--hero-card-bg': 'rgba(10, 22, 36, 0.7)',
    '--hero-card-border': 'rgba(143, 178, 214, 0.15)',
    '--hero-glow': 'rgba(143, 178, 214, 0.3)',
    '--hero-line-accent': '#8FB2D6',
  },
  gold: {
    '--hero-accent': '#BFA05A',
    '--hero-card-bg': 'rgba(20, 18, 12, 0.7)',
    '--hero-card-border': 'rgba(191, 160, 90, 0.15)',
    '--hero-glow': 'rgba(191, 160, 90, 0.3)',
    '--hero-line-accent': '#BFA05A',
  },
};

/** Referencia histórica Figma — no es el estado de carga. */
export const HERO_STATES = {
  s1: {
    figma: '45:2199',
    content: { x: -471, opacity: 1 },
    lines: { x: [706.81, 887.81, 1068.81, 1249.81], opacity: 0 },
    radial: { opacity: 0 },
    cards: [
      { x: 681, y: -288, opacity: 0, scale: 1, rotate: 0 },
      { x: 865, y: 1130, opacity: 0, scale: 1, rotate: 0 },
      { x: 1045, y: -119, opacity: 0, scale: 1, rotate: 0 },
      { x: 1228, y: 964, opacity: 0, scale: 1, rotate: 0 },
    ],
    smoke: { y: 220, opacity: 0 },
    theme: 0,
  },
  s2: {
    figma: '45:5306',
    content: { x: 104, opacity: 1 },
    lines: { x: [660.81, 811.81, 962.81, 1113.81], opacity: 1 },
    radial: { opacity: 1 },
    cards: [
      { x: 639, y: 128, opacity: 1, scale: 1, rotate: 0 },
      { x: 788, y: 693, opacity: 1, scale: 1, rotate: 0 },
      { x: 940, y: 280, opacity: 1, scale: 1, rotate: 0 },
      { x: 1091, y: 506, opacity: 1, scale: 1, rotate: 0 },
    ],
    smoke: { y: 220, opacity: 0.3 },
    theme: 0,
  },
  s3: {
    figma: '45:2396',
    content: { x: 150, opacity: 1 },
    lines: { x: [660.81, 811.81, 962.81, 1113.81], opacity: 1 },
    radial: { opacity: 1 },
    cards: [
      { x: 639, y: 190, opacity: 1, scale: 1, rotate: 0 },
      { x: 788, y: 623, opacity: 1, scale: 1, rotate: 0 },
      { x: 940, y: 318, opacity: 1, scale: 1, rotate: 0 },
      { x: 1091, y: 531, opacity: 1, scale: 1, rotate: 0 },
    ],
    smoke: { y: -158, opacity: 0.3 },
    theme: 1,
  },
  s4: {
    figma: '45:3491',
    content: { x: 150, opacity: 1 },
    lines: { x: [660.81, 811.81, 962.81, 1113.81], opacity: 1 },
    radial: { opacity: 1 },
    cards: [
      { x: 639, y: 177, opacity: 1, scale: 1, rotate: 0 },
      { x: 788, y: 637, opacity: 1, scale: 1, rotate: 0 },
      { x: 940, y: 330, opacity: 1, scale: 1, rotate: 0 },
      { x: 1091, y: 518, opacity: 1, scale: 1, rotate: 0 },
    ],
    smoke: { y: -158, opacity: 0.3 },
    theme: 1,
  },
};

/** Portada inmediata — presencia FIND sin mostrar la composición final completa. */
export const HERO_LANDING_STATE = {
  content: {
    x: 104,
    y: 0,
    opacity: 1,
  },
  lines: {
    x: [706.81, 887.81, 1068.81, 1249.81],
    opacity: 0.12,
  },
  radial: {
    opacity: 0.42,
  },
  cards: [
    {
      x: 654,
      y: 164,
      opacity: 0.72,
      scale: 0.965,
      rotate: -0.6,
    },
    {
      x: 830,
      y: 750,
      opacity: 0.18,
      scale: 0.93,
      rotate: 0.8,
    },
    {
      x: 1010,
      y: 236,
      opacity: 0.14,
      scale: 0.92,
      rotate: -0.7,
    },
    {
      x: 1180,
      y: 570,
      opacity: 0.1,
      scale: 0.9,
      rotate: 0.7,
    },
  ],
  smoke: {
    y: 245,
    opacity: 0.06,
  },
  theme: 0,
};

/** Micro-offsets del copy en landing — se resuelven al construir la escena. */
export const HERO_COPY_STATES = {
  landing: {
    eyebrow: { y: 0, opacity: 1 },
    titleLines: [
      { y: 0, opacity: 1 },
      { y: 0, opacity: 1 },
      { y: 0, opacity: 1 },
    ],
    leadLine: { y: 6, opacity: 0.76 },
    leadCloser: { y: 12, opacity: 0.58 },
  },
  built: {
    eyebrow: { y: 0, opacity: 1 },
    titleLines: [
      { y: 0, opacity: 1 },
      { y: 0, opacity: 1 },
      { y: 0, opacity: 1 },
    ],
    leadLine: { y: 0, opacity: 1 },
    leadCloser: { y: 0, opacity: 1 },
  },
  handoff: {
    eyebrow: { y: -4, opacity: 0.82 },
    titleLines: [
      { y: -6, opacity: 0.8 },
      { y: -8, opacity: 0.78 },
      { y: -10, opacity: 0.76 },
    ],
    leadLine: { y: -12, opacity: 0.68 },
    leadCloser: { y: -14, opacity: 0.62 },
  },
};

/** Profundidad por card — planos más lejanos se mueven más lento. */
export const HERO_CARD_DEPTH = [0.72, 1, 0.86, 0.94];

/** Handoff hacia Métricas — sin quinta escena ni pantalla vacía. */
export const HERO_HANDOFF = {
  content: { x: 150, y: -18, opacity: 0.86 },
  radial: { opacity: 0.62 },
  cards: [
    { x: 639, y: 162, opacity: 0.88, scale: 0.985, rotate: 0 },
    { x: 788, y: 652, opacity: 0.84, scale: 0.978, rotate: 0 },
    { x: 940, y: 312, opacity: 0.86, scale: 0.982, rotate: 0 },
    { x: 1091, y: 528, opacity: 0.84, scale: 0.978, rotate: 0 },
  ],
  smoke: { y: -120, opacity: 0.1 },
  camera: 0.965,
};

/** Timeline normalizada 0–1. */
export const HERO_TIMELINE = {
  holdLanding: [0, 0.06],
  landingToS2: [0.06, 0.5],
  holdS2: [0.5, 0.58],
  s2ToS3: [0.58, 0.78],
  s3ToS4: [0.78, 0.9],
  holdS4: [0.9, 0.94],
  handoff: [0.94, 1],
};

export const HERO_SCROLL_DESKTOP_VH = 390;
export const HERO_SCROLL_MOBILE_VH = 300;
