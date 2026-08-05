import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import {
  HERO_MARK_REVEALS,
  HERO_WORD_LAYOUTS,
  HERO_WORDS,
} from '../heroWordCloudConfig';

const SCRUB = 0.72;
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
    return {
      ...word,
      ...word.mobile,
    };
  }

  if (layoutName === 'tablet' && word.tablet) {
    return {
      ...word,
      ...word.tablet,
    };
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
    words: gsap.utils.toArray(
      root.querySelectorAll('[data-hero-word]')
    ),
    mark: root.querySelector('[data-hero-word-mark]'),
    markOutline: root.querySelector('[data-hero-mark-outline]'),
    halo: root.querySelector('[data-hero-word-halo]'),
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
  ].every(Boolean) && targets.words.length > 0;
}

function setScrollHeight(scrollEl) {
  scrollEl.style.height = `${getLayout().scrollVh}svh`;
}

function setWordInitialState(timeline, targets) {
  const layoutName = getLayoutName();
  const layout = getLayout();

  targets.words.forEach((element) => {
    const baseWord = getWordConfig(element.dataset.heroWord);

    if (!baseWord || !isWordVisible(baseWord, layoutName)) {
      timeline.set(element, {
        display: 'none',
        autoAlpha: 0,
      }, 0);
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

  timeline.set(targets.markOutline, {
    opacity: 1,
  }, 0);

  timeline.set(targets.halo, {
    autoAlpha: 0,
    scale: 0.72,
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
    const middleAt = word.start + (word.end - word.start) * 0.57;
    const middleX = word.x * 0.47 + word.curveX;
    const middleY = word.y * 0.47 + word.curveY;

    timeline.to(element, {
      x: () => toViewportX(middleX, layout),
      y: () => toViewportY(middleY, layout),
      scale: 0.68,
      rotate: word.rotation * -0.25,
      autoAlpha: Math.min(word.opacity, 0.78),
      filter: `blur(${Math.max(0, word.blur * 0.35)}px)`,
      duration: middleAt - word.start,
      ease: 'power1.inOut',
    }, word.start);

    timeline.to(element, {
      x: () => toViewportX(word.targetX, layout),
      y: () => toViewportY(word.targetY, layout),
      scale: 0.045,
      rotate: 0,
      autoAlpha: 0,
      filter: 'blur(3px)',
      duration: word.end - middleAt,
      ease: 'power2.in',
    }, middleAt);
  });
}

function addMarkReveal(timeline, targets) {
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
        autoAlpha: 0.72,
        duration: 0.018,
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
        duration: 0.035,
        ease: 'power1.out',
      }, reveal.at + reveal.duration - 0.006);
    }
  });

  timeline.to(targets.markOutline, {
    opacity: 0.28,
    duration: 0.18,
    ease: 'power1.out',
  }, 0.56);

  timeline.to(targets.halo, {
    autoAlpha: 0.82,
    scale: 1,
    duration: 0.16,
    ease: 'power2.out',
  }, 0.58);

  timeline.to(targets.mark, {
    scale: 1.026,
    duration: 0.055,
    ease: 'power2.out',
  }, 0.66);

  timeline.to(targets.mark, {
    scale: 1,
    duration: 0.075,
    ease: 'power2.inOut',
  }, 0.715);
}

function addHintFade(timeline, targets) {
  if (!targets.hint) return;

  timeline.to(targets.hint, {
    autoAlpha: 0,
    y: 8,
    duration: 0.06,
    ease: 'power2.out',
  }, 0.015);
}

function buildTimeline(targets) {
  const timeline = gsap.timeline({
    defaults: {
      overwrite: 'auto',
    },
    scrollTrigger: {
      trigger: targets.scrollEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
  });

  timeline.set(targets.scene, {
    autoAlpha: 1,
  }, 0);

  setWordInitialState(timeline, targets);
  setMarkInitialState(timeline, targets);
  addHintFade(timeline, targets);
  addWordConvergence(timeline, targets);
  addMarkReveal(timeline, targets);

  timeline.to({}, {
    duration: 0.001,
  }, 1);

  return timeline;
}

function bindWordFieldParallax(targets) {
  const supportsPointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  if (!supportsPointer) return () => {};

  const moveX = gsap.quickTo(targets.wordsLayer, 'x', {
    duration: 1.15,
    ease: 'power3.out',
  });
  const moveY = gsap.quickTo(targets.wordsLayer, 'y', {
    duration: 1.15,
    ease: 'power3.out',
  });

  const handlePointerMove = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;

    moveX(x);
    moveY(y);
  };

  const handlePointerLeave = () => {
    moveX(0);
    moveY(0);
  };

  window.addEventListener('pointermove', handlePointerMove, {
    passive: true,
  });
  document.documentElement.addEventListener(
    'pointerleave',
    handlePointerLeave
  );

  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    document.documentElement.removeEventListener(
      'pointerleave',
      handlePointerLeave
    );
  };
}

function initReducedMotion(root, targets) {
  root.classList.add(
    'is-video-hero-mounted',
    'is-video-hero-reduced',
    'is-video-ready'
  );

  targets.scrollEl.style.height = 'auto';

  gsap.set(targets.scene, {
    autoAlpha: 1,
  });
  gsap.set(targets.words, {
    display: 'none',
    autoAlpha: 0,
  });
  gsap.set(Array.from(targets.markFills.values()), {
    scaleX: 1,
    scaleY: 1,
  });
  gsap.set(Array.from(targets.markScans.values()), {
    display: 'none',
  });
  gsap.set(targets.markOutline, {
    opacity: 0.28,
  });
  gsap.set(targets.halo, {
    autoAlpha: 0.72,
    scale: 1,
  });

  return () => {
    targets.scrollEl.style.removeProperty('height');
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

  root.classList.add(
    'is-video-hero-mounted',
    'is-video-ready'
  );

  setScrollHeight(targets.scrollEl);

  let timeline = buildTimeline(targets);
  let currentLayout = getLayoutName();
  let resizeFrame = 0;
  const removeParallax = bindWordFieldParallax(targets);

  const rebuild = () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      const nextLayout = getLayoutName();
      const progress = timeline.scrollTrigger?.progress || 0;

      if (nextLayout !== currentLayout) {
        timeline.scrollTrigger?.kill();
        timeline.kill();

        currentLayout = nextLayout;
        setScrollHeight(targets.scrollEl);
        timeline = buildTimeline(targets);
        timeline.progress(progress, false);
      }

      ScrollTrigger.refresh();
    });
  };

  window.addEventListener('resize', rebuild, {
    passive: true,
  });
  window.addEventListener('orientationchange', rebuild, {
    passive: true,
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    cancelAnimationFrame(resizeFrame);
    removeParallax();
    window.removeEventListener('resize', rebuild);
    window.removeEventListener('orientationchange', rebuild);
    timeline.scrollTrigger?.kill();
    timeline.kill();
    targets.scrollEl.style.removeProperty('height');
    gsap.set(targets.wordsLayer, {
      clearProps: 'x,y',
    });
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-ready'
    );
  };
}
