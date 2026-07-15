import { gsap, ScrollTrigger } from '../gsap';
import { SCROLL_ANCHOR_OFFSET } from '../config';
import { MOBILE_VIEWPORT_QUERY } from '@/lib/motion/tokens';
import { prefersReducedMotion } from '@/lib/motion/tokens';

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
  return ctx.mobile ? 'top 76%' : 'top 68%';
}

export function textRevealStart(ctx) {
  return ctx.mobile ? 'top 77%' : 'top 70%';
}

export function storySegmentTimes(count, { intro = 0.06, body = 1 } = {}) {
  const segment = body / count;
  return {
    intro,
    body,
    segment,
    total: intro + body,
  };
}

export function pinnedStoryConfig(section, pin, {
  end = '+=100%',
  scrub = 1.05,
  onRefresh,
} = {}) {
  const syncPinState = (self) => {
    section.classList.toggle('is-vl-pinned', self.isActive);
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
    onToggle: syncPinState,
    onLeave: () => section.classList.remove('is-vl-pinned'),
    onLeaveBack: () => section.classList.remove('is-vl-pinned'),
    onRefresh: () => onRefresh?.(),
  };
}

export function fitPinnedStoryStage(stage, cleanups, { offset = SCROLL_ANCHOR_OFFSET, margin = 20 } = {}) {
  if (!stage) return () => {};

  const fit = () => {
    gsap.set(stage, { clearProps: 'scale' });
    const available = window.innerHeight - offset - margin * 2;
    const measured = stage.offsetHeight;
    if (measured > available) {
      const scale = Math.max(0.86, available / measured);
      gsap.set(stage, { scale, transformOrigin: '50% 0' });
    }
  };

  fit();
  ScrollTrigger.addEventListener('refresh', fit);
  pushCleanup(cleanups, () => ScrollTrigger.removeEventListener('refresh', fit));

  return fit;
}

export function pushCleanup(cleanups, fn) {
  if (typeof fn === 'function') cleanups.push(fn);
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
  const sections = root.querySelectorAll('[data-vl-gsap-root]');
  sections.forEach((section) => setVisible(section.querySelectorAll('*')));
  const footer = document.querySelector('footer[data-vl-gsap-root]');
  if (footer) setVisible(footer.querySelectorAll('*'));
}

export function revealOnce(targets, ctx, options = {}) {
  const items = gsap.utils.toArray(targets);
  if (!items.length || ctx.reduced) {
    setVisible(items);
    return null;
  }

  const {
    y = 17,
    x = 0,
    stagger = 0.12,
    duration = 0.96,
    delay = 0.04,
    trigger,
  } = options;

  return gsap.from(items, {
    opacity: 0,
    y,
    x,
    stagger,
    duration,
    delay,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: trigger || items[0],
      start: triggerStart(ctx),
      once: true,
    },
  });
}

export function scrubParallax(target, trigger, ctx, { y = 16, scrub = 0.85 } = {}) {
  if (ctx.reduced || !target) return null;

  return gsap.fromTo(
    target,
    { y: y * 0.35 },
    {
      y: -y,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top 88%',
        end: 'bottom 18%',
        scrub,
      },
    },
  );
}

export function runCountUp(element, target, ctx, { duration = 0.96, decimals = 0 } = {}) {
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
    ease: 'power2.out',
    snap: decimals === 0 ? { value: 1 } : undefined,
    onUpdate: () => {
      element.textContent = counter.value.toFixed(decimals);
    },
  });
}

export function bindCardTilt(card, ctx, { max = 5, glowClass = 'vl-card-glow' } = {}) {
  if (ctx.reduced || ctx.mobile || !card) return () => {};

  let glow = card.querySelector(`.${glowClass}`);
  if (!glow) {
    glow = document.createElement('span');
    glow.className = glowClass;
    glow.setAttribute('aria-hidden', 'true');
    card.appendChild(glow);
  }

  card.style.transformStyle = 'preserve-3d';

  let inViewport = false;

  const onMove = (event) => {
    if (!inViewport) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateX: -py * max,
      rotateY: px * max,
      transformPerspective: 900,
      duration: 0.32,
      ease: 'power2.out',
    });

    gsap.to(glow, {
      opacity: 0.42,
      x: px * 22,
      y: py * 22,
      duration: 0.32,
      ease: 'power2.out',
    });
  };

  const onLeave = () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.45,
      ease: 'power2.out',
    });
    gsap.to(glow, { opacity: 0, x: 0, y: 0, duration: 0.45, ease: 'power2.out' });
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      inViewport = entry.isIntersecting;
      if (!inViewport) onLeave();
    },
    { threshold: 0.08, rootMargin: '0px' },
  );

  observer.observe(card);
  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', onLeave);

  return () => {
    observer.disconnect();
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerleave', onLeave);
    gsap.set(card, { clearProps: 'transform' });
    glow?.remove();
  };
}
