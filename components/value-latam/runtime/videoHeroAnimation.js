import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const SCRUB = 0.55;
const SCROLL_VH = { desktop: 320, tablet: 290, mobile: 240 };
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
    media: root.querySelector('[data-video-hero-video]'),
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

function cameraAtProgress(progress) {
  const p = gsap.utils.clamp(0, 1, progress);

  if (p <= 0.28) {
    const t = p / 0.28;
    return {
      scale: gsap.utils.interpolate(1.04, 1.09, t),
      xPercent: gsap.utils.interpolate(0, -1.2, t),
      yPercent: gsap.utils.interpolate(0, -0.8, t),
    };
  }

  if (p <= 0.74) {
    const t = (p - 0.28) / 0.46;
    return {
      scale: gsap.utils.interpolate(1.09, 1.16, t),
      xPercent: gsap.utils.interpolate(-1.2, -3.2, t),
      yPercent: gsap.utils.interpolate(-0.8, -2.2, t),
    };
  }

  const t = (p - 0.74) / 0.26;
  return {
    scale: gsap.utils.interpolate(1.16, 1.22, t),
    xPercent: gsap.utils.interpolate(-3.2, -4.5, t),
    yPercent: gsap.utils.interpolate(-2.2, -3.2, t),
  };
}

function buildUiTimeline(targets, syncCamera) {
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

  tl.eventCallback('onUpdate', () => syncCamera(tl.progress()));

  tl.to(hint, { opacity: 0, y: 8, duration: 0.04 }, 0.08);
  tl.to(cta, { opacity: 0, y: 10, duration: 0.05 }, 0.10);
  tl.to(lead, { opacity: 0, duration: 0.06 }, 0.12);
  tl.to(title, { y: -24, opacity: 0, duration: 0.10, ease: 'power2.inOut' }, 0.14);
  tl.to(eyebrow, { opacity: 0, duration: 0.05 }, 0.18);
  tl.to(intro, { opacity: 0, pointerEvents: 'none', duration: 0.04 }, 0.26);

  tl.to(chapters, { autoAlpha: 1, duration: 0.04 }, 0.24);
  tl.to(kicker, { opacity: 1, duration: 0.05 }, 0.26);

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

  tl.to(chapters, { autoAlpha: 0, duration: 0.05 }, 0.74);

  tl.to(brand, { autoAlpha: 1, duration: 0.04 }, 0.72);
  tl.fromTo(
    logo,
    { autoAlpha: 0, y: 18, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.08, ease: 'power2.out' },
    0.74,
  );
  tl.fromTo(
    brandCloser,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.06, ease: 'power2.out' },
    0.82,
  );

  tl.to(exitFade, { opacity: 1, duration: 0.09, ease: 'power1.in' }, 0.91);
  tl.to(logo, { opacity: 0.68, duration: 0.08, ease: 'power1.in' }, 0.91);
  tl.to(brandCloser, { autoAlpha: 0, duration: 0.06, ease: 'power1.in' }, 0.93);

  return tl;
}

function waitForMedia(media) {
  return new Promise((resolve) => {
    if (!media) {
      resolve(false);
      return;
    }

    if (media.complete && media.naturalWidth > 0) {
      resolve(true);
      return;
    }

    const finish = (ok) => {
      media.removeEventListener('load', onLoad);
      media.removeEventListener('error', onError);
      resolve(ok);
    };

    const onLoad = () => finish(media.naturalWidth > 0);
    const onError = () => finish(false);

    media.addEventListener('load', onLoad, { once: true });
    media.addEventListener('error', onError, { once: true });
  });
}

function initReduced(root, targets) {
  const { scrollEl, stickyEl, media, chapters, brand, hint } = targets;

  scrollEl.style.height = 'auto';
  stickyEl.style.minHeight = '100svh';
  gsap.set([chapters, brand, hint], { autoAlpha: 0 });

  if (media) {
    gsap.set(media, { clearProps: 'transform' });
  }

  root.classList.add('is-video-hero-mounted', 'is-video-hero-reduced', 'is-video-ready');

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.minHeight = '';
    root.classList.remove('is-video-hero-mounted', 'is-video-hero-reduced', 'is-video-ready', 'is-video-error');
  };
}

function initErrorFallback(root, targets) {
  const { scrollEl, stickyEl, media, chapters, brand, hint } = targets;

  scrollEl.style.height = 'auto';
  stickyEl.style.minHeight = '100svh';
  gsap.set([chapters, brand, hint], { autoAlpha: 0 });

  if (media) {
    gsap.set(media, { opacity: 0 });
  }

  root.classList.add('is-video-hero-mounted', 'is-video-error');

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.minHeight = '';
    root.classList.remove('is-video-hero-mounted', 'is-video-error', 'is-video-ready', 'is-video-hero-active');
  };
}

export function initVideoHeroAnimation() {
  const root = document.querySelector('[data-vl-video-hero-root]');
  if (!root) return () => {};

  const targets = collectTargets(root);
  const { scrollEl, stickyEl, media, cta } = targets;

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
  let errorCleanup = null;

  const syncCamera = (progress) => {
    if (!media) return;

    const { scale, xPercent, yPercent } = cameraAtProgress(progress);
    gsap.set(media, {
      scale,
      xPercent,
      yPercent,
      transformOrigin: '58% center',
      force3D: true,
    });
  };

  const markMediaReady = () => {
    if (disposed || root.classList.contains('is-video-ready')) return;
    root.classList.add('is-video-ready');
    gsap.to(media, { opacity: 1, duration: 0.42, ease: 'power2.out' });
  };

  const setupScroll = () => {
    if (disposed || errorCleanup) return;

    syncCamera(0);

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
          uiTimeline = buildUiTimeline(targets, syncCamera);

          mainTrigger = ScrollTrigger.create({
            animation: uiTimeline,
            trigger: scrollEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: SCRUB,
            pin: stickyEl,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });

          uiTimeline.progress(mainTrigger.progress);
          syncCamera(mainTrigger.progress);
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
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    resizeObserver.observe(stickyEl);
  };

  const boot = async () => {
    const mediaReady = await waitForMedia(media);

    if (disposed) return;

    if (!mediaReady) {
      errorCleanup = initErrorFallback(root, targets);
      return;
    }

    markMediaReady();
    setupScroll();
  };

  boot();

  return () => {
    disposed = true;
    clearTimeout(refreshTimer);

    errorCleanup?.();
    errorCleanup = null;
    goldSweepCleanup();

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
    media?.style.removeProperty('transform');
    media?.style.removeProperty('opacity');

    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-active',
      'is-video-ready',
      'is-video-error',
      'is-video-hero-reduced',
    );
  };
}
