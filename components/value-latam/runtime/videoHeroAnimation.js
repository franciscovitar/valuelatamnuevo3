import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import { createHeroThreeScene } from './heroThreeScene';

const SCRUB = 0.34;
const START_OFFSET_PX = 16;
const END_OFFSET_PX = 28;
const SCENE_TAIL_START = 0.84;
const SCENE_TAIL_MAX = 0.24;
const SCROLL_VH = { desktop: 290, tablet: 270, mobile: 225 };
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
    scrollEl: root.querySelector('[data-video-hero-scroll]'),
    stickyEl: root.querySelector('[data-video-hero-sticky]'),
    canvas: root.querySelector('[data-video-hero-canvas]'),
    imageFallback: root.querySelector('[data-video-hero-fallback]'),
    intro: root.querySelector('[data-video-hero-intro]'),
    eyebrow: root.querySelector('[data-video-hero-eyebrow]'),
    title: root.querySelector('[data-video-hero-title]'),
    lead: root.querySelector('[data-video-hero-lead]'),
    cta: root.querySelector('[data-video-hero-cta]'),
    hint: root.querySelector('[data-video-hero-scroll-hint]'),
    chapters: root.querySelector('[data-video-hero-chapters]'),
    kicker: root.querySelector('[data-video-hero-chapters-kicker]'),
    chapterItems: gsap.utils.toArray(root.querySelectorAll('[data-video-hero-chapter]')),
    brand: root.querySelector('[data-video-hero-brand]'),
    logo: root.querySelector('[data-video-hero-brand-logo]'),
    brandCloser: root.querySelector('[data-video-hero-brand-closer]'),
    exitFade: root.querySelector('[data-video-hero-exit-fade]'),
  };
}

function computeSceneProgress(trigger) {
  if (!trigger) return 0;

  const uiProgress = trigger.progress;
  if (uiProgress < SCENE_TAIL_START) return uiProgress;

  const scrollSpan = Math.max(trigger.end - trigger.start, 1);
  const scrolled = Math.max(0, trigger.scroll() - trigger.start);
  const inHeroTail = Math.max(0, scrolled - scrollSpan * SCENE_TAIL_START);
  const postHeroScroll = Math.max(0, trigger.scroll() - trigger.end);
  const tailRange =
    scrollSpan * (1 - SCENE_TAIL_START) + Math.max(window.innerHeight * 0.48, 400);
  const tail =
    Math.min((inHeroTail + postHeroScroll * 0.85) / tailRange, 1) * SCENE_TAIL_MAX;

  return Math.min(1 + SCENE_TAIL_MAX, uiProgress + tail);
}

function buildUiTimeline(targets) {
  const {
    intro,
    eyebrow,
    title,
    lead,
    cta,
    hint,
    chapters,
    kicker,
    chapterItems,
    brand,
    logo,
    brandCloser,
    exitFade,
  } = targets;

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });

  tl.to(hint, { opacity: 0, y: 8, duration: 0.035, ease: 'power1.out' }, 0);
  tl.to(title, { y: -24, opacity: 0, duration: 0.18, ease: 'power2.inOut' }, 0);
  tl.to(cta, { opacity: 0, y: 10, duration: 0.06 }, 0.025);
  tl.to(lead, { opacity: 0, duration: 0.075 }, 0.055);
  tl.to(eyebrow, { opacity: 0, duration: 0.06 }, 0.13);
  tl.to(intro, { opacity: 0, pointerEvents: 'none', duration: 0.035 }, 0.235);

  tl.to(chapters, { autoAlpha: 1, duration: 0.04 }, 0.225);
  tl.to(kicker, { opacity: 1, duration: 0.04 }, 0.245);

  chapterItems.forEach((chapter, index) => {
    const [start, end] = CHAPTER_WINDOWS[index];
    const line = chapter.querySelector('.video-hero__chapter-line');
    const fadeOutAt = index === chapterItems.length - 1 ? 0.71 : end - 0.02;

    tl.fromTo(
      chapter,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: CHAPTER_CROSS, ease: 'power2.out' },
      start,
    );
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: CHAPTER_CROSS * 0.85, ease: 'power2.out' }, start);
    tl.to(
      chapter,
      { autoAlpha: 0, y: -18, duration: CHAPTER_CROSS, ease: 'power2.in' },
      fadeOutAt,
    );
    tl.to(line, { scaleX: 0, duration: CHAPTER_CROSS * 0.7, ease: 'power2.in' }, fadeOutAt);
  });

  tl.to(chapters, { autoAlpha: 0, duration: 0.04 }, 0.72);

  tl.to(brand, { autoAlpha: 1, duration: 0.035 }, 0.715);
  tl.fromTo(
    logo,
    { autoAlpha: 0, y: 16, scale: 0.97 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.065, ease: 'power2.out' },
    0.735,
  );
  tl.fromTo(
    brandCloser,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power2.out' },
    0.795,
  );

  tl.to(exitFade, { opacity: 1, duration: 0.075, ease: 'power1.inOut' }, 0.855);
  tl.to(logo, { opacity: 0.58, duration: 0.06, ease: 'power1.in' }, 0.87);
  tl.to(brandCloser, { autoAlpha: 0, duration: 0.05, ease: 'power1.in' }, 0.875);

  return tl;
}

function initReduced(root, targets) {
  const { scrollEl, stickyEl, chapters, brand, hint, imageFallback } = targets;

  scrollEl.style.height = 'auto';
  stickyEl.style.minHeight = '100svh';
  gsap.set([chapters, brand, hint], { autoAlpha: 0 });
  if (imageFallback) gsap.set(imageFallback, { autoAlpha: 1 });

  root.classList.add(
    'is-video-hero-mounted',
    'is-video-hero-reduced',
    'is-video-ready',
    'is-webgl-reduced',
  );

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.minHeight = '';
    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-reduced',
      'is-video-ready',
      'is-webgl-reduced',
    );
  };
}

export function initVideoHeroAnimation() {
  const root = document.querySelector('[data-vl-video-hero-root]');
  if (!root) return () => {};

  const targets = collectTargets(root);
  const { scrollEl, stickyEl, canvas, cta } = targets;

  if (!scrollEl || !stickyEl) return () => {};

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
  let reducedCleanup = null;
  let sceneController = null;

  const syncScene = (progress) => {
    sceneController?.setProgress(progress);
  };

  const setupScroll = () => {
    if (disposed || reducedCleanup) return;

    syncScene(0);

    if (cta) goldSweepCleanup = bindGoldSweep(cta);

    mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        mobile: '(max-width: 767px)',
      },
      (context) => {
        const { desktop, tablet } = context.conditions;
        const scrollVh = desktop ? SCROLL_VH.desktop : tablet ? SCROLL_VH.tablet : SCROLL_VH.mobile;

        setScrollHeight(scrollEl, scrollVh);

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
              syncScene(computeSceneProgress(self));
            },
          });

          uiTimeline.progress(mainTrigger.progress);
          syncScene(computeSceneProgress(mainTrigger));
          sceneController?.renderOnce();
          root.classList.add('is-video-hero-active');
        }, root);

        root.classList.add('is-video-hero-mounted');
        ScrollTrigger.refresh();

        return () => {
          mainTrigger?.kill();
          mainTrigger = null;
          uiTimeline = null;
          root.classList.remove('is-video-hero-active');
        };
      },
    );

    resizeObserver = new ResizeObserver(() => {
      sceneController?.resize();
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    resizeObserver.observe(stickyEl);
  };

  const boot = () => {
    if (disposed) return;

    if (!canvas) {
      root.classList.add('is-webgl-error', 'is-video-ready');
      setupScroll();
      return;
    }

    sceneController = createHeroThreeScene({ canvas, root });

    if (sceneController) {
      sceneController.renderOnce();
      root.classList.add('is-webgl-ready', 'is-video-ready');
    } else {
      root.classList.add('is-webgl-error', 'is-video-ready');
    }

    setupScroll();
  };

  boot();

  return () => {
    disposed = true;
    clearTimeout(refreshTimer);

    reducedCleanup?.();
    reducedCleanup = null;
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
    stickyEl.style.removeProperty('min-height');

    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-active',
      'is-video-ready',
      'is-video-hero-reduced',
      'is-image-hero-ready',
      'is-webgl-ready',
      'is-webgl-error',
      'is-webgl-reduced',
    );
  };
}
