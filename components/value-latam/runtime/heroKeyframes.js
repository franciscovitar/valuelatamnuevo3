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

export const HERO_STATES = {
  s1: {
    figma: '45:2199',
    content: { x: -471, opacity: 1 },
    lines: { x: [706.81, 887.81, 1068.81, 1249.81], opacity: 0 },
    radial: { opacity: 0 },
    cards: [
      { x: 681, y: -288, opacity: 0 },
      { x: 865, y: 1130, opacity: 0 },
      { x: 1045, y: -119, opacity: 0 },
      { x: 1228, y: 964, opacity: 0 },
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
      { x: 639, y: 128, opacity: 1 },
      { x: 788, y: 693, opacity: 1 },
      { x: 940, y: 280, opacity: 1 },
      { x: 1091, y: 506, opacity: 1 },
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
      { x: 639, y: 190, opacity: 1 },
      { x: 788, y: 623, opacity: 1 },
      { x: 940, y: 318, opacity: 1 },
      { x: 1091, y: 531, opacity: 1 },
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
      { x: 639, y: 177, opacity: 1 },
      { x: 788, y: 637, opacity: 1 },
      { x: 940, y: 330, opacity: 1 },
      { x: 1091, y: 518, opacity: 1 },
    ],
    smoke: { y: -158, opacity: 0.3 },
    theme: 1,
  },
};

/** Timeline normalizada 0–1, tramos sin superposición. */
export const HERO_TIMELINE = {
  s1ToS2: [0, 0.43],
  holdS2: [0.43, 0.5],
  s2ToS3: [0.5, 0.78],
  s3ToS4: [0.78, 0.91],
  holdS4: [0.91, 1],
};

export const HERO_SCROLL_DESKTOP_VH = 360;
export const HERO_SCROLL_MOBILE_VH = 280;

/** Flotado idle en estado final — capa interna, no interfiere con scroll. */
export const HERO_CARD_FLOAT = {
  amplitude: [6, -5, 7, -6],
  duration: [2.6, 2.9, 2.75, 3.05],
  delay: [0, 0.32, 0.18, 0.44],
};
