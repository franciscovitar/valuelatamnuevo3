import { prefersReducedMotion } from '@/lib/motion/tokens';

export const SCROLL_ANCHOR_OFFSET = 88;

export function isSmoothScrollEnabled() {
  return !prefersReducedMotion();
}

export function subscribeReducedMotion(onChange) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = () => onChange(mediaQuery.matches);
  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
}

/** Reserva de control por sistema — futuras etapas GSAP vs Motion */
export const VL_GSAP_ROOT = 'data-vl-gsap-root';
export const VL_MOTION_ROOT = 'data-vl-motion-root';

export function isUnderGsapRoot(element) {
  return Boolean(element?.closest(`[${VL_GSAP_ROOT}]`));
}

export function isUnderMotionRoot(element) {
  return Boolean(element?.closest(`[${VL_MOTION_ROOT}]`));
}

export function warnMotionGsapConflict(element) {
  if (process.env.NODE_ENV !== 'development' || !element) return;

  if (isUnderGsapRoot(element) && isUnderMotionRoot(element)) {
    console.warn('[vl-scroll] GSAP y Motion no deben controlar el mismo nodo:', element);
  }
}
