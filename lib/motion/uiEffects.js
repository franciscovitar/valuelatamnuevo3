import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import { triggerStart } from '@/lib/scroll/home/utils';

const CLIP_MAP = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  bottom: 'inset(100% 0 0 0)',
  top: 'inset(0 0 100% 0)',
};

export function initClipReveal(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    gsap.set(element, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, clearProps: 'transform' });
    return () => {};
  }

  const direction = options.direction ?? 'right';
  const from = CLIP_MAP[direction] ?? CLIP_MAP.right;
  gsap.set(element, { clipPath: from, opacity: options.fromOpacity ?? 0.01 });

  let played = false;
  let tween = null;
  let st = null;
  const trigger = options.trigger || element;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(element, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      duration: options.duration ?? 0.96,
      ease: options.ease ?? 'power2.out',
      clearProps: 'clipPath',
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: options.once !== false,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    gsap.set(element, { clearProps: 'clipPath,opacity' });
  };
}

export function initDrawLine(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    gsap.set(element, { scaleX: 1, scaleY: 1, clearProps: 'transform' });
    return () => {};
  }

  const axis = options.axis ?? 'x';
  const prop = axis === 'y' ? 'scaleY' : 'scaleX';
  const origin = options.origin ?? (axis === 'y' ? 'top center' : 'left center');

  gsap.set(element, { [prop]: 0, transformOrigin: origin });

  let played = false;
  let tween = null;
  let st = null;
  const trigger = options.trigger || element;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(element, {
      [prop]: 1,
      duration: options.duration ?? 0.88,
      ease: options.ease ?? 'power2.out',
    });
  };

  if (options.scrub) {
    tween = gsap.to(element, {
      [prop]: 1,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: options.start ?? 'top 76%',
        end: options.end ?? 'bottom 32%',
        scrub: options.scrub,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    gsap.set(element, { clearProps: 'transform' });
  };
}

export function bindSpotlightCard(card, ctx, { maxTilt = 2.75 } = {}) {
  if (!card || ctx?.reduced || ctx?.mobile) return () => {};

  let glow = card.querySelector('.vl-spotlight-glow');
  if (!glow) {
    glow = document.createElement('span');
    glow.className = 'vl-spotlight-glow';
    glow.setAttribute('aria-hidden', 'true');
    card.appendChild(glow);
  }

  card.classList.add('vl-spotlight-card');
  let inView = false;

  const reset = () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.42, ease: 'power2.out' });
    gsap.to(glow, { opacity: 0, duration: 0.42, ease: 'power2.out' });
  };

  const onMove = (event) => {
    if (!inView) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateX: -py * maxTilt,
      rotateY: px * maxTilt,
      transformPerspective: 900,
      duration: 0.28,
      ease: 'power2.out',
    });

    gsap.to(glow, {
      opacity: 0.38,
      x: px * 28,
      y: py * 28,
      duration: 0.28,
      ease: 'power2.out',
    });
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) reset();
    },
    { threshold: 0.08 },
  );

  observer.observe(card);
  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', reset);

  return () => {
    observer.disconnect();
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerleave', reset);
    glow?.remove();
    card.classList.remove('vl-spotlight-card');
    gsap.set(card, { clearProps: 'transform' });
  };
}

export function bindMagnetic(element, { max = 2, scaleMax = 1.01 } = {}) {
  if (!element || prefersReducedMotion()) return () => {};
  if (window.matchMedia('(max-width: 980px)').matches) return () => {};

  const onMove = (event) => {
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(element, {
      x: px * max * 2,
      y: py * max * 2,
      scale: scaleMax,
      duration: 0.22,
      ease: 'power2.out',
    });
  };

  const onLeave = () => {
    gsap.to(element, { x: 0, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' });
  };

  element.classList.add('vl-magnetic');
  element.addEventListener('pointermove', onMove, { passive: true });
  element.addEventListener('pointerleave', onLeave);

  return () => {
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerleave', onLeave);
    element.classList.remove('vl-magnetic');
    gsap.set(element, { clearProps: 'transform' });
  };
}

export function bindGoldSweep(element) {
  if (!element || prefersReducedMotion()) return () => {};

  element.classList.add('vl-gold-sweep');
  if (!element.querySelector('.vl-gold-sweep__shine')) {
    const shine = document.createElement('span');
    shine.className = 'vl-gold-sweep__shine';
    shine.setAttribute('aria-hidden', 'true');
    element.appendChild(shine);
  }

  const onEnter = () => element.classList.add('is-sweeping');
  const onLeave = () => element.classList.remove('is-sweeping');

  element.addEventListener('pointerenter', onEnter);
  element.addEventListener('pointerleave', onLeave);

  return () => {
    element.removeEventListener('pointerenter', onEnter);
    element.removeEventListener('pointerleave', onLeave);
    element.classList.remove('vl-gold-sweep', 'is-sweeping');
    element.querySelector('.vl-gold-sweep__shine')?.remove();
  };
}

export function bindPartnerLogoFocus(logos) {
  if (!logos.length || prefersReducedMotion()) return () => {};
  if (window.matchMedia('(max-width: 980px)').matches) return () => {};

  const cleanups = logos.map((logo) => {
    const onEnter = () => {
      gsap.to(logos, { opacity: 0.62, duration: 0.22, ease: 'power2.out' });
      gsap.to(logo, { opacity: 1, boxShadow: '0 0 22px rgba(143, 178, 214, 0.18)', duration: 0.22 });
    };
    const onLeave = () => {
      gsap.to(logos, { opacity: 1, boxShadow: 'none', duration: 0.24, ease: 'power2.out' });
    };
    logo.addEventListener('pointerenter', onEnter);
    logo.addEventListener('pointerleave', onLeave);
    logo.addEventListener('focusin', onEnter);
    logo.addEventListener('focusout', onLeave);
    return () => {
      logo.removeEventListener('pointerenter', onEnter);
      logo.removeEventListener('pointerleave', onLeave);
      logo.removeEventListener('focusin', onEnter);
      logo.removeEventListener('focusout', onLeave);
    };
  });

  return () => cleanups.forEach((fn) => fn());
}
