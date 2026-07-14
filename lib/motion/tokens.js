/** Paleta permitida — única fuente para glows y acentos de motion. */
export const motionPalette = {
  blackBlue: '#01040A',
  deepNavy: '#02070E',
  navyDark: '#061321',
  navy: '#0A2138',
  navyMedium: '#1B3A5C',
  iceBlue: '#8FB2D6',
  azure: '#4E84BD',
  iceBlueLight: '#9EC0E6',
  gold: '#BFA05A',
  goldLight: '#D2B775',
  ivory: '#F6F3EC',
  slate: '#9DB0B8',
};

export const MOTION_EASE = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
};

/** Duraciones calibradas — Etapa 4.5 */
export const MOTION_DURATION = {
  fast: 0.22,
  hover: 0.22,
  press: 0.14,
  inner: 0.68,
  reveal: 0.78,
  title: 0.88,
  card: 0.74,
  base: 0.78,
  slow: 0.82,
  dropdown: 0.24,
};

export const MOTION_DELAY = {
  sm: 0.06,
  md: 0.1,
  lg: 0.14,
};

export const MOTION_STAGGER = {
  sm: 0.08,
  md: 0.1,
  lg: 0.12,
};

export const MOTION_GROUP_DELAY = {
  sm: 0.08,
  md: 0.12,
  lg: 0.16,
};

export const MOTION_DISTANCE = {
  sm: 10,
  md: 12,
  lg: 14,
};

/** Activación en viewport — desktop */
export const VIEWPORT_OPTIONS = {
  once: true,
  margin: '0px 0px -10% 0px',
  amount: 0.3,
};

/** Activación en viewport — mobile (pantallas pequeñas) */
export const VIEWPORT_OPTIONS_MOBILE = {
  once: true,
  margin: '0px 0px -10% 0px',
  amount: 0.2,
};

export const MOBILE_VIEWPORT_QUERY = '(max-width: 760px)';

export const MOTION_GLOW = {
  primaryHover:
    '0 14px 36px -12px rgba(191, 160, 90, 0.38), 0 0 0 1px rgba(210, 183, 117, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
  ghostHover:
    '0 12px 28px -16px rgba(143, 178, 214, 0.26), inset 0 0 0 1px rgba(158, 192, 230, 0.14)',
  neutralHover:
    '0 10px 24px -14px rgba(143, 178, 214, 0.22), inset 0 0 0 1px rgba(158, 192, 230, 0.1)',
  cardHover:
    '0 22px 56px -28px rgba(1, 4, 10, 0.72), 0 0 0 1px rgba(143, 178, 214, 0.22)',
};

const EXCLUDED_ANCESTORS = [
  '.cover',
  '.cover-scroll',
  '.cover-sticky',
  '.cover-brain',
  '.hero-title',
  '.cover-caption',
];

export function isMotionExcluded(element) {
  if (!element) return true;
  return EXCLUDED_ANCESTORS.some((selector) => element.closest(selector));
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getProcessCloserDelay(stepCount) {
  return (
    MOTION_GROUP_DELAY.md
    + Math.max(0, stepCount - 1) * MOTION_STAGGER.md
    + MOTION_DELAY.sm
  );
}
