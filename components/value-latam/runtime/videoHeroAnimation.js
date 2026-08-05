import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import {
  HERO_MARK_REVEALS,
  HERO_WORD_LAYOUTS,
  HERO_WORDS,
} from '../heroWordCloudConfig';

const SCRUB = 0.55;
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

function toViewportX(value, layout) {
  return window.innerWidth * value * 0.01 * layout.xFactor;
}

function toViewportY(value, layout) {
  return window.innerHeight * value * 0.01 * layout.yFactor;
}

function getWordConfig(id) {
  return HERO_WORDS.find((word) => word.id === id);
}

function getResponsiveWord(word, layoutName) {
  if (layoutName !== 'mobile' || !word.mobile) return word;

  return {
    ...word,
    ...word.mobile,
  };
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
    hint: root.querySelector('[data-video-hero-scroll-hint]'),
    scene: root.querySelector('[data-hero-word-scene]'),
    center: root.querySelector('[data-hero-word-center]'),
    mark: root.querySelector('[data-hero-word-mark]'),
    markOutline: root.querySelector('[data-hero-mark-outline]'),
    halo: root.querySelector('[data-hero-word-halo]'),
    words: gsap.utils.toArray(root.querySelectorAll('[data-hero-word]')),
    markFills,
    markScans,
    exitFade: root.querySelector('[data-video-hero-exit-fade]'),
  };
}

function validateTargets(targets) {
  const required = [
    targets.scrollEl,
    targets.stickyEl,
    targets.scene,
    targets.center,
    targets.mark,
    targets.markOutline,
    targets.halo,
    targets.exitFade,
  ];

  return required.every(Boolean) && targets.words.length > 0;
}

function setScrollHeight(scrollEl) {
  const layout = getLayout();
  scrollEl.style.height = `${layout.scrollVh}svh`;
}

function setInitialSceneState(timeline, targets) {
  timeline.set(
    targets.scene,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
    },
    0
  );

  timeline.set(
    targets.center,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
    },
    0
  );

  timeline.set(
    targets.mark,
    {
      scale: 0.97,
      transformOrigin: '50% 50%',
    },
    0
  );

  timeline.set(
    targets.markOutline,
    {
      opacity: 0.92,
    },
    0
  );

  timeline.set(
    targets.halo,
    {
      autoAlpha: 0.10,
      scale: 0.78,
    },
    0
  );

  HERO_MARK_REVEALS.forEach((reveal) => {
    const fill = targets.markFills.get(reveal.id);
    const scan = targets.markScans.get(reveal.id);

    if (fill) {
      timeline.set(
        fill,
        {
          scaleX: reveal.axis === 'x' ? 0 : 1,
          scaleY: reveal.axis === 'y' ? 0 : 1,
          transformOrigin: reveal.origin,
        },
        0
      );
    }

    if (scan) {
      const initialScan = reveal.scanAxis === 'x'
        ? { attr: { x: reveal.scanFrom }, autoAlpha: 0 }
        : { attr: { y: reveal.scanFrom }, autoAlpha: 0 };

      timeline.set(scan, initialScan, 0);
    }
  });
}

function setInitialWords(timeline, targets) {
  const layoutName = getLayoutName();
  const layout = getLayout();
  const visibleIds = new Set(layout.visibleIds);

  targets.words.forEach((element) => {
    const id = element.dataset.heroWord;
    const baseWord = getWordConfig(id);

    if (!baseWord || !visibleIds.has(id)) {
      timeline.set(element, { display: 'none', autoAlpha: 0 }, 0);
      return;
    }

    const word = getResponsiveWord(baseWord, layoutName);

    timeline.set(
      element,
      {
        display: 'block',
        x: () => toViewportX(word.x, layout),
        y: () => toViewportY(word.y, layout),
        scale: word.scale,
        rotate: word.rotation,
        autoAlpha: word.opacity,
        filter: `blur(${word.blur}px)`,
        transformOrigin: '50% 50%',
        force3D: true,
      },
      0
    );
  });
}

function addHintSequence(timeline, targets) {
  if (!targets.hint) return;

  timeline.to(
    targets.hint,
    {
      autoAlpha: 0,
      y: 10,
      duration: 0.065,
      ease: 'power2.out',
    },
    0.025
  );
}

function addWordSequence(timeline, targets) {
  const layoutName = getLayoutName();
  const layout = getLayout();
  const visibleIds = new Set(layout.visibleIds);

  targets.words.forEach((element) => {
    const id = element.dataset.heroWord;
    const baseWord = getWordConfig(id);

    if (!baseWord || !visibleIds.has(id)) return;

    const word = getResponsiveWord(baseWord, layoutName);
    const middleAt = word.start + (word.end - word.start) * 0.56;
    const settleAt = word.end - 0.055;

    timeline.to(
      element,
      {
        x: () => toViewportX(word.x * 0.52 + word.curveX, layout),
        y: () => toViewportY(word.y * 0.52 + word.curveY, layout),
        scale: word.scale * 0.72,
        rotate: word.rotation * -0.28,
        filter: `blur(${Math.max(0, word.blur * 0.38)}px)`,
        duration: middleAt - word.start,
        ease: 'power1.inOut',
      },
      word.start
    );

    timeline.to(
      element,
      {
        x: () => toViewportX(word.targetX, layout),
        y: () => toViewportY(word.targetY, layout),
        scale: 0.24,
        rotate: 0,
        autoAlpha: Math.min(word.opacity, 0.74),
        filter: 'blur(0px)',
        duration: settleAt - middleAt,
        ease: 'power2.in',
      },
      middleAt
    );

    timeline.to(
      element,
      {
        scale: 0.045,
        autoAlpha: 0,
        filter: 'blur(4px)',
        duration: word.end - settleAt,
        ease: 'power3.in',
      },
      settleAt
    );
  });
}

function addMarkReveal(timeline, targets) {
  HERO_MARK_REVEALS.forEach((reveal) => {
    const fill = targets.markFills.get(reveal.id);
    const scan = targets.markScans.get(reveal.id);

    if (fill) {
      timeline.to(
        fill,
        {
          scaleX: 1,
          scaleY: 1,
          duration: reveal.duration,
          ease: 'power1.inOut',
        },
        reveal.at
      );
    }

    if (scan) {
      timeline.to(
        scan,
        {
          autoAlpha: 0.68,
          duration: 0.02,
          ease: 'none',
        },
        reveal.at
      );

      const scanTween = reveal.scanAxis === 'x'
        ? { attr: { x: reveal.scanTo } }
        : { attr: { y: reveal.scanTo } };

      timeline.to(
        scan,
        {
          ...scanTween,
          duration: reveal.duration,
          ease: 'none',
        },
        reveal.at
      );

      timeline.to(
        scan,
        {
          autoAlpha: 0,
          duration: 0.035,
          ease: 'power1.out',
        },
        reveal.at + reveal.duration - 0.01
      );
    }
  });

  timeline.to(
    targets.markOutline,
    {
      opacity: 0.30,
      duration: 0.20,
      ease: 'power1.out',
    },
    0.58
  );

  timeline.to(
    targets.halo,
    {
      autoAlpha: 0.88,
      scale: 1,
      duration: 0.16,
      ease: 'power2.out',
    },
    0.61
  );

  timeline.to(
    targets.mark,
    {
      scale: 1.032,
      duration: 0.06,
      ease: 'power2.out',
    },
    0.69
  );

  timeline.to(
    targets.mark,
    {
      scale: 1,
      duration: 0.08,
      ease: 'power2.inOut',
    },
    0.75
  );
}

function addExitSequence(timeline, targets) {
  timeline.to(
    targets.exitFade,
    {
      opacity: 0.86,
      duration: 0.055,
      ease: 'power1.inOut',
    },
    0.945
  );

  timeline.to(
    targets.scene,
    {
      autoAlpha: 0,
      y: -18,
      scale: 0.992,
      duration: 0.045,
      ease: 'power2.in',
    },
    0.955
  );

  timeline.to({}, { duration: 0.001 }, 1);
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
      fastScrollEnd: true,
      preventOverlaps: 'value-latam-hero',
    },
  });

  setInitialSceneState(timeline, targets);
  setInitialWords(timeline, targets);
  addHintSequence(timeline, targets);
  addWordSequence(timeline, targets);
  addMarkReveal(timeline, targets);
  addExitSequence(timeline, targets);

  return timeline;
}

function initReducedMotion(root, targets) {
  root.classList.add(
    'is-video-hero-mounted',
    'is-video-hero-reduced',
    'is-video-ready'
  );

  targets.scrollEl.style.height = 'auto';

  gsap.set(targets.scene, {
    clearProps: 'all',
    autoAlpha: 1,
  });
  gsap.set(targets.center, {
    clearProps: 'all',
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
  gsap.set(targets.halo, {
    autoAlpha: 0.72,
    scale: 1,
  });
  gsap.set(targets.exitFade, { opacity: 0 });

  return () => {
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-reduced',
      'is-video-ready'
    );
    targets.scrollEl.style.removeProperty('height');
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
  let resizeFrame = 0;
  let layoutName = getLayoutName();

  const refresh = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const nextLayoutName = getLayoutName();

      if (nextLayoutName !== layoutName) {
        const progress = timeline.scrollTrigger?.progress || 0;

        timeline.scrollTrigger?.kill();
        timeline.kill();
        layoutName = nextLayoutName;
        setScrollHeight(targets.scrollEl);
        timeline = buildTimeline(targets);
        timeline.progress(progress, false);
      } else {
        setScrollHeight(targets.scrollEl);
        ScrollTrigger.refresh();
      }
    });
  };

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });

  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
    timeline.scrollTrigger?.kill();
    timeline.kill();
    targets.scrollEl.style.removeProperty('height');
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-ready'
    );
  };
}
