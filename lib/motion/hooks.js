'use client';

import { useReducedMotion, useInView } from 'motion/react';
import { useRef, useSyncExternalStore } from 'react';
import {
  MOBILE_VIEWPORT_QUERY,
  VIEWPORT_OPTIONS,
  VIEWPORT_OPTIONS_MOBILE,
} from './tokens';

function subscribeMobileViewport(onStoreChange) {
  const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

function getServerMobileViewportSnapshot() {
  return false;
}

export function useMotionReduced() {
  return useReducedMotion();
}

export function useInViewOnce(options = {}) {
  const ref = useRef(null);
  const isMobile = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot,
  );
  const baseViewport = isMobile ? VIEWPORT_OPTIONS_MOBILE : VIEWPORT_OPTIONS;
  const inView = useInView(ref, { ...baseViewport, ...options });

  return [ref, inView];
}

export function useRevealAnimation(reduceMotion) {
  const shouldAnimate = !reduceMotion;
  return {
    shouldAnimate,
    initial: shouldAnimate ? 'hidden' : false,
    getAnimate: (inView) => (shouldAnimate && !inView ? 'hidden' : 'visible'),
  };
}
