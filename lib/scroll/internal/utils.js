import { gsap, ScrollTrigger } from '../gsap';
import {
  bindCardTilt,
  pushCleanup,
  runCountUp,
  setVisible,
} from '../home/utils';
import { STORY_EASE_OUT } from '../home/story';
import { createHomeScrollContext } from '../home/utils';
import { initTextReveal } from '@/lib/motion/textReveal';

export {
  bindCardTilt,
  createHomeScrollContext as createInternalScrollContext,
  pushCleanup,
  runCountUp,
  setVisible,
};

export const INTERNAL_EASE_OUT = STORY_EASE_OUT;
export const INTERNAL_REVEAL_START = 'top 86%';

export function querySection(root, id) {
  return root?.querySelector(`[data-vl-gsap-root="${id}"]`) ?? null;
}

export function setInternalVisible(section) {
  if (!section) return;
  setVisible(section.querySelectorAll('*'));
}

function isInViewport(element, ratio = 0.94) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * ratio && rect.bottom > 0;
}

function animateIn(
  targets,
  {
    y = 18,
    x = 0,
    opacity = 0.55,
    stagger = 0.08,
    duration = 0.82,
    delay = 0,
  } = {},
) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return;

  gsap.fromTo(
    items,
    { y, x, opacity },
    {
      y: 0,
      x: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: INTERNAL_EASE_OUT,
      clearProps: 'transform,opacity',
    },
  );
}

export function initPageEntry(root, ctx) {
  const entry = root?.querySelector('[data-vl-page-entry]');
  if (!entry) return;

  setVisible(entry);
  if (ctx.reduced) return;

  animateIn(entry, { y: 14, opacity: 0.58, duration: 0.78, delay: 0.04 });
}

export function initInternalHeader(section, ctx, cleanups) {
  const head = section?.querySelector('.sec-head');
  if (!head) return;

  const title = head.querySelector('h2.serif');
  const others = gsap.utils.toArray(head.children).filter((el) => el !== title);

  setVisible(head.children);
  if (ctx.reduced) return;

  if (title) {
    const cleanup = initTextReveal(title, ctx, {
      mode: 'words',
      trigger: head,
      start: INTERNAL_REVEAL_START,
      delay: 0.04,
    });
    if (cleanup) pushCleanup(cleanups, cleanup);
  }

  animateIn(others, { y: 16, opacity: 0.56, stagger: 0.07, duration: 0.84, delay: 0.02 });
}

export function initInternalHeroCopy(section, ctx, selector = '.fin-lede, .ai-lede, .pay-hero, .pay-sub') {
  const copy = gsap.utils.toArray(section?.querySelectorAll(selector) ?? []);
  if (!copy.length) return;

  setVisible(copy);
  if (ctx.reduced) return;

  animateIn(copy, { y: 18, opacity: 0.54, stagger: 0.07, duration: 0.84, delay: 0.08 });
}

/** Reveal al scroll — opacidad moderada y desplazamiento perceptible. */
export function revealOnScroll(targets, ctx, options = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return [];

  setVisible(items);
  if (ctx.reduced) return [];

  const {
    y = 18,
    x = 0,
    opacity = 0.54,
    stagger = 0.08,
    duration = 0.84,
    delay = 0,
    trigger,
  } = options;

  const triggerEl = trigger || items[0];
  let played = false;

  const play = () => {
    if (played) return;
    played = true;
    animateIn(items, { y, x, opacity, stagger, duration, delay });
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
