import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import {
  MOTION_SYSTEM,
  prefersReducedMotion,
} from '@/lib/motion/tokens';
import { triggerStart } from '@/lib/scroll/home/utils';

export function initClipReveal(
  element,
  ctx,
  options = {}
) {
  if (!element) return () => {};

  if (
    ctx?.reduced
    || prefersReducedMotion()
  ) {
    gsap.set(element, {
      opacity: 1,
      x: 0,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      clearProps: 'transform,clipPath',
    });

    return () => {};
  }

  /*
   * All old directional wipes now use the same precise fade-up.
   * The direction option remains accepted for API compatibility.
   */
  const y = options.y ?? MOTION_SYSTEM.distance;
  const duration = options.duration
    ?? MOTION_SYSTEM.reveal;
  const trigger = options.trigger || element;
  const reversible = options.once === false
    || options.reversible === true;

  gsap.set(element, {
    opacity: options.fromOpacity ?? 0,
    x: 0,
    y,
    clipPath: 'inset(0% 0% 0% 0%)',
  });

  const tween = gsap.to(element, {
    opacity: 1,
    x: 0,
    y: 0,
    duration,
    paused: true,
    ease: options.ease ?? MOTION_SYSTEM.easeOut,
    clearProps: 'transform,clipPath',
    overwrite: 'auto',
  });

  const scrollTrigger = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: !reversible,
    onEnter: () => tween.play(),
    onEnterBack: reversible
      ? () => tween.play()
      : undefined,
    onLeaveBack: reversible
      ? () => tween.reverse()
      : undefined,
  });

  if (scrollTrigger.progress > 0) {
    tween.play();
  }

  return () => {
    scrollTrigger.kill();
    tween.kill();

    gsap.set(element, {
      clearProps: 'transform,clipPath,opacity',
    });
  };
}

export function initDrawLine(
  element,
  ctx,
  options = {}
) {
  if (!element) return () => {};

  if (
    ctx?.reduced
    || prefersReducedMotion()
  ) {
    gsap.set(element, {
      scaleX: 1,
      scaleY: 1,
      clearProps: 'transform',
    });

    return () => {};
  }

  const axis = options.axis ?? 'x';
  const property = axis === 'y'
    ? 'scaleY'
    : 'scaleX';
  const origin = options.origin
    ?? (
      axis === 'y'
        ? 'top center'
        : 'left center'
    );

  gsap.set(element, {
    [property]: 0,
    transformOrigin: origin,
  });

  if (options.scrub) {
    const tween = gsap.to(element, {
      [property]: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: options.trigger || element,
        start: options.start ?? 'top 78%',
        end: options.end ?? 'bottom 32%',
        scrub: MOTION_SYSTEM.scrub,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }

  const tween = gsap.to(element, {
    [property]: 1,
    duration: options.duration
      ?? MOTION_SYSTEM.reveal,
    paused: true,
    ease: options.ease ?? MOTION_SYSTEM.easeOut,
  });

  const scrollTrigger = ScrollTrigger.create({
    trigger: options.trigger || element,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: () => tween.play(),
  });

  if (scrollTrigger.progress > 0) {
    tween.play();
  }

  return () => {
    scrollTrigger.kill();
    tween.kill();

    gsap.set(element, {
      clearProps: 'transform',
    });
  };
}

/*
 * Spotlight tilt, magnetic movement and shimmer are deliberately
 * removed. Their public functions remain as no-ops so every route
 * keeps working without a second hover language.
 */
export function bindSpotlightCard(card) {
  if (!card) return () => {};

  card.querySelector('.vl-spotlight-glow')?.remove();
  card.classList.remove('vl-spotlight-card');

  gsap.set(card, {
    clearProps: 'transform,transformPerspective',
  });

  return () => {};
}

export function bindMagnetic(element) {
  if (!element) return () => {};

  element.classList.remove('vl-magnetic');

  gsap.set(element, {
    clearProps: 'transform',
  });

  return () => {};
}

export function bindGoldSweep(element) {
  if (!element) return () => {};

  element.classList.remove(
    'vl-gold-sweep',
    'is-sweeping'
  );
  element.querySelector(
    '.vl-gold-sweep__shine'
  )?.remove();

  return () => {};
}

export function bindPartnerLogoFocus(logos) {
  if (
    !logos.length
    || prefersReducedMotion()
    || window.matchMedia(
      '(max-width: 980px)'
    ).matches
  ) {
    return () => {};
  }

  const cleanups = logos.map((logo) => {
    const onEnter = () => {
      gsap.to(logos, {
        opacity: 0.78,
        duration: MOTION_SYSTEM.hover,
        ease: MOTION_SYSTEM.easeOut,
        overwrite: 'auto',
      });

      gsap.to(logo, {
        opacity: 1,
        duration: MOTION_SYSTEM.hover,
        ease: MOTION_SYSTEM.easeOut,
        overwrite: 'auto',
      });
    };

    const onLeave = () => {
      gsap.to(logos, {
        opacity: 1,
        duration: MOTION_SYSTEM.hover,
        ease: MOTION_SYSTEM.easeOut,
        overwrite: 'auto',
      });
    };

    logo.addEventListener(
      'pointerenter',
      onEnter
    );
    logo.addEventListener(
      'pointerleave',
      onLeave
    );
    logo.addEventListener(
      'focusin',
      onEnter
    );
    logo.addEventListener(
      'focusout',
      onLeave
    );

    return () => {
      logo.removeEventListener(
        'pointerenter',
        onEnter
      );
      logo.removeEventListener(
        'pointerleave',
        onLeave
      );
      logo.removeEventListener(
        'focusin',
        onEnter
      );
      logo.removeEventListener(
        'focusout',
        onLeave
      );
    };
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
