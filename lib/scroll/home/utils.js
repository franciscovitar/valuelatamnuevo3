import { gsap, ScrollTrigger } from '../gsap';
import { SCROLL_ANCHOR_OFFSET } from '../config';
import {
  MOBILE_VIEWPORT_QUERY,
  MOTION_SYSTEM,
  prefersReducedMotion,
} from '@/lib/motion/tokens';

export function createHomeScrollContext() {
  const reduced = prefersReducedMotion();
  const mobile = typeof window !== 'undefined'
    ? window.matchMedia(MOBILE_VIEWPORT_QUERY).matches
    : false;

  return {
    reduced,
    mobile,
    advanced: !reduced && !mobile,
  };
}

export function triggerStart(ctx) {
  return ctx.mobile ? 'top 82%' : 'top 78%';
}

export function textRevealStart(ctx) {
  return ctx.mobile ? 'top 80%' : 'top 74%';
}

export function storySegmentTimes(
  count,
  { intro = 0.06, body = 1 } = {}
) {
  const segment = body / count;

  return {
    intro,
    body,
    segment,
    total: intro + body,
  };
}

export function pinnedStoryConfig(
  section,
  pin,
  {
    end = '+=100%',
    scrub = MOTION_SYSTEM.scrub,
    onRefresh,
    onUpdate,
  } = {}
) {
  const syncPinState = (self) => {
    section.classList.toggle(
      'is-vl-pinned',
      self.isActive
    );
  };

  return {
    trigger: section,
    start: `top top+=${SCROLL_ANCHOR_OFFSET}`,
    end,
    pin,
    pinSpacing: true,
    scrub,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate,
    onToggle: syncPinState,
    onLeave: () => {
      section.classList.remove('is-vl-pinned');
    },
    onLeaveBack: () => {
      section.classList.remove('is-vl-pinned');
    },
    onRefresh: () => onRefresh?.(),
  };
}

export function fitPinnedStoryStage(
  stage,
  cleanups,
  {
    offset = SCROLL_ANCHOR_OFFSET,
    margin = 20,
  } = {}
) {
  if (!stage) return () => {};

  const fit = () => {
    gsap.set(stage, { clearProps: 'scale' });

    const available = (
      window.innerHeight
      - offset
      - margin * 2
    );
    const measured = stage.offsetHeight;

    if (measured > available) {
      const scale = Math.max(
        0.86,
        available / measured
      );

      gsap.set(stage, {
        scale,
        transformOrigin: '50% 0',
      });
    }
  };

  fit();
  ScrollTrigger.addEventListener('refresh', fit);

  pushCleanup(
    cleanups,
    () => ScrollTrigger.removeEventListener(
      'refresh',
      fit
    )
  );

  return fit;
}

export function pushCleanup(cleanups, fn) {
  if (typeof fn === 'function') {
    cleanups.push(fn);
  }
}

export function setVisible(elements) {
  const targets = gsap.utils.toArray(elements);

  if (!targets.length) return;

  gsap.set(targets, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    clearProps: 'transform,opacity,clipPath',
  });
}

export function setAllHomeVisible(root) {
  const sections = root.querySelectorAll(
    '[data-vl-gsap-root]'
  );

  sections.forEach((section) => {
    setVisible(section.querySelectorAll('*'));
  });

  const footer = document.querySelector(
    'footer[data-vl-gsap-root]'
  );

  if (footer) {
    setVisible(footer.querySelectorAll('*'));
  }
}

export function revealOnce(
  targets,
  ctx,
  options = {}
) {
  const items = gsap.utils.toArray(targets);

  if (!items.length || ctx.reduced) {
    setVisible(items);
    return null;
  }

  const {
    y = MOTION_SYSTEM.distance,
    x = 0,
    stagger = MOTION_SYSTEM.stagger,
    duration = MOTION_SYSTEM.reveal,
    delay = 0.03,
    trigger,
    reversible = false,
  } = options;

  return gsap.from(items, {
    opacity: 0,
    y,
    x,
    stagger,
    duration,
    delay,
    ease: MOTION_SYSTEM.easeOut,
    immediateRender: true,
    scrollTrigger: {
      trigger: trigger || items[0],
      start: triggerStart(ctx),
      once: !reversible,
      toggleActions: reversible
        ? 'play none none reverse'
        : 'play none none none',
    },
  });
}

/*
 * Decorative parallax is disabled by default. It can only be used
 * by an explicitly narrative component.
 */
export function scrubParallax(
  target,
  trigger,
  ctx,
  {
    y = 8,
    scrub = MOTION_SYSTEM.scrub,
    enabled = false,
  } = {}
) {
  if (
    !enabled
    || ctx.reduced
    || !target
  ) {
    return null;
  }

  return gsap.fromTo(
    target,
    { y: y * 0.25 },
    {
      y: -y,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top 88%',
        end: 'bottom 18%',
        scrub,
      },
    }
  );
}

export function runCountUp(
  element,
  target,
  ctx,
  {
    duration = MOTION_SYSTEM.title,
    decimals = 0,
  } = {}
) {
  if (!element) return null;

  const numericTarget = Number(target) || 0;

  if (ctx.reduced) {
    element.textContent = numericTarget.toFixed(decimals);
    return null;
  }

  const counter = { value: 0 };

  return gsap.to(counter, {
    value: numericTarget,
    duration,
    ease: MOTION_SYSTEM.easeOut,
    snap: decimals === 0
      ? { value: 1 }
      : undefined,
    onUpdate: () => {
      element.textContent = counter.value.toFixed(decimals);
    },
  });
}

/*
 * Perspective tilt and moving pointer glows were a second motion
 * language. Cards now rely on the shared 200ms CSS hover state.
 */
export function bindCardTilt(card) {
  if (!card) return () => {};

  card.querySelector('.vl-card-glow')?.remove();
  gsap.set(card, {
    clearProps: 'transform,transformPerspective',
  });

  return () => {};
}
