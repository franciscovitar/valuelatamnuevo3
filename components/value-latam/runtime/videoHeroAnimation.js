import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { getLenis, scrollToTop } from '@/lib/scroll/lenis';
import { refreshScrollTriggers } from '@/lib/scroll/routeScroll';
import {
  HERO_MARK_REVEALS,
  HERO_TIMELINE,
  HERO_WORD_LAYOUTS,
  HERO_WORDS,
} from '../heroWordCloudConfig';

const BREAKPOINTS = {
  mobile: 760,
  tablet: 1100,
};

function getLayoutName() {
  if (window.innerWidth <= BREAKPOINTS.mobile) return 'mobile';
  if (window.innerWidth <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

function getLayout() {
  return HERO_WORD_LAYOUTS[getLayoutName()];
}

function getWordConfig(id) {
  return HERO_WORDS.find((word) => word.id === id);
}

function getResponsiveWord(word, layoutName) {
  if (layoutName === 'mobile' && word.mobile) {
    return { ...word, ...word.mobile };
  }

  if (layoutName === 'tablet' && word.tablet) {
    return { ...word, ...word.tablet };
  }

  return word;
}

function isWordVisible(word, layoutName) {
  if (layoutName === 'mobile') return !word.mobileHidden;
  if (layoutName === 'tablet') return !word.tabletHidden;
  return true;
}

function toViewportX(value, layout) {
  return window.innerWidth * value * 0.01 * layout.xFactor;
}

function toViewportY(value, layout) {
  return window.innerHeight * value * 0.01 * layout.yFactor;
}

function collectTargets(root) {
  const markFills = new Map();
  const markScans = new Map();

  root.querySelectorAll('[data-hero-mark-fill]').forEach((element) => {
    markFills.set(element.dataset.heroMarkFill, element);
  });

  root.querySelectorAll('[data-hero-mark-scan]').forEach((element) => {
    markScans.set(element.dataset.heroMarkScan, element);
  });

  return {
    root,
    scrollEl: root.querySelector('[data-video-hero-scroll]'),
    stickyEl: root.querySelector('[data-video-hero-sticky]'),
    scene: root.querySelector('[data-hero-word-scene]'),
    wordsLayer: root.querySelector('[data-hero-word-layer]'),
    words: gsap.utils.toArray(root.querySelectorAll('[data-hero-word]')),
    mark: root.querySelector('[data-hero-word-mark]'),
    markOutline: root.querySelector('[data-hero-mark-outline]'),
    halo: root.querySelector('[data-hero-word-halo]'),
    copy: root.querySelector('[data-hero-word-copy]'),
    title: root.querySelector('[data-hero-title]'),
    subcopy: root.querySelector('[data-hero-subcopy]'),
    hint: root.querySelector('[data-video-hero-scroll-hint]'),
    markFills,
    markScans,
  };
}

function validateTargets(targets) {
  return [
    targets.scrollEl,
    targets.stickyEl,
    targets.scene,
    targets.wordsLayer,
    targets.mark,
    targets.markOutline,
    targets.halo,
    targets.title,
    targets.subcopy,
  ].every(Boolean) && targets.words.length > 0;
}

function getHeroScrollDistanceVh() {
  return getLayout().scrollDistanceVh;
}

function setScrollHeight(scrollEl) {
  scrollEl.style.height = '100svh';
}

function getScrollTriggerConfig(targets) {
  const config = {
    trigger: targets.root,
    start: 'top top',
    end: () => `+=${getHeroScrollDistanceVh()}%`,
    scrub: HERO_TIMELINE.scrub,
    invalidateOnRefresh: true,
  };

  if (getLenis()) {
    config.scroller = document.documentElement;
  }

  return config;
}

function buildTimeline(targets) {
  const timeline = gsap.timeline({
    defaults: { overwrite: 'auto' },
  });

  timeline.set(targets.scene, { autoAlpha: 1 }, 0);
  setWordInitialState(timeline, targets);
  setMarkInitialState(timeline, targets);
  addWordConvergence(timeline, targets);
  addMarkReveal(timeline, targets);
  addHintFade(timeline, targets);
  timeline.to({}, { duration: 0.001 }, 1);

  return timeline;
}

function mountHeroScrollAnimation(targets) {
  setScrollHeight(targets.scrollEl);

  const timeline = buildTimeline(targets);
  const scrollTrigger = ScrollTrigger.create({
    animation: timeline,
    ...getScrollTriggerConfig(targets),
  });

  return { timeline, scrollTrigger };
}

function destroyHeroScrollAnimation(animation) {
  animation?.scrollTrigger?.kill();
  animation?.timeline?.kill();
}

function setWordInitialState(timeline, targets) {
  const layoutName = getLayoutName();
  const layout = getLayout();

  targets.words.forEach((element) => {
    const baseWord = getWordConfig(element.dataset.heroWord);

    if (!baseWord || !isWordVisible(baseWord, layoutName)) {
      timeline.set(element, { display: 'none', autoAlpha: 0 }, 0);
      return;
    }

    const word = getResponsiveWord(baseWord, layoutName);

    timeline.set(element, {
      display: 'block',
      x: () => toViewportX(word.x, layout),
      y: () => toViewportY(word.y, layout),
      scale: 1,
      rotate: word.rotation,
      autoAlpha: word.opacity,
      filter: `blur(${word.blur}px)`,
      transformOrigin: '50% 50%',
      force3D: true,
    }, 0);
  });
}

function setMarkInitialState(timeline, targets) {
  timeline.set(targets.mark, {
    scale: 1,
    transformOrigin: '50% 50%',
  }, 0);

  timeline.set(targets.markOutline, { opacity: HERO_TIMELINE.markOutlinePeak }, 0);
  timeline.set(targets.halo, { autoAlpha: 0, scale: 0.72 }, 0);

  timeline.set(targets.title, {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
  }, 0);

  timeline.set(targets.subcopy, {
    autoAlpha: 1,
    y: 0,
  }, 0);

  HERO_MARK_REVEALS.forEach((reveal) => {
    const fill = targets.markFills.get(reveal.id);
    const scan = targets.markScans.get(reveal.id);

    if (fill) {
      timeline.set(fill, {
        scaleX: reveal.axis === 'x' ? 0 : 1,
        scaleY: reveal.axis === 'y' ? 0 : 1,
        transformOrigin: reveal.origin,
      }, 0);
    }

    if (scan) {
      timeline.set(scan, {
        autoAlpha: 0,
        attr: reveal.scanAxis === 'x'
          ? { x: reveal.scanFrom }
          : { y: reveal.scanFrom },
      }, 0);
    }
  });
}

function addWordConvergence(timeline, targets) {
  const layoutName = getLayoutName();
  const layout = getLayout();

  targets.words.forEach((element) => {
    const baseWord = getWordConfig(element.dataset.heroWord);

    if (!baseWord || !isWordVisible(baseWord, layoutName)) return;

    const word = getResponsiveWord(baseWord, layoutName);
    const depthFactor = word.depth === 'far' ? 0.86 : 1;
    const travel = word.end - word.start;
    const midAt = word.start + travel * 0.54;
    const middleX = word.x * 0.44 + word.curveX * 0.56;
    const middleY = word.y * 0.44 + word.curveY * 0.56;

    timeline.to(element, {
      x: () => toViewportX(middleX, layout),
      y: () => toViewportY(middleY, layout),
      scale: 0.78 * depthFactor,
      rotate: word.rotation * 0.12,
      autoAlpha: Math.min(word.opacity, 0.78),
      filter: `blur(${Math.max(0, word.blur * 0.35)}px)`,
      duration: midAt - word.start,
      ease: 'power2.inOut',
    }, word.start);

    timeline.to(element, {
      x: () => toViewportX(word.targetX, layout),
      y: () => toViewportY(word.targetY, layout),
      scale: 0.24 * depthFactor,
      rotate: 0,
      autoAlpha: 0,
      filter: `blur(${Math.min(2.2, word.blur + 1.2)}px)`,
      duration: word.end - midAt,
      ease: 'power1.inOut',
    }, midAt);
  });
}

function addMarkReveal(timeline, targets) {
  const {
    markOutlinePeak,
    markNormalizeAt,
    haloAt,
    markSettleAt,
  } = HERO_TIMELINE;

  HERO_MARK_REVEALS.forEach((reveal) => {
    const fill = targets.markFills.get(reveal.id);
    const scan = targets.markScans.get(reveal.id);

    if (fill) {
      timeline.to(fill, {
        scaleX: 1,
        scaleY: 1,
        duration: reveal.duration,
        ease: 'none',
      }, reveal.at);
    }

    if (scan) {
      timeline.to(scan, {
        autoAlpha: 0.38,
        duration: 0.012,
        ease: 'none',
      }, reveal.at);

      timeline.to(scan, {
        attr: reveal.scanAxis === 'x'
          ? { x: reveal.scanTo }
          : { y: reveal.scanTo },
        duration: reveal.duration,
        ease: 'none',
      }, reveal.at);

      timeline.to(scan, {
        autoAlpha: 0,
        duration: 0.028,
        ease: 'power1.out',
      }, reveal.at + reveal.duration - 0.006);
    }
  });

  timeline.to(targets.halo, {
    autoAlpha: 0.62,
    scale: 1,
    duration: 0.14,
    ease: 'power2.out',
  }, haloAt);

  timeline.to(targets.mark, {
    scale: 1.008,
    duration: 0.04,
    ease: 'power2.out',
  }, markNormalizeAt - 0.02);

  timeline.to(targets.mark, {
    scale: 1,
    duration: 0.06,
    ease: 'power2.inOut',
  }, markNormalizeAt + 0.02);

  timeline.set(Array.from(targets.markFills.values()), {
    scaleX: 1,
    scaleY: 1,
  }, markNormalizeAt);

  timeline.set(Array.from(targets.markScans.values()), {
    autoAlpha: 0,
  }, markNormalizeAt);

  timeline.set(targets.markOutline, {
    opacity: markOutlinePeak,
  }, markNormalizeAt);

  timeline.to({}, { duration: 0.001 }, markSettleAt);
}

function addHintFade(timeline, targets) {
  if (!targets.hint) return;

  timeline.to(targets.hint, {
    autoAlpha: 0,
    y: 8,
    duration: 0.04,
    ease: 'power2.out',
  }, HERO_TIMELINE.hintFade);
}

function bindWordFieldParallax(targets) {
  const supportsPointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  if (!supportsPointer) return () => {};

  const moveX = gsap.quickTo(targets.wordsLayer, 'x', {
    duration: 1.1,
    ease: 'power3.out',
  });
  const moveY = gsap.quickTo(targets.wordsLayer, 'y', {
    duration: 1.1,
    ease: 'power3.out',
  });

  const handlePointerMove = (event) => {
    moveX((event.clientX / window.innerWidth - 0.5) * 10);
    moveY((event.clientY / window.innerHeight - 0.5) * 6);
  };

  const handlePointerLeave = () => {
    moveX(0);
    moveY(0);
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', handlePointerLeave);

  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
  };
}

function initReducedMotion(root, targets) {
  root.classList.add(
    'is-video-hero-mounted',
    'is-video-hero-reduced',
    'is-video-ready'
  );

  targets.scrollEl.style.height = 'auto';
  gsap.set(targets.scene, { autoAlpha: 1 });
  gsap.set(targets.words, { display: 'none', autoAlpha: 0 });
  gsap.set(Array.from(targets.markFills.values()), { scaleX: 1, scaleY: 1 });
  gsap.set(Array.from(targets.markScans.values()), { display: 'none', autoAlpha: 0 });
  gsap.set(targets.markOutline, { opacity: HERO_TIMELINE.markOutlinePeak });
  gsap.set(targets.halo, { autoAlpha: 0.52, scale: 1 });
  gsap.set(targets.mark, { scale: 1 });
  gsap.set(targets.title, { autoAlpha: 1, y: 0, clearProps: 'filter' });
  gsap.set(targets.subcopy, { autoAlpha: 1, y: 0 });

  if (targets.hint) {
    gsap.set(targets.hint, { autoAlpha: 0 });
  }

  return () => {
    targets.scrollEl.style.removeProperty('height');
    gsap.set(targets.title, { clearProps: 'all' });
    gsap.set(targets.subcopy, { clearProps: 'all' });
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-reduced',
      'is-video-ready'
    );
  };
}

export function initVideoHeroAnimation() {
  const root = document.querySelector('[data-vl-video-hero-root]');

  if (!root) return () => {};

  const targets = collectTargets(root);

  if (!validateTargets(targets)) return () => {};

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return initReducedMotion(root, targets);
  }

  root.classList.add('is-video-hero-mounted', 'is-video-ready');

  let heroAnimation = mountHeroScrollAnimation(targets);
  let currentLayout = getLayoutName();
  let resizeFrame = 0;
  let lenisSyncFrame = 0;
  const removeParallax = bindWordFieldParallax(targets);

  const syncScrollPosition = () => {
    scrollToTop({ immediate: true });
    heroAnimation.scrollTrigger?.scroll(heroAnimation.scrollTrigger.start);
    refreshScrollTriggers({ hard: true });
  };

  const remountHeroAnimation = (progress = heroAnimation.scrollTrigger?.progress || 0) => {
    destroyHeroScrollAnimation(heroAnimation);
    heroAnimation = mountHeroScrollAnimation(targets);
    heroAnimation.timeline.progress(progress, false);
    refreshScrollTriggers({ hard: true });
  };

  syncScrollPosition();

  lenisSyncFrame = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      remountHeroAnimation(0);
      syncScrollPosition();
    });
  });

  const rebuild = () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      const nextLayout = getLayoutName();
      const progress = heroAnimation.scrollTrigger?.progress || 0;

      if (nextLayout !== currentLayout) {
        currentLayout = nextLayout;
        remountHeroAnimation(progress);
        return;
      }

      refreshScrollTriggers({ hard: true });
    });
  };

  window.addEventListener('resize', rebuild, { passive: true });
  window.addEventListener('orientationchange', rebuild, { passive: true });

  return () => {
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(lenisSyncFrame);
    removeParallax();
    window.removeEventListener('resize', rebuild);
    window.removeEventListener('orientationchange', rebuild);
    destroyHeroScrollAnimation(heroAnimation);
    targets.scrollEl.style.removeProperty('height');
    gsap.set(targets.wordsLayer, { clearProps: 'x,y' });
    gsap.set(targets.words, { clearProps: 'all' });
    gsap.set(targets.title, { clearProps: 'all' });
    gsap.set(targets.subcopy, { clearProps: 'all' });
    gsap.set(targets.mark, { clearProps: 'all' });
    gsap.set(targets.markOutline, { clearProps: 'all' });
    gsap.set(targets.halo, { clearProps: 'all' });
    root.classList.remove('is-video-hero-mounted', 'is-video-ready', 'is-video-hero-pinned');
  };
}
