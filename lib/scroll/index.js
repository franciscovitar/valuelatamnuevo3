export { gsap, ScrollTrigger, ensureGsapPlugins } from './gsap';
export {
  SCROLL_ANCHOR_OFFSET,
  VL_GSAP_ROOT,
  VL_MOTION_ROOT,
  isSmoothScrollEnabled,
  isUnderGsapRoot,
  isUnderMotionRoot,
  subscribeReducedMotion,
  warnMotionGsapConflict,
} from './config';
export { destroyLenis, getLenis, initLenis, pauseLenis, refreshLenis, resumeLenis, scrollToTop } from './lenis';
export {
  bootstrapSmoothScroll,
  finalizeRouteEnter,
  getActiveLenis,
  handleRouteScrollTransition,
  killAllScrollTriggers,
  prepareRouteExit,
  refreshScrollTriggers,
  teardownSmoothScroll,
} from './routeScroll';
export { initHomeScrollExperience, scrollPalette } from './home';
export { initInternalScrollExperience, stashInternalIntroBeforePaint } from './internal';
export { useGsapScope, useGSAP } from './useGsapScope';
