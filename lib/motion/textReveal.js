import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { STORY_EASE_OUT } from '@/lib/scroll/home/story';
import { pushCleanup } from '@/lib/scroll/home/utils';
import { prefersReducedMotion, MOBILE_VIEWPORT_QUERY } from '@/lib/motion/tokens';

const REVEAL_START = 'top 86%';

function isInViewport(element, ratio = 0.92) {
  if (!element || typeof window === 'undefined') return false;
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * ratio && rect.bottom > 0;
}

function storeOriginal(element) {
  if (element.dataset.vlTextOriginal === undefined) {
    element.dataset.vlTextOriginal = element.innerHTML;
  }
}

export function restoreTextReveal(element) {
  if (!element) return;
  const html = element.dataset.vlTextOriginal;
  if (html !== undefined) {
    element.innerHTML = html;
    delete element.dataset.vlTextOriginal;
  }
  element.classList.remove('vl-text-reveal');
  gsap.set(element, { clearProps: 'opacity,transform' });
}

function wrapTextNodes(element) {
  storeOriginal(element);
  element.classList.add('vl-text-reveal');

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent?.length) textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part.trim()) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const word = document.createElement('span');
      word.className = 'vl-split-word';
      const inner = document.createElement('span');
      inner.className = 'vl-split-word__inner';
      inner.textContent = part;
      word.appendChild(inner);
      fragment.appendChild(word);
    });

    node.parentNode?.replaceChild(fragment, node);
  });
}

function groupIntoLines(element) {
  const words = [...element.querySelectorAll('.vl-split-word')];
  if (!words.length) return;

  const lines = [];
  let line = [];
  let top = null;

  words.forEach((word) => {
    const wordTop = Math.round(word.offsetTop);
    if (top !== null && wordTop > top + 2) {
      lines.push(line);
      line = [];
    }
    line.push(word);
    top = wordTop;
  });

  if (line.length) lines.push(line);

  lines.forEach((lineWords) => {
    const wrapper = document.createElement('span');
    wrapper.className = 'vl-split-line';
    const inner = document.createElement('span');
    inner.className = 'vl-split-line__inner';

    const first = lineWords[0];
    first.parentNode?.insertBefore(wrapper, first);
    inner.append(...lineWords);
    wrapper.appendChild(inner);
  });
}

function getRevealUnits(element, mode) {
  if (mode === 'lines') {
    return gsap.utils.toArray(element.querySelectorAll('.vl-split-line__inner'));
  }
  return gsap.utils.toArray(element.querySelectorAll('.vl-split-word__inner'));
}

function buildSplit(element, mode) {
  restoreTextReveal(element);
  wrapTextNodes(element);
  if (mode === 'lines') groupIntoLines(element);
  return getRevealUnits(element, mode);
}

/**
 * Revelado por palabras o líneas — GSAP sobre spans internos, no sobre el nodo de texto raíz.
 */
export function initTextReveal(element, ctx, options = {}) {
  if (!element) return () => {};

  if (ctx?.reduced || prefersReducedMotion()) {
    restoreTextReveal(element);
    return () => {};
  }

  const {
    mode = 'words',
    trigger,
    start = REVEAL_START,
    once = true,
    delay = 0,
    duration = 0.82,
    stagger = mode === 'lines' ? 0.11 : 0.055,
  } = options;

  let units = buildSplit(element, mode);
  if (!units.length) return () => {};

  gsap.set(element, { opacity: 1 });
  gsap.set(units, {
    y: mode === 'lines' ? 16 : '110%',
    opacity: mode === 'lines' ? 0.52 : 0.48,
  });

  const triggerEl = trigger || element;
  let played = false;
  let tween = null;
  let scrollTrigger = null;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    scrollTrigger?.kill();

    tween = gsap.to(units, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: STORY_EASE_OUT,
      clearProps: 'transform,opacity',
    });
  };

  if (isInViewport(triggerEl)) {
    play();
  } else {
    scrollTrigger = ScrollTrigger.create({
      trigger: triggerEl,
      start,
      once,
      onEnter: play,
    });
    if (scrollTrigger.progress > 0) play();
  }

  let resizeTimer = 0;
  const onResize = () => {
    if (!element.isConnected) {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      return;
    }
    if (played) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      scrollTrigger?.kill();
      tween?.kill();
      units = buildSplit(element, mode);
      if (!units.length) return;
      gsap.set(units, {
        y: mode === 'lines' ? 16 : '110%',
        opacity: mode === 'lines' ? 0.52 : 0.48,
      });
      scrollTrigger = ScrollTrigger.create({
        trigger: triggerEl,
        start,
        once,
        onEnter: play,
      });
      if (scrollTrigger.progress > 0) play();
    }, 180);
  };

  window.addEventListener('resize', onResize);

  return () => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
    scrollTrigger?.kill();
    tween?.kill();
    restoreTextReveal(element);
  };
}

const HOME_TEXT_TARGETS = [
  { sel: '[data-vl-home-section="metrics"] .sec-head h2', mode: 'words', mobileOnly: false },
  { sel: '[data-vl-home-section="solutions"] .sec-head h2', mode: 'words', mobileOnly: true },
  { sel: '[data-vl-home-section="process"] .sec-head h2', mode: 'words', mobileOnly: true },
  { sel: '[data-vl-home-section="contact"] .cta-grid > div:first-child h2', mode: 'words', mobileOnly: false },
];

export function initHomeTextReveals(root, ctx, cleanups) {
  if (!root || ctx?.reduced) return;

  HOME_TEXT_TARGETS.forEach(({ sel, mode, mobileOnly }) => {
    if (mobileOnly && !ctx.mobile) return;

    const el = root.querySelector(sel);
    if (!el) return;

    gsap.set(el, { opacity: 1, clearProps: 'transform,x,y,clipPath' });

    const section = el.closest('section') || el;
    const start = ctx.mobile ? 'top 82%' : 'top 78%';
    const cleanup = initTextReveal(el, ctx, { mode, trigger: section, start });
    pushCleanup(cleanups, cleanup);
  });
}

export function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}
