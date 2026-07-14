import { gsap, ScrollTrigger } from '../gsap';
import {
  bindCardTilt,
  pushCleanup,
  runCountUp,
  setVisible,
} from '../home/utils';
import { STORY_EASE_OUT } from '../home/story';
import { createHomeScrollContext } from '../home/utils';

export {
  bindCardTilt,
  createHomeScrollContext as createInternalScrollContext,
  pushCleanup,
  runCountUp,
  setVisible,
};

export const INTERNAL_EASE_OUT = STORY_EASE_OUT;
export const INTERNAL_REVEAL_START = 'top 88%';

export function querySection(root, id) {
  return root?.querySelector(`[data-vl-gsap-root="${id}"]`) ?? null;
}

export function setInternalVisible(section) {
  if (!section) return;
  setVisible(section.querySelectorAll('*'));
}

function isInViewport(element, ratio = 0.98) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * ratio && rect.bottom > 8;
}

function animateIn(targets, { y = 12, x = 0, stagger = 0.06, duration = 0.62, delay = 0 } = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return;

  gsap.fromTo(
    items,
    { y, x, opacity: 1 },
    {
      y: 0,
      x: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: INTERNAL_EASE_OUT,
      clearProps: 'transform',
    },
  );
}

export function initPageEntry(root, ctx) {
  const entry = root?.querySelector('[data-vl-page-entry]');
  if (!entry) return;

  setVisible(entry);
  if (ctx.reduced) return;

  animateIn(entry, { y: 8, duration: 0.5, delay: 0.03 });
}

export function initInternalHeader(section, ctx) {
  const head = section?.querySelector('.sec-head');
  if (!head) return;

  const targets = gsap.utils.toArray(head.children).filter(Boolean);
  setVisible(targets);

  if (ctx.reduced) return;

  animateIn(targets, { y: 10, stagger: 0.05, duration: 0.55, delay: 0.04 });
}

export function initInternalHeroCopy(section, ctx, selector = '.fin-lede, .ai-lede, .pay-hero, .pay-sub') {
  const copy = gsap.utils.toArray(section?.querySelectorAll(selector) ?? []);
  if (!copy.length) return;

  setVisible(copy);
  if (ctx.reduced) return;

  animateIn(copy, { y: 10, stagger: 0.06, duration: 0.58, delay: 0.1 });
}

/** Reveal al scroll — el contenido permanece visible; solo se anima desplazamiento. */
export function revealOnScroll(targets, ctx, options = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return [];

  setVisible(items);
  if (ctx.reduced) return [];

  const {
    y = 12,
    x = 0,
    stagger = 0.07,
    duration = 0.62,
    delay = 0,
    trigger,
  } = options;

  const triggerEl = trigger || items[0];
  let played = false;

  const play = () => {
    if (played) return;
    played = true;
    animateIn(items, { y, x, stagger, duration, delay });
  };

  if (isInViewport(triggerEl)) {
    play();
    return [];
  }

  const st = ScrollTrigger.create({
    trigger: triggerEl,
    start: INTERNAL_REVEAL_START,
    once: true,
    onEnter: play,
  });

  if (st.progress > 0) play();

  return [st];
}

export function refreshInternalScrollTriggers() {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

export function ensureInternalPageVisible(root) {
  root?.querySelectorAll('[data-vl-gsap-root]').forEach((section) => {
    setInternalVisible(section);
  });
  setVisible(root?.querySelector('[data-vl-page-entry]'));
}
