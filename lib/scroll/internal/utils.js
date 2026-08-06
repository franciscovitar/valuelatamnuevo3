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
import { MOTION_SYSTEM } from '@/lib/motion/tokens';

export {
  bindCardTilt,
  createHomeScrollContext as createInternalScrollContext,
  pushCleanup,
  runCountUp,
  setVisible,
  textRevealStart,
  triggerStart,
};

export const INTERNAL_EASE_OUT = MOTION_SYSTEM.easeOut;

const IMMEDIATE_VIEWPORT_RATIO = 0.74;
const INTRO_STATE_ATTR = 'data-vl-internal-intro-state';

function uniqueElements(elements) {
  return [...new Set(elements.filter(Boolean))];
}

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

function getVisibleSecHead(section) {
  const heads = gsap.utils.toArray(
    section?.querySelectorAll('.sec-head') ?? []
  );

  return (
    heads.find((head) => head.offsetParent !== null)
    || heads[0]
    || null
  );
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
  const entry = root?.querySelector(
    '[data-vl-page-entry]'
  );

  if (entry) ordered.push(entry);

  const section = root?.querySelector(
    '[data-vl-gsap-root]'
  );

  if (!section) {
    return uniqueElements(ordered);
  }

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
  collectInternalIntroTargets(root).forEach((element) => {
    gsap.killTweensOf(element);
    element.removeAttribute(INTRO_STATE_ATTR);
    gsap.set(element, {
      clearProps: 'opacity,transform',
    });
  });
}

export function stashInternalIntroBeforePaint(root) {
  const ordered = collectInternalIntroTargets(root);

  if (!ordered.length) return;

  ordered.forEach((element) => {
    const state = element.getAttribute(
      INTRO_STATE_ATTR
    );

    if (
      state === 'done'
      || state === 'playing'
    ) {
      return;
    }

    gsap.killTweensOf(element);
    gsap.set(element, {
      opacity: 0,
      y: 12,
      force3D: true,
      transformOrigin: '50% 50%',
    });
    element.setAttribute(
      INTRO_STATE_ATTR,
      'stashed'
    );
  });
}

function storeOriginalInline(element) {
  if (
    element.dataset.vlTextOriginal
    === undefined
  ) {
    element.dataset.vlTextOriginal = element.innerHTML;
  }
}

function playIntroLineMask(
  title,
  timeline,
  at = 0.08
) {
  if (!title) return;

  storeOriginalInline(title);
  title.classList.add('vl-line-mask');

  const text = title.textContent.trim();

  title.textContent = '';

  const line = document.createElement('span');
  line.className = 'vl-tx-line';

  const inner = document.createElement('span');
  inner.className = 'vl-tx-line__inner';
  inner.textContent = text;

  line.appendChild(inner);
  title.appendChild(line);

  gsap.set(inner, {
    y: 14,
    opacity: 0,
  });

  timeline.to(
    inner,
    {
      y: 0,
      opacity: 1,
      duration: MOTION_SYSTEM.title,
      ease: INTERNAL_EASE_OUT,
    },
    at
  );
}

function playIntroPhrases(
  lede,
  timeline,
  at = 0.14
) {
  if (!lede) return;

  storeOriginalInline(lede);

  const raw = lede.textContent.trim();
  const parts = raw
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  lede.textContent = '';

  const spans = parts.map((part, index) => {
    const span = document.createElement('span');
    span.className = 'vl-tx-phrase';
    span.textContent = (
      part
      + (index < parts.length - 1 ? ' ' : '')
    );

    lede.appendChild(span);

    gsap.set(span, {
      opacity: 0,
      y: MOTION_SYSTEM.minorDistance,
    });

    return span;
  });

  timeline.to(
    spans,
    {
      opacity: 1,
      y: 0,
      duration: MOTION_SYSTEM.reveal,
      stagger: MOTION_SYSTEM.stagger,
      ease: INTERNAL_EASE_OUT,
    },
    at
  );
}

export function runInternalAboveFoldIntro(root, ctx) {
  if (ctx.reduced) {
    clearIntroState(root);
    ensureInternalPageVisible(root);
    return null;
  }

  const targets = collectInternalIntroTargets(root).filter(
    (element) => (
      element.getAttribute(INTRO_STATE_ATTR)
      === 'stashed'
    )
  );

  if (!targets.length) return null;

  const backLink = targets.find((element) => (
    element.matches(
      '[data-vl-page-entry], .page-back, .page-back a'
    )
  ));
  const eyebrow = targets.find((element) => (
    element.matches('.eyebrow')
  ));
  const title = targets.find((element) => (
    element.matches('h1, h2')
  ));
  const lede = targets.find((element) => (
    element.matches(
      '.fin-lede, .ai-lede, .pay-hero, .lead'
    )
    || (
      element.matches('p')
      && !element.closest('.sec-head')
    )
  ));

  targets.forEach((element) => {
    element.setAttribute(
      INTRO_STATE_ATTR,
      'playing'
    );

    gsap.set(element, {
      opacity: 1,
      y: 0,
      x: 0,
    });
  });

  const timeline = gsap.timeline({
    defaults: {
      ease: INTERNAL_EASE_OUT,
      force3D: true,
      overwrite: 'auto',
    },
    onComplete: () => {
      targets.forEach((element) => {
        element.setAttribute(
          INTRO_STATE_ATTR,
          'done'
        );

        gsap.set(element, {
          clearProps: 'opacity,transform,x,y',
        });
      });
    },
  });

  if (backLink) {
    gsap.set(backLink, {
      opacity: 0,
      x: -8,
    });

    timeline.to(
      backLink,
      {
        opacity: 1,
        x: 0,
        duration: MOTION_SYSTEM.reveal,
      },
      0
    );
  }

  if (eyebrow) {
    gsap.set(eyebrow, {
      opacity: 0,
      y: MOTION_SYSTEM.minorDistance,
    });

    timeline.to(
      eyebrow,
      {
        opacity: 1,
        y: 0,
        duration: MOTION_SYSTEM.reveal,
      },
      0.03
    );
  }

  playIntroLineMask(title, timeline, 0.08);
  playIntroPhrases(lede, timeline, 0.14);

  return timeline;
}

function primeHidden(
  targets,
  {
    y = MOTION_SYSTEM.distance,
    x = 0,
    opacity = 0,
  } = {}
) {
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
    y = MOTION_SYSTEM.distance,
    x = 0,
    opacity = 0,
    stagger = MOTION_SYSTEM.stagger,
    duration = MOTION_SYSTEM.reveal,
    delay = 0.03,
  } = {}
) {
  const items = primeHidden(
    targets,
    { y, x, opacity }
  );

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

  root?.querySelectorAll('img').forEach((image) => {
    if (!image.complete) {
      image.addEventListener(
        'load',
        refresh,
        { once: true }
      );
      image.addEventListener(
        'error',
        refresh,
        { once: true }
      );
    }
  });

  pushCleanup(
    cleanups,
    () => window.clearTimeout(timer)
  );
}

export function revealOnScroll(
  targets,
  ctx,
  options = {}
) {
  const items = gsap.utils.toArray(targets);

  if (!items.length) return [];

  if (ctx.reduced) {
    setVisible(items);
    return [];
  }

  const {
    y = MOTION_SYSTEM.distance,
    x = 0,
    opacity = 0,
    stagger = MOTION_SYSTEM.stagger,
    duration = MOTION_SYSTEM.reveal,
    delay = 0.03,
    trigger,
    start = triggerStart(ctx),
    reversible = false,
  } = options;

  const triggerElement = trigger || items[0];

  if (isInViewport(triggerElement)) {
    animateIn(
      items,
      {
        y,
        x,
        opacity,
        stagger,
        duration,
        delay,
      }
    );

    return [];
  }

  primeHidden(items, {
    y,
    x,
    opacity,
  });

  const tween = gsap.to(items, {
    x: 0,
    y: 0,
    opacity: 1,
    duration,
    stagger,
    delay,
    paused: true,
    ease: INTERNAL_EASE_OUT,
    force3D: true,
    overwrite: 'auto',
  });

  const triggerInstance = ScrollTrigger.create({
    trigger: triggerElement,
    start,
    once: !reversible,
    onEnter: () => tween.play(),
    onEnterBack: reversible
      ? () => tween.play()
      : undefined,
    onLeaveBack: reversible
      ? () => tween.reverse()
      : undefined,
  });

  if (triggerInstance.progress > 0) {
    tween.play();
  }

  return [triggerInstance, tween];
}

export function refreshInternalScrollTriggers(
  { hard = false } = {}
) {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh(hard);
  });
}

export function setInternalVisible(section) {
  if (!section) return;

  setVisible(section.querySelectorAll('*'));
}

export function ensureInternalPageVisible(root) {
  root?.querySelectorAll(
    '[data-vl-gsap-root]'
  ).forEach((section) => {
    setInternalVisible(section);
  });

  setVisible(
    root?.querySelector('[data-vl-page-entry]')
  );
}

export function querySection(root, id) {
  return (
    root?.querySelector(
      `[data-vl-gsap-root="${id}"]`
    )
    ?? null
  );
}
