/** Posiciones extraídas de Figma (canvas 1440×900). */
export const HERO_DESIGN = { width: 1440, height: 900 };

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

/** Nodos Figma: 45:2199, 45:5306, 45:2396, 45:3491 */
export const HERO_STATES = {
  s1: {
    figma: '45:2199',
    content: { x: -471, opacity: 0 },
    cards: [
      { x: 681, y: -288, opacity: 0 },
      { x: 865, y: 1130, opacity: 0 },
      { x: 1045, y: -119, opacity: 0 },
      { x: 1228, y: 964, opacity: 0 },
    ],
    linesOpacity: 0,
    radialOpacity: 0.55,
    smoke: { y: 220, opacity: 0 },
    theme: 0,
  },
  s2: {
    figma: '45:5306',
    content: { x: 104, opacity: 1 },
    cards: [
      { x: 639, y: 128, opacity: 1 },
      { x: 788, y: 693, opacity: 1 },
      { x: 940, y: 280, opacity: 1 },
      { x: 1091, y: 506, opacity: 1 },
    ],
    linesOpacity: 1,
    radialOpacity: 1,
    smoke: { y: 220, opacity: 0.3 },
    theme: 0,
  },
  s3: {
    figma: '45:2396',
    content: { x: 150, opacity: 1 },
    cards: [
      { x: 639, y: 190, opacity: 1 },
      { x: 788, y: 623, opacity: 1 },
      { x: 940, y: 318, opacity: 1 },
      { x: 1091, y: 531, opacity: 1 },
    ],
    linesOpacity: 1,
    radialOpacity: 1,
    smoke: { y: -158, opacity: 0.3 },
    theme: 1,
  },
  s4: {
    figma: '45:3491',
    content: { x: 150, opacity: 1 },
    cards: [
      { x: 639, y: 177, opacity: 1 },
      { x: 788, y: 637, opacity: 1 },
      { x: 940, y: 330, opacity: 1 },
      { x: 1091, y: 518, opacity: 1 },
    ],
    linesOpacity: 1,
    radialOpacity: 1,
    smoke: { y: -158, opacity: 0.3 },
    theme: 1,
  },
};

/** Rangos normalizados de la timeline (0–1). */
export const HERO_TIMELINE = {
  holdS1: [0, 0.12],
  s1toS2: [0.06, 0.38],
  s2toS3: [0.32, 0.68],
  s3toS4: [0.6, 0.88],
  exit: [0.9, 1],
};

export function getHeroScale(stickyEl) {
  if (!stickyEl) return { x: 1, y: 1 };
  return {
    x: stickyEl.offsetWidth / HERO_DESIGN.width,
    y: stickyEl.offsetHeight / HERO_DESIGN.height,
  };
}

export function designX(px, scaleX) {
  return px * scaleX;
}

export function designY(px, scaleY) {
  return px * scaleY;
}
