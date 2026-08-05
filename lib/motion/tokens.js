/** Paleta permitida - unica fuente para glows y acentos de motion. */
export const motionPalette = {
  blackBlue: '#020306',
  deepNavy: '#040508',
  navyDark: '#09090B',
  navy: '#0F0F12',
  navyMedium: '#1A1A1E',
  iceBlue: '#CCB487',
  azure: '#B7B3AB',
  iceBlueLight: '#DDC8A1',
  gold: '#CCB487',
  goldLight: '#DDC8A1',
  ivory: '#F2EFE8',
  slate: '#B7B3AB',
};

/*
 * Canonical motion language used by the home and every internal route.
 * Scroll narrative is the only motion allowed to use scrub.
 */
export const MOTION_SYSTEM = {
  reveal: 0.6,
  title: 0.62,
  card: 0.6,
  intro: 0.62,
  hover: 0.2,
  press: 0.14,
  scrub: 0.48,
  stagger: 0.07,
  wordStagger: 0.032,
  distance: 14,
  minorDistance: 8,
  easeOut: 'power3.out',
  easeInOut: 'power2.inOut',
};

export const MOTION_EASE = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.65, 0, 0.35, 1],
};

export const MOTION_DURATION = {
  fast: MOTION_SYSTEM.hover,
  hover: MOTION_SYSTEM.hover,
  press: MOTION_SYSTEM.press,
  inner: MOTION_SYSTEM.reveal,
  reveal: MOTION_SYSTEM.reveal,
  title: MOTION_SYSTEM.title,
  card: MOTION_SYSTEM.card,
  base: MOTION_SYSTEM.reveal,
  slow: MOTION_SYSTEM.title,
  dropdown: MOTION_SYSTEM.hover,
};

export const MOTION_DELAY = {
  sm: 0.04,
  md: 0.07,
  lg: 0.1,
};

export const MOTION_STAGGER = {
  sm: 0.05,
  md: MOTION_SYSTEM.stagger,
  lg: 0.09,
};

export const MOTION_GROUP_DELAY = {
  sm: 0.05,
  md: 0.08,
  lg: 0.11,
};

export const MOTION_DISTANCE = {
  sm: 8,
  md: 12,
  lg: MOTION_SYSTEM.distance,
};

export const VIEWPORT_OPTIONS = {
  once: true,
  margin: '0px 0px -8% 0px',
  amount: 0.28,
};

export const VIEWPORT_OPTIONS_MOBILE = {
  once: true,
  margin: '0px 0px -6% 0px',
  amount: 0.18,
};

export const MOBILE_VIEWPORT_QUERY = '(max-width: 760px)';

export const MOTION_GLOW = {
  primaryHover:
    '0 10px 26px -16px rgba(191, 160, 90, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
  ghostHover:
    '0 9px 22px -17px rgba(196, 194, 190, 0.2)',
  neutralHover:
    '0 8px 20px -16px rgba(196, 194, 190, 0.18)',
  cardHover:
    '0 18px 44px -30px rgba(1, 4, 10, 0.62)',
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
  return EXCLUDED_ANCESTORS.some(
    (selector) => element.closest(selector)
  );
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
}

export function getProcessCloserDelay(stepCount) {
  return (
    MOTION_GROUP_DELAY.md
    + Math.max(0, stepCount - 1) * MOTION_STAGGER.md
    + MOTION_DELAY.sm
  );
}
