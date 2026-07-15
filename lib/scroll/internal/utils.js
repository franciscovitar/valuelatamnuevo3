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
const INTRO_STATE_ATTR = 'data-vl-internal-intro-state';

function uniqueElements(elements) {
  return [...new Set(elements.filter(Boolean))];
}

function isInViewport(element, ratio = IMMEDIATE_VIEWPORT_RATIO) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  const visibleTop = window.innerHeight * ratio;
  return rect.top < visibleTop && rect.bottom > window.innerHeight * 0.08;
}

function getVisibleSecHead(section) {
  const heads = gsap.utils.toArray(section?.querySelectorAll('.sec-head') ?? []);
  return heads.find((head) => head.offsetParent !== null) || heads[0] || null;
}

function collectTopLede(container) {
  if (!container) return null;

  return (
    container.querySelector(':scope > .fin-lede')
    || container.querySelector(':scope > .ai-lede')
    || container.querySelector(':scope > .pay-hero')
  );
}

export function collectInternalIntroTargets(root) {
  const ordered = [];
  const entry = root?.querySelector('[data-vl-page-entry]');
  if (entry) ordered.push(entry);

  const section = root?.querySelector('[data-vl-gsap-root]');
  if (!section) return uniqueElements(ordered);

  const head = getVisibleSecHead(section);
  if (head) {
    Array.from(head.children).forEach((child) => {
      ordered.push(child);
    });
  }

  const lede = collectTopLede(head?.parentElement);
  if (lede) ordered.push(lede);

  return uniqueElements(ordered);
}

function clearIntroState(root) {
  collectInternalIntroTargets(root).forEach((el) => {
    gsap.killTweensOf(el);
    el.removeAttribute(INTRO_STATE_ATTR);
    gsap.set(el, { clearProps: 'opacity,transform' });
  });
}

/** Oculta intro antes del paint — una sola vez por pathname, idempotente. */
export function stashInternalIntroBeforePaint(root) {
  const ordered = collectInternalIntroTargets(root);
  if (!ordered.length) return;

  ordered.forEach((el) => {
    const state = el.getAttribute(INTRO_STATE_ATTR);
    if (state === 'done' || state === 'playing') return;

    gsap.killTweensOf(el);
    gsap.set(el, {
      opacity: 0,
      y: 12,
      force3D: true,
      transformOrigin: '50% 50%',
    });
    el.setAttribute(INTRO_STATE_ATTR, 'stashed');
  });
}

/** Una sola entrada coordinada — propietario exclusivo del intro superior. */
export function runInternalAboveFoldIntro(root, ctx) {
  if (ctx.reduced) {
    clearIntroState(root);
    ensureInternalPageVisible(root);
    return null;
  }

  const targets = collectInternalIntroTargets(root).filter(
    (el) => el.getAttribute(INTRO_STATE_ATTR) === 'stashed',
  );
  if (!targets.length) return null;

  targets.forEach((el) => {
    el.setAttribute(INTRO_STATE_ATTR, 'playing');
  });

  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.94,
    stagger: 0.08,
    delay: 0.02,
    ease: INTERNAL_EASE_OUT,
    force3D: true,
    overwrite: 'auto',
    onComplete: () => {
      targets.forEach((el) => {
        el.setAttribute(INTRO_STATE_ATTR, 'done');
        gsap.set(el, { clearProps: 'opacity,transform' });
      });
    },
  });
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
