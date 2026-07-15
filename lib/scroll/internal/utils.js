import { gsap, ScrollTrigger } from '../gsap';
import {
  bindCardTilt,
  pushCleanup,
  runCountUp,
  setVisible,
  textRevealStart,
  triggerStart,
} from '../home/utils';
import { createHomeScrollContext } from '../home/utils';
import { initTextReveal } from '@/lib/motion/textReveal';

export {
  bindCardTilt,
  createHomeScrollContext as createInternalScrollContext,
  pushCleanup,
  runCountUp,
  setVisible,
  textRevealStart,
  triggerStart,
};

export const INTERNAL_EASE_OUT = 'sine.out';

const IMMEDIATE_VIEWPORT_RATIO = 0.72;

export function querySection(root, id) {
  return root?.querySelector(`[data-vl-gsap-root="${id}"]`) ?? null;
}

export function setInternalVisible(section) {
  if (!section) return;
  setVisible(section.querySelectorAll('*'));
}

function isInViewport(element, ratio = IMMEDIATE_VIEWPORT_RATIO) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  const visibleTop = window.innerHeight * ratio;
  return rect.top < visibleTop && rect.bottom > window.innerHeight * 0.08;
}

function primeHidden(targets, { y = 17, x = 0, opacity = 0.54 } = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return items;

  gsap.killTweensOf(items);
  gsap.set(items, {
    x,
    y,
    opacity,
    force3D: true,
    transformOrigin: '50% 50%',
  });

  return items;
}

function animateIn(
  targets,
  {
    y = 17,
    x = 0,
    opacity = 0.54,
    stagger = 0.12,
    duration = 0.96,
    delay = 0.04,
  } = {},
) {
  const items = primeHidden(targets, { y, x, opacity });
  if (!items.length) return null;

  return gsap.to(items, {
    x: 0,
    y: 0,
    opacity: 1,
    duration,
    stagger,
    delay,
    ease: INTERNAL_EASE_OUT,
    force3D: true,
    overwrite: 'auto',
  });
}

export function waitForPageImages(root, { timeout = 3200 } = {}) {
  const images = gsap.utils.toArray(root?.querySelectorAll('img') ?? []);
  const pending = images.filter((img) => !img.complete);

  if (!pending.length) {
    return Promise.resolve();
  }

  return Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }),
      ),
    ),
    new Promise((resolve) => {
      window.setTimeout(resolve, timeout);
    }),
  ]);
}

export function bindLateImageRefresh(root, cleanups) {
  let timer = 0;

  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      ScrollTrigger.refresh(false);
    }, 120);
  };

  root?.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', refresh, { once: true });
      img.addEventListener('error', refresh, { once: true });
    }
  });

  pushCleanup(cleanups, () => window.clearTimeout(timer));
}

export function initPageEntry(root, ctx) {
  const entry = root?.querySelector('[data-vl-page-entry]');
  if (!entry) return;

  if (ctx.reduced) {
    setVisible(entry);
    return;
  }

  animateIn(entry, { y: 14, opacity: 0.58, duration: 0.96, delay: 0.06, stagger: 0.08 });
}

export function initInternalHeader(section, ctx, cleanups) {
  const head = section?.querySelector('.sec-head');
  if (!head) return;

  const title = head.querySelector('h2.serif');
  const others = gsap.utils.toArray(head.children).filter((el) => el !== title);

  if (ctx.reduced) {
    setVisible(head.children);
    return;
  }

  if (title) {
    gsap.set(title, { opacity: 1, clearProps: 'transform' });
    const cleanup = initTextReveal(title, ctx, {
      mode: 'words',
      trigger: head,
      start: textRevealStart(ctx),
      delay: 0.05,
      duration: 0.96,
      stagger: 0.07,
    });
    if (cleanup) pushCleanup(cleanups, cleanup);
  }

  animateIn(others, {
    y: 17,
    opacity: 0.56,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });
}

export function initInternalHeroCopy(section, ctx, selector = '.fin-lede, .ai-lede, .pay-hero, .pay-sub') {
  const copy = gsap.utils.toArray(section?.querySelectorAll(selector) ?? []);
  if (!copy.length) return;

  if (ctx.reduced) {
    setVisible(copy);
    return;
  }

  animateIn(copy, {
    y: 17,
    opacity: 0.54,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.08,
  });
}

/** Reveal al scroll — activación tardía, sin reseteos que generen saltos. */
export function revealOnScroll(targets, ctx, options = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return [];

  if (ctx.reduced) {
    setVisible(items);
    return [];
  }

  const {
    y = 17,
    x = 0,
    opacity = 0.54,
    stagger = 0.12,
    duration = 0.96,
    delay = 0.04,
    trigger,
    start = triggerStart(ctx),
  } = options;

  const triggerEl = trigger || items[0];
  let played = false;
  let tween = null;

  primeHidden(items, { y, x, opacity });

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    tween = animateIn(items, { y, x, opacity, stagger, duration, delay });
  };

  if (isInViewport(triggerEl)) {
    play();
    return [];
  }

  const st = ScrollTrigger.create({
    trigger: triggerEl,
    start,
    once: true,
    onEnter: play,
  });

  if (st.progress > 0) play();

  return [st];
}

export function refreshInternalScrollTriggers({ hard = false } = {}) {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh(hard);
  });
}

export function ensureInternalPageVisible(root) {
  root?.querySelectorAll('[data-vl-gsap-root]').forEach((section) => {
    setInternalVisible(section);
  });
  setVisible(root?.querySelector('[data-vl-page-entry]'));
}

/** Oculta above-the-fold antes de animar — evita flash y rebote al cargar imágenes. */
export function prepInternalAboveFold(root) {
  const entry = root.querySelector('[data-vl-page-entry]');
  primeHidden(entry, { y: 14, opacity: 0.58 });

  root?.querySelectorAll('[data-vl-gsap-root]').forEach((section) => {
    section.querySelectorAll('.sec-head > *').forEach((el) => {
      if (el.matches('h2.serif')) {
        gsap.set(el, { opacity: 1, clearProps: 'transform' });
        return;
      }
      primeHidden(el, { y: 17, opacity: 0.56 });
    });

    primeHidden(section.querySelectorAll('.fin-lede, .ai-lede, .pay-hero, .pay-sub'), {
      y: 17,
      opacity: 0.54,
    });
  });
}
