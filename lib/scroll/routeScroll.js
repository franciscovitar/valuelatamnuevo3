import { ScrollTrigger } from './gsap';
import { gsap } from './gsap';
import { SCROLL_ANCHOR_OFFSET } from './config';
import { destroyLenis, getLenis, initLenis, refreshLenis, scrollToTop } from './lenis';

export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

export function refreshScrollTriggers({ hard = true } = {}) {
  requestAnimationFrame(() => {
    refreshLenis();
    ScrollTrigger.clearScrollMemory?.();
    ScrollTrigger.refresh(hard);
  });
}

function closeMobileMenu() {
  document.querySelector('header.nav')?.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
  document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
    dropdown.classList.remove('is-open');
    dropdown.querySelector('.nav-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function resetMainMotionState() {
  const main = document.querySelector('main');
  if (!main) return;
  gsap.set(main.querySelectorAll('*'), { clearProps: 'opacity,transform,clipPath,filter' });
}

/** Limpieza al abandonar una ruta — antes de montar la nueva. */
export function prepareRouteExit({ resetScroll = true } = {}) {
  closeMobileMenu();
  killAllScrollTriggers();
  resetMainMotionState();

  if (resetScroll) {
    scrollToTop({ immediate: true });
  }
}

/** Reinicio al finalizar la transición de entrada. */
export function finalizeRouteEnter() {
  refreshScrollTriggers({ hard: true });

  const hash = window.location.hash;
  if (!hash) return;

  requestAnimationFrame(() => {
    const target = document.querySelector(hash);
    if (!target) return;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { offset: -SCROLL_ANCHOR_OFFSET, immediate: true });
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_ANCHOR_OFFSET;
    window.scrollTo({ top, left: 0, behavior: 'auto' });
  });
}

/** Compat — delegado al ciclo de transición. */
export function handleRouteScrollTransition(options = {}) {
  prepareRouteExit(options);
  finalizeRouteEnter();
}

export function bootstrapSmoothScroll(options = {}) {
  return initLenis(options);
}

export function teardownSmoothScroll() {
  killAllScrollTriggers();
  destroyLenis();
}

export function getActiveLenis() {
  return getLenis();
}
