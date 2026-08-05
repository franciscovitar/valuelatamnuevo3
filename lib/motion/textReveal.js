import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import {
  MOTION_SYSTEM,
  prefersReducedMotion,
  MOBILE_VIEWPORT_QUERY,
} from '@/lib/motion/tokens';
import {
  pushCleanup,
  textRevealStart,
} from '@/lib/scroll/home/utils';

const IMMEDIATE_VIEWPORT_RATIO = 0.74;

function isInViewport(
  element,
  ratio = IMMEDIATE_VIEWPORT_RATIO
) {
  if (!element || typeof window === 'undefined') {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const visibleTop = window.innerHeight * ratio;

  return (
    rect.top < visibleTop
    && rect.bottom > window.innerHeight * 0.08
  );
}

function storeOriginal(element) {
  if (
    element.dataset.vlTextOriginal
    === undefined
  ) {
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

  gsap.set(element, {
    clearProps: 'opacity,transform',
  });
}

function wrapTextNodes(element) {
  storeOriginal(element);
  element.classList.add('vl-text-reveal');

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT
  );
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node.textContent?.length) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part.trim()) {
        fragment.appendChild(
          document.createTextNode(part)
        );
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
  const words = [
    ...element.querySelectorAll('.vl-split-word'),
  ];

  if (!words.length) return;

  const lines = [];
  let line = [];
  let top = null;

  words.forEach((word) => {
    const wordTop = Math.round(word.offsetTop);

    if (
      top !== null
      && wordTop > top + 2
    ) {
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
    return gsap.utils.toArray(
      element.querySelectorAll(
        '.vl-split-line__inner'
      )
    );
  }

  return gsap.utils.toArray(
    element.querySelectorAll(
      '.vl-split-word__inner'
    )
  );
}

function buildSplit(element, mode) {
  restoreTextReveal(element);
  wrapTextNodes(element);

  if (mode === 'lines') {
    groupIntoLines(element);
  }

  return getRevealUnits(element, mode);
}

export function initTextReveal(
  element,
  ctx,
  options = {}
) {
  if (!element) return () => {};

  if (
    ctx?.reduced
    || prefersReducedMotion()
  ) {
    restoreTextReveal(element);
    return () => {};
  }

  const {
    mode = 'words',
    trigger,
    start = textRevealStart(ctx),
    once = true,
    delay = 0.03,
    duration = MOTION_SYSTEM.reveal,
    stagger = mode === 'lines'
      ? MOTION_SYSTEM.stagger
      : MOTION_SYSTEM.wordStagger,
  } = options;

  let units = buildSplit(element, mode);

  if (!units.length) return () => {};

  gsap.set(element, { opacity: 1 });
  gsap.set(units, {
    y: mode === 'lines'
      ? MOTION_SYSTEM.distance
      : MOTION_SYSTEM.minorDistance,
    opacity: 0,
  });

  const triggerElement = trigger || element;
  let tween = null;
  let scrollTrigger = null;

  const play = () => {
    tween?.kill();

    tween = gsap.to(units, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: MOTION_SYSTEM.easeOut,
      clearProps: 'transform,opacity',
    });
  };

  if (isInViewport(triggerElement)) {
    play();
  } else {
    scrollTrigger = ScrollTrigger.create({
      trigger: triggerElement,
      start,
      once,
      onEnter: play,
      onEnterBack: once
        ? undefined
        : play,
      onLeaveBack: once
        ? undefined
        : () => tween?.reverse(),
    });

    if (scrollTrigger.progress > 0) {
      play();
    }
  }

  let resizeTimer = 0;

  const onResize = () => {
    if (!element.isConnected) {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      return;
    }

    if (scrollTrigger?.progress > 0) return;

    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      scrollTrigger?.kill();
      tween?.kill();

      units = buildSplit(element, mode);

      if (!units.length) return;

      gsap.set(units, {
        y: mode === 'lines'
          ? MOTION_SYSTEM.distance
          : MOTION_SYSTEM.minorDistance,
        opacity: 0,
      });

      scrollTrigger = ScrollTrigger.create({
        trigger: triggerElement,
        start,
        once,
        onEnter: play,
      });

      if (scrollTrigger.progress > 0) {
        play();
      }
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

const HOME_TEXT_TARGETS = [];

export function initHomeTextReveals(
  root,
  ctx,
  cleanups
) {
  if (!root || ctx?.reduced) return;

  HOME_TEXT_TARGETS.forEach(
    ({ sel, mode, mobileOnly }) => {
      if (mobileOnly && !ctx.mobile) return;

      const element = root.querySelector(sel);

      if (!element) return;

      gsap.set(element, {
        opacity: 1,
        clearProps: 'transform,x,y,clipPath',
      });

      const trigger = (
        element.closest('.sec-head')
        || element.closest(
          '.cta-grid > div:first-child'
        )
        || element
      );

      const cleanup = initTextReveal(
        element,
        ctx,
        {
          mode,
          trigger,
          start: textRevealStart(ctx),
        }
      );

      pushCleanup(cleanups, cleanup);
    }
  );
}

export function isMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(
    MOBILE_VIEWPORT_QUERY
  ).matches;
}
