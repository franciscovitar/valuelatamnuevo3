import Lenis from 'lenis';
import { gsap, ScrollTrigger, ensureGsapPlugins } from './gsap';
import { SCROLL_ANCHOR_OFFSET, isSmoothScrollEnabled } from './config';

/** @type {Lenis | null} */
let lenisInstance = null;

/** @type {((time: number) => void) | null} */
let tickerCallback = null;

/** @type {((lenis: Lenis) => void) | null} */
let scrollListener = null;

/** @type {Element | null} */
let scrollerProxyTarget = null;

/** @type {(() => void) | null} */
let scrollerProxyRefreshHandler = null;

function createScrollListener() {
  return () => {
    ScrollTrigger.update();
    window.dispatchEvent(new Event('scroll'));
  };
}

function attachScrollTriggerProxy(lenis) {
  scrollerProxyTarget = document.documentElement;

  ScrollTrigger.scrollerProxy(scrollerProxyTarget, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
  });

  scrollerProxyRefreshHandler = () => lenis.resize();
  ScrollTrigger.addEventListener('refresh', scrollerProxyRefreshHandler);
}

function detachScrollTriggerProxy() {
  if (scrollerProxyRefreshHandler) {
    ScrollTrigger.removeEventListener('refresh', scrollerProxyRefreshHandler);
    scrollerProxyRefreshHandler = null;
  }

  if (scrollerProxyTarget) {
    ScrollTrigger.scrollerProxy(scrollerProxyTarget, {});
    scrollerProxyTarget = null;
  }
}

function attachGsapTicker(lenis) {
  tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);
}

function detachGsapTicker() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
}

export function getLenis() {
  return lenisInstance;
}

export function initLenis(options = {}) {
  if (typeof window === 'undefined' || !isSmoothScrollEnabled()) return null;
  if (lenisInstance) return lenisInstance;

  ensureGsapPlugins();

  lenisInstance = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    anchors: { offset: SCROLL_ANCHOR_OFFSET },
    ...options,
  });

  scrollListener = createScrollListener();
  lenisInstance.on('scroll', scrollListener);
  attachGsapTicker(lenisInstance);
  attachScrollTriggerProxy(lenisInstance);

  document.documentElement.classList.add('lenis', 'lenis-smooth');

  requestAnimationFrame(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (target) {
      lenisInstance.scrollTo(target, { offset: -SCROLL_ANCHOR_OFFSET, immediate: true });
    }
  });

  return lenisInstance;
}

export function destroyLenis() {
  if (lenisInstance && scrollListener) {
    lenisInstance.off('scroll', scrollListener);
  }

  scrollListener = null;
  detachGsapTicker();
  detachScrollTriggerProxy();

  lenisInstance?.destroy();
  lenisInstance = null;

  document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
}

export function refreshLenis() {
  lenisInstance?.resize();
}

export function scrollToTop({ immediate = true } = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate, force: true });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function pauseLenis() {
  lenisInstance?.stop();
  document.documentElement.classList.add('lenis-stopped');
}

export function resumeLenis() {
  if (!lenisInstance) return;
  lenisInstance.start();
  document.documentElement.classList.remove('lenis-stopped');
}
