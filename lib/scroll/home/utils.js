import { gsap, ScrollTrigger } from '../gsap';
import { SCROLL_ANCHOR_OFFSET } from '../config';
import {
  BLUR_CLEAR_PROPS,
  MOBILE_VIEWPORT_QUERY,
  MOTION_SYSTEM,
  motionTier,
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
    filter: 'blur(0px)',
    clipPath: 'inset(0% 0% 0% 0%)',
    clearProps: 'transform,opacity,clipPath,filter',
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

  const tier = motionTier(options.tier ?? 'base', ctx);

  const {
    y = tier.distance,
    x = 0,
    blur = tier.blur,
    stagger = tier.stagger,
    duration = tier.duration,
    delay = 0.03,
    ease = tier.ease,
    trigger,
    reversible = false,
  } = options;

  return gsap.from(items, {
    opacity: 0,
    y,
    x,
    ...(blur > 0 ? { filter: `blur(${blur}px)` } : null),
    stagger,
    duration,
    delay,
    ease,
    immediateRender: true,
    // clearProps borraría el estado que el reverse necesita reconstruir.
    ...(reversible ? null : { clearProps: BLUR_CLEAR_PROPS }),
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

/**
 * Reveal in groups instead of one flat stagger. Cards arriving as 2-3 clusters
 * read as composed; the same cards arriving in single file read as a list.
 */
export function revealInGroups(
  targets,
  ctx,
  options = {}
) {
  const items = gsap.utils.toArray(targets);

  if (!items.length || ctx.reduced) {
    setVisible(items);
    return null;
  }

  const tier = motionTier(options.tier ?? 'base', ctx);
  const {
    groupSize = 2,
    groupGap = 0.16,
    y = tier.distance,
    blur = tier.blur,
    scale = 0.985,
    duration = tier.duration,
    stagger = 0.06,
    trigger,
  } = options;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger || items[0],
      start: triggerStart(ctx),
      once: true,
    },
  });

  for (let i = 0; i < items.length; i += groupSize) {
    const group = items.slice(i, i + groupSize);

    tl.from(
      group,
      {
        opacity: 0,
        y,
        scale,
        ...(blur > 0 ? { filter: `blur(${blur}px)` } : null),
        duration,
        stagger,
        ease: tier.ease,
        clearProps: BLUR_CLEAR_PROPS,
      },
      (i / groupSize) * groupGap
    );
  }

  return tl;
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
