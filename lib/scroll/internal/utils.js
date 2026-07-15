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
const INTRO_SELECTOR = '.fin-lede, .ai-lede, .pay-hero, .pay-sub';

function isInViewport(element, ratio = IMMEDIATE_VIEWPORT_RATIO) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  const visibleTop = window.innerHeight * ratio;
  return rect.top < visibleTop && rect.bottom > window.innerHeight * 0.08;
}

function getVisibleSecHead(section) {
  const heads = gsap.utils.toArray(section?.querySelectorAll('.sec-head') ?? []);
  return heads.find((head) => head.getClientRects().length > 0) || heads[0] || null;
}

export function collectInternalIntroTargets(root) {
  const entry = root?.querySelector('[data-vl-page-entry]');
  const section = root?.querySelector('[data-vl-gsap-root]');
  if (!section) {
    return { ordered: entry ? [entry] : [] };
  }

  const head = getVisibleSecHead(section);
  const title = head?.querySelector('h2.serif, h2');
  const headExtras = gsap.utils.toArray(head?.children ?? []).filter((el) => el !== title);
  const lede = gsap.utils.toArray(section.querySelectorAll(INTRO_SELECTOR));

  const ordered = [entry, ...headExtras, title, ...lede].filter(Boolean);
  return { ordered, section, head, title, headExtras, lede };
}

/** Oculta intro antes del paint — evita flash al terminar la transición de ruta. */
export function stashInternalIntroBeforePaint(root) {
  const { ordered } = collectInternalIntroTargets(root);
  if (!ordered.length) return;

  gsap.killTweensOf(ordered);
  gsap.set(ordered, {
    opacity: 0,
    y: 12,
    force3D: true,
    transformOrigin: '50% 50%',
  });
}

/** Una sola entrada coordinada — sin amagues ni animaciones superpuestas. */
export function runInternalAboveFoldIntro(root, ctx) {
  if (ctx.reduced) {
    ensureInternalPageVisible(root);
    return null;
  }

  const { ordered } = collectInternalIntroTargets(root);
  if (!ordered.length) return null;

  gsap.killTweensOf(ordered);

  return gsap.fromTo(
    ordered,
    { opacity: 0, y: 12, force3D: true },
    {
      opacity: 1,
      y: 0,
      duration: 0.94,
      stagger: 0.07,
      delay: 0.03,
      ease: INTERNAL_EASE_OUT,
      force3D: true,
      overwrite: 'auto',
    },
  );
}

function primeHidden(targets, { y = 17, x = 0, opacity = 0 } = {}) {
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
    opacity = 0,
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

/** Reveal al scroll — solo below-the-fold. */
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
    opacity = 0,
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
    tween = animateIn(items, { y, x, opacity: 0, stagger, duration, delay });
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

export function setInternalVisible(section) {
  if (!section) return;
  setVisible(section.querySelectorAll('*'));
}

export function ensureInternalPageVisible(root) {
  root?.querySelectorAll('[data-vl-gsap-root]').forEach((section) => {
    setInternalVisible(section);
  });
  setVisible(root?.querySelector('[data-vl-page-entry]'));
}

export function querySection(root, id) {
  return root?.querySelector(`[data-vl-gsap-root="${id}"]`) ?? null;
}
