import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import { createHeroThreeScene } from './heroThreeScene';
import {
  HERO_MODE,
  HERO_USES_THREE_SCENE,
} from '../heroMode';

const SCRUB = 0.34;
const START_OFFSET_PX = 16;
const END_OFFSET_PX = 28;
const SCENE_TAIL_START = 0.84;
const SCENE_TAIL_MAX = 0.24;
const SCROLL_VH = {
  desktop: 290,
  tablet: 270,
  mobile: 225,
};
const CHAPTER_CROSS = 0.032;
const CHAPTER_WINDOWS = [
  [0.27, 0.38],
  [0.38, 0.49],
  [0.49, 0.60],
  [0.60, 0.71],
];

function setScrollHeight(scrollEl, vh) {
  scrollEl.style.height = `${vh}vh`;
}

function collectTargets(root) {
  return {
    root,
    scrollEl: root.querySelector(
      '[data-video-hero-scroll]'
    ),
    stickyEl: root.querySelector(
      '[data-video-hero-sticky]'
    ),
    canvas: root.querySelector(
      '[data-video-hero-canvas]'
    ),
    imageFallback: root.querySelector(
      '[data-video-hero-fallback]'
    ),
    intro: root.querySelector(
      '[data-video-hero-intro]'
    ),
    eyebrow: root.querySelector(
      '[data-video-hero-eyebrow]'
    ),
    title: root.querySelector(
      '[data-video-hero-title]'
    ),
    lead: root.querySelector(
      '[data-video-hero-lead]'
    ),
    cta: root.querySelector(
      '[data-video-hero-cta]'
    ),
    hint: root.querySelector(
      '[data-video-hero-scroll-hint]'
    ),
    chapters: root.querySelector(
      '[data-video-hero-chapters]'
    ),
    kicker: root.querySelector(
      '[data-video-hero-chapters-kicker]'
    ),
    chapterItems: gsap.utils.toArray(
      root.querySelectorAll(
        '[data-video-hero-chapter]'
      )
    ),
    wordCloud: root.querySelector(
      '[data-video-hero-word-cloud]'
    ),
    wordItems: gsap.utils.toArray(
      root.querySelectorAll(
        '[data-video-hero-word]'
      )
    ),
    wordMessage: root.querySelector(
      '[data-video-hero-word-message]'
    ),
    wordEyebrow: root.querySelector(
      '[data-video-hero-word-eyebrow]'
    ),
    wordTitle: root.querySelector(
      '[data-video-hero-word-title]'
    ),
    wordCopy: root.querySelector(
      '[data-video-hero-word-copy]'
    ),
    brand: root.querySelector(
      '[data-video-hero-brand]'
    ),
    logo: root.querySelector(
      '[data-video-hero-brand-logo]'
    ),
    brandCloser: root.querySelector(
      '[data-video-hero-brand-closer]'
    ),
    exitFade: root.querySelector(
      '[data-video-hero-exit-fade]'
    ),
  };
}

function computeSceneProgress(trigger) {
  if (!trigger) return 0;

  const uiProgress = trigger.progress;

  if (uiProgress < SCENE_TAIL_START) {
    return uiProgress;
  }

  const scrollSpan = Math.max(
    trigger.end - trigger.start,
    1
  );
  const scrolled = Math.max(
    0,
    trigger.scroll() - trigger.start
  );
  const inHeroTail = Math.max(
    0,
    scrolled - scrollSpan * SCENE_TAIL_START
  );
  const postHeroScroll = Math.max(
    0,
    trigger.scroll() - trigger.end
  );
  const tailRange = (
    scrollSpan * (1 - SCENE_TAIL_START)
    + Math.max(window.innerHeight * 0.48, 400)
  );
  const tail = (
    Math.min(
      (
        inHeroTail
        + postHeroScroll * 0.85
      ) / tailRange,
      1
    ) * SCENE_TAIL_MAX
  );

  return Math.min(
    1 + SCENE_TAIL_MAX,
    uiProgress + tail
  );
}

function addChapterSequence(timeline, targets) {
  const {
    chapters,
    kicker,
    chapterItems,
  } = targets;

  if (
    !chapters
    || !kicker
    || !chapterItems.length
  ) {
    return;
  }

  timeline.to(
    chapters,
    {
      autoAlpha: 1,
      duration: 0.04,
    },
    0.225
  );
  timeline.to(
    kicker,
    {
      opacity: 1,
      duration: 0.04,
    },
    0.245
  );

  chapterItems.forEach((chapter, index) => {
    const [start, end] = CHAPTER_WINDOWS[index];
    const line = chapter.querySelector(
      '.video-hero__chapter-line'
    );
    const fadeOutAt = (
      index === chapterItems.length - 1
        ? 0.71
        : end - 0.02
    );

    timeline.fromTo(
      chapter,
      {
        autoAlpha: 0,
        y: 18,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: CHAPTER_CROSS,
        ease: 'power2.out',
      },
      start
    );

    if (line) {
      timeline.fromTo(
        line,
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
          duration: CHAPTER_CROSS * 0.85,
          ease: 'power2.out',
        },
        start
      );
    }

    timeline.to(
      chapter,
      {
        autoAlpha: 0,
        y: -18,
        duration: CHAPTER_CROSS,
        ease: 'power2.in',
      },
      fadeOutAt
    );

    if (line) {
      timeline.to(
        line,
        {
          scaleX: 0,
          duration: CHAPTER_CROSS * 0.7,
          ease: 'power2.in',
        },
        fadeOutAt
      );
    }
  });

  timeline.to(
    chapters,
    {
      autoAlpha: 0,
      duration: 0.035,
    },
    0.705
  );
}

function getWordLayoutScale() {
  if (window.innerWidth <= 760) return 0.62;
  if (window.innerWidth <= 1100) return 0.8;
  return 1;
}

function addWordSequence(timeline, targets) {
  const {
    wordCloud,
    wordItems,
    wordMessage,
    wordEyebrow,
    wordTitle,
    wordCopy,
  } = targets;

  if (
    !wordCloud
    || !wordItems.length
    || !wordMessage
    || !wordEyebrow
    || !wordTitle
    || !wordCopy
  ) {
    return;
  }

  const layoutScale = getWordLayoutScale();
  const visibleCount = (
    window.innerWidth <= 760
      ? 6
      : window.innerWidth <= 1100
        ? 9
        : wordItems.length
  );

  timeline.set(
    wordCloud,
    {
      autoAlpha: 1,
    },
    0.225
  );

  timeline.set(
    wordMessage,
    {
      autoAlpha: 0,
      y: 28,
      scale: 0.965,
      filter: 'blur(10px)',
    },
    0
  );

  timeline.set(
    [wordEyebrow, wordTitle, wordCopy],
    {
      autoAlpha: 0,
      y: 14,
    },
    0
  );

  wordItems.forEach((word, index) => {
    if (index >= visibleCount) {
      timeline.set(
        word,
        {
          display: 'none',
        },
        0
      );
      return;
    }

    const xPercent = Number(
      word.dataset.wordX || 0
    );
    const yPercent = Number(
      word.dataset.wordY || 0
    );
    const scale = Number(
      word.dataset.wordScale || 1
    );
    const opacity = Number(
      word.dataset.wordOpacity || 0.5
    );
    const blur = Number(
      word.dataset.wordBlur || 0
    );
    const x = (
      window.innerWidth
      * xPercent
      * 0.01
      * layoutScale
    );
    const y = (
      window.innerHeight
      * yPercent
      * 0.01
      * layoutScale
    );
    const direction = index % 2 === 0 ? 1 : -1;
    const visibleAt = 0.235 + index * 0.004;

    timeline.fromTo(
      word,
      {
        x,
        y,
        scale,
        autoAlpha: 0,
        filter: `blur(${blur}px)`,
        rotate: direction * -1.2,
      },
      {
        x,
        y,
        scale,
        autoAlpha: opacity,
        filter: `blur(${blur}px)`,
        rotate: direction * -1.2,
        duration: 0.052,
        ease: 'power3.out',
      },
      visibleAt
    );

    timeline.to(
      word,
      {
        x: x + (
          direction
          * window.innerWidth
          * (0.025 + scale * 0.018)
        ),
        y: y + (
          (index % 3 - 1)
          * window.innerHeight
          * (0.026 + scale * 0.012)
        ),
        rotate: direction * (1.8 + scale),
        scale: scale * 1.04,
        duration: 0.15,
        ease: 'power2.inOut',
      },
      0.285
    );

    timeline.to(
      word,
      {
        x: x + (
          direction
          * window.innerWidth
          * (0.09 + scale * 0.04)
        ),
        y: y + (
          (index % 2 === 0 ? -1 : 1)
          * window.innerHeight
          * (0.055 + scale * 0.025)
        ),
        scale: scale * 1.16,
        autoAlpha: 0,
        filter: `blur(${5 + scale * 7}px)`,
        duration: 0.075,
        ease: 'power2.in',
      },
      0.39 + index * 0.002
    );
  });

  timeline.to(
    wordMessage,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.085,
      ease: 'power3.out',
    },
    0.485
  );

  timeline.to(
    wordEyebrow,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.055,
      ease: 'power3.out',
    },
    0.492
  );

  timeline.to(
    wordTitle,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.075,
      ease: 'power3.out',
    },
    0.515
  );

  timeline.to(
    wordCopy,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.065,
      ease: 'power3.out',
    },
    0.55
  );

  timeline.to(
    wordMessage,
    {
      autoAlpha: 0,
      y: -18,
      scale: 0.985,
      filter: 'blur(5px)',
      duration: 0.05,
      ease: 'power2.in',
    },
    0.665
  );

  timeline.to(
    wordCloud,
    {
      autoAlpha: 0,
      duration: 0.02,
    },
    0.71
  );
}

function buildUiTimeline(targets) {
  const {
    intro,
    eyebrow,
    title,
    lead,
    cta,
    hint,
    brand,
    logo,
    brandCloser,
    exitFade,
  } = targets;

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      ease: 'power2.out',
    },
  });

  timeline.to(
    hint,
    {
      opacity: 0,
      y: 8,
      duration: 0.035,
      ease: 'power2.out',
    },
    0
  );
  timeline.to(
    title,
    {
      y: -24,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.inOut',
    },
    0
  );
  timeline.to(
    cta,
    {
      opacity: 0,
      y: 10,
      duration: 0.06,
    },
    0.025
  );
  timeline.to(
    lead,
    {
      opacity: 0,
      duration: 0.075,
    },
    0.055
  );
  timeline.to(
    eyebrow,
    {
      opacity: 0,
      duration: 0.06,
    },
    0.13
  );
  timeline.to(
    intro,
    {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.035,
    },
    0.235
  );

  if (HERO_MODE === 'words') {
    addWordSequence(timeline, targets);
  } else {
    addChapterSequence(timeline, targets);
  }

  timeline.to(
    brand,
    {
      autoAlpha: 1,
      duration: 0.035,
    },
    0.725
  );
  timeline.fromTo(
    logo,
    {
      autoAlpha: 0,
      y: 16,
      scale: 0.97,
    },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.065,
      ease: 'power2.out',
    },
    0.745
  );
  timeline.fromTo(
    brandCloser,
    {
      autoAlpha: 0,
      y: 8,
    },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.05,
      ease: 'power2.out',
    },
    0.805
  );

  timeline.to(
    exitFade,
    {
      opacity: 1,
      duration: 0.075,
      ease: 'power1.inOut',
    },
    0.855
  );
  timeline.to(
    logo,
    {
      opacity: 0.58,
      duration: 0.06,
      ease: 'power1.in',
    },
    0.87
  );
  timeline.to(
    brandCloser,
    {
      autoAlpha: 0,
      duration: 0.05,
      ease: 'power1.in',
    },
    0.875
  );

  return timeline;
}

function initReduced(root, targets) {
  const {
    scrollEl,
    stickyEl,
    chapters,
    wordCloud,
    brand,
    hint,
    imageFallback,
  } = targets;

  scrollEl.style.height = 'auto';
  stickyEl.style.minHeight = '100svh';

  const hiddenTargets = [
    chapters,
    wordCloud,
    brand,
    hint,
  ].filter(Boolean);

  gsap.set(
    hiddenTargets,
    {
      autoAlpha: 0,
    }
  );

  if (imageFallback && HERO_USES_THREE_SCENE) {
    gsap.set(
      imageFallback,
      {
        autoAlpha: 1,
      }
    );
  }

  root.classList.add(
    'is-video-hero-mounted',
    'is-video-hero-reduced',
    'is-video-ready',
    'is-webgl-reduced'
  );

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.minHeight = '';
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-reduced',
      'is-video-ready',
      'is-webgl-reduced'
    );
  };
}

export function initVideoHeroAnimation() {
  const root = document.querySelector(
    '[data-vl-video-hero-root]'
  );

  if (!root) return () => {};

  const targets = collectTargets(root);
  const {
    scrollEl,
    stickyEl,
    canvas,
    cta,
  } = targets;

  if (!scrollEl || !stickyEl) {
    return () => {};
  }

  if (HERO_MODE === 'words') {
    root.classList.add('is-word-cloud-hero');
  }

  if (prefersReducedMotion()) {
    return initReduced(root, targets);
  }

  let disposed = false;
  let ctx = null;
  let mm = null;
  let mainTrigger = null;
  let uiTimeline = null;
  let resizeObserver = null;
  let refreshTimer = null;
  let goldSweepCleanup = () => {};
  let sceneController = null;

  const syncScene = (progress) => {
    sceneController?.setProgress(progress);
  };

  const setupScroll = () => {
    if (disposed) return;

    syncScene(0);

    if (cta) {
      goldSweepCleanup = bindGoldSweep(cta);
    }

    mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px)',
        tablet: (
          '(min-width: 768px) '
          + 'and (max-width: 1023px)'
        ),
        mobile: '(max-width: 767px)',
      },
      (context) => {
        const {
          desktop,
          tablet,
        } = context.conditions;
        const scrollVh = (
          desktop
            ? SCROLL_VH.desktop
            : tablet
              ? SCROLL_VH.tablet
              : SCROLL_VH.mobile
        );

        setScrollHeight(
          scrollEl,
          scrollVh
        );

        ctx = gsap.context(() => {
          uiTimeline = buildUiTimeline(targets);

          mainTrigger = ScrollTrigger.create({
            animation: uiTimeline,
            trigger: scrollEl,
            start: `top top+=${START_OFFSET_PX}`,
            end: `bottom bottom+=${END_OFFSET_PX}`,
            scrub: SCRUB,
            pin: stickyEl,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              syncScene(
                computeSceneProgress(self)
              );
            },
          });

          uiTimeline.progress(
            mainTrigger.progress
          );
          syncScene(
            computeSceneProgress(mainTrigger)
          );
          sceneController?.renderOnce();
          root.classList.add(
            'is-video-hero-active'
          );
        }, root);

        root.classList.add(
          'is-video-hero-mounted'
        );
        ScrollTrigger.refresh();

        return () => {
          mainTrigger?.kill();
          mainTrigger = null;
          uiTimeline = null;
          root.classList.remove(
            'is-video-hero-active'
          );
        };
      }
    );

    resizeObserver = new ResizeObserver(() => {
      sceneController?.resize();
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(
        () => ScrollTrigger.refresh(),
        120
      );
    });
    resizeObserver.observe(stickyEl);
  };

  const boot = () => {
    if (disposed) return;

    if (!HERO_USES_THREE_SCENE) {
      root.classList.add(
        'is-word-cloud-hero',
        'is-video-ready'
      );
      setupScroll();
      return;
    }

    if (!canvas) {
      root.classList.add(
        'is-webgl-error',
        'is-video-ready'
      );
      setupScroll();
      return;
    }

    sceneController = createHeroThreeScene({
      canvas,
      root,
    });

    if (sceneController) {
      sceneController.renderOnce();
      root.classList.add(
        'is-webgl-ready',
        'is-video-ready'
      );
    } else {
      root.classList.add(
        'is-webgl-error',
        'is-video-ready'
      );
    }

    setupScroll();
  };

  boot();

  return () => {
    disposed = true;
    clearTimeout(refreshTimer);

    goldSweepCleanup();

    sceneController?.destroy();
    sceneController = null;

    mainTrigger?.kill();
    mainTrigger = null;
    uiTimeline = null;

    ctx?.revert();
    ctx = null;
    mm?.revert();
    mm = null;

    resizeObserver?.disconnect();
    resizeObserver = null;

    scrollEl.style.height = '';
    stickyEl.style.removeProperty(
      'min-height'
    );

    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-active',
      'is-video-ready',
      'is-video-hero-reduced',
      'is-image-hero-ready',
      'is-webgl-ready',
      'is-webgl-error',
      'is-webgl-reduced',
      'is-word-cloud-hero'
    );
  };
}
