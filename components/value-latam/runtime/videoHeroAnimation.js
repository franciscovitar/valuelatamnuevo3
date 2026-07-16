import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const SCRUB = 0.65;
const SCROLL_VH = {
  desktop: 360,
  tablet: 315,
  mobile: 260,
};

const SERVICE_MUTED = 'rgba(246, 243, 236, 0.38)';
const SERVICE_GOLD = '#E2C98A';

function setScrollHeight(scrollEl, vh) {
  scrollEl.style.height = `${vh}vh`;
}

function collectTargets(root) {
  return {
    root,
    scrollEl: root.querySelector('[data-video-hero-scroll]'),
    stickyEl: root.querySelector('[data-video-hero-sticky]'),
    video: root.querySelector('[data-video-hero-video]'),
    intro: root.querySelector('[data-video-hero-intro]'),
    eyebrow: root.querySelector('[data-video-hero-eyebrow]'),
    title: root.querySelector('[data-video-hero-title]'),
    lead: root.querySelector('[data-video-hero-lead]'),
    closer: root.querySelector('[data-video-hero-closer]'),
    cta: root.querySelector('[data-video-hero-cta]'),
    scrollHint: root.querySelector('[data-video-hero-scroll-hint]'),
    services: root.querySelector('[data-video-hero-services]'),
    servicesTagline: root.querySelector('[data-video-hero-services-tagline]'),
    servicesList: root.querySelector('[data-video-hero-services-list]'),
    serviceItems: gsap.utils.toArray(root.querySelectorAll('[data-video-hero-service]')),
    serviceLine: root.querySelector('[data-video-hero-service-line]'),
    wordmark: root.querySelector('[data-video-hero-wordmark]'),
    wordmarkOutline: root.querySelector('[data-video-hero-wordmark-outline]'),
    wordmarkFill: root.querySelector('[data-video-hero-wordmark-fill]'),
    wordmarkCloser: root.querySelector('[data-video-hero-wordmark-closer]'),
    navyFade: root.querySelector('[data-video-hero-navy-fade]'),
    bottomTransition: root.querySelector('[data-video-hero-bottom-transition]'),
  };
}

function measureServiceLine(serviceItems, servicesList) {
  if (!servicesList || !serviceItems.length) return [];

  return serviceItems.map((item) => ({
    x: item.offsetLeft,
    width: item.offsetWidth,
  }));
}

function applyServiceLine(line, positions, index) {
  const pos = positions[index];
  if (!line || !pos) return;
  gsap.set(line, { x: pos.x, width: pos.width, opacity: 1 });
}

function computeVideoTime(progress, usableDuration, holdEnd = 0.06) {
  const clamped = gsap.utils.clamp(0, 1, progress);
  if (clamped <= holdEnd) {
    return usableDuration * (clamped / holdEnd) * 0.02;
  }
  const segment = (clamped - holdEnd) / (1 - holdEnd);
  return usableDuration * (0.02 + segment * 0.98);
}

function syncVideoTime(video, videoState, progress, usableDuration) {
  const nextTime = computeVideoTime(progress, usableDuration);
  videoState.time = nextTime;
  if (Number.isFinite(nextTime) && Math.abs(video.currentTime - nextTime) > 1 / 60) {
    video.currentTime = nextTime;
  }
}

function setLandingState(targets) {
  const {
    intro,
    eyebrow,
    title,
    lead,
    closer,
    cta,
    scrollHint,
    services,
    servicesTagline,
    serviceItems,
    serviceLine,
    wordmark,
    wordmarkOutline,
    wordmarkFill,
    wordmarkCloser,
    navyFade,
    bottomTransition,
    video,
  } = targets;

  gsap.set(intro, { opacity: 1, pointerEvents: 'auto' });
  gsap.set(eyebrow, { opacity: 1, y: 0 });
  gsap.set(title, { opacity: 1, y: 0, scale: 1, transformOrigin: 'center center' });
  gsap.set([lead, closer], { opacity: 1, y: 0 });
  gsap.set(cta, { opacity: 1, y: 0 });
  gsap.set(scrollHint, { opacity: 1, y: 0 });
  gsap.set(services, { opacity: 0, clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' });
  gsap.set(servicesTagline, { opacity: 0, y: 6 });
  gsap.set(serviceItems, { opacity: 0.38, color: SERVICE_MUTED });
  gsap.set(serviceLine, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
  gsap.set(wordmark, { opacity: 0, y: 0, pointerEvents: 'none' });
  gsap.set(wordmarkOutline, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
  gsap.set(wordmarkFill, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
  gsap.set(wordmarkCloser, { opacity: 0, y: 10 });
  gsap.set(navyFade, { opacity: 0 });
  gsap.set(bottomTransition, { opacity: 0 });
  if (video) gsap.set(video, { opacity: 0 });
}

function buildTimeline(targets, video, videoState, usableDuration) {
  const {
    eyebrow,
    title,
    lead,
    closer,
    cta,
    scrollHint,
    intro,
    services,
    servicesTagline,
    serviceItems,
    serviceLine,
    servicesList,
    wordmark,
    wordmarkOutline,
    wordmarkFill,
    wordmarkCloser,
    navyFade,
    bottomTransition,
  } = targets;

  const linePositions = measureServiceLine(serviceItems, servicesList);
  const tl = gsap.timeline({ defaults: { ease: 'none' } });

  tl.to(
    videoState,
    {
      time: usableDuration * 0.02,
      duration: 0.06,
      ease: 'none',
      onUpdate: () => {
        const nextTime = videoState.time;
        if (Number.isFinite(nextTime) && Math.abs(video.currentTime - nextTime) > 1 / 60) {
          video.currentTime = nextTime;
        }
      },
    },
    0,
  );

  tl.to(
    videoState,
    {
      time: usableDuration,
      duration: 0.94,
      ease: 'none',
      onUpdate: () => {
        const nextTime = videoState.time;
        if (Number.isFinite(nextTime) && Math.abs(video.currentTime - nextTime) > 1 / 60) {
          video.currentTime = nextTime;
        }
      },
    },
    0.06,
  );

  tl.to(scrollHint, { opacity: 0, y: 10, duration: 0.04, ease: 'power1.out' }, 0.06);
  tl.to(cta, { opacity: 0, y: 14, duration: 0.05, ease: 'power1.out' }, 0.10);
  tl.to(lead, { opacity: 0, duration: 0.07, ease: 'power1.out' }, 0.12);
  tl.to(closer, { opacity: 0, duration: 0.07, ease: 'power1.out' }, 0.14);
  tl.to(title, { y: -32, scale: 0.94, duration: 0.10, ease: 'power2.inOut' }, 0.14);
  tl.to(eyebrow, { opacity: 0, duration: 0.05, ease: 'power1.out' }, 0.20);
  tl.to(intro, { opacity: 0, pointerEvents: 'none', duration: 0.04, ease: 'power1.out' }, 0.22);

  tl.to(
    services,
    { opacity: 1, clipPath: 'inset(0 0% 0 0)', pointerEvents: 'auto', duration: 0.06, ease: 'power2.out' },
    0.22,
  );
  tl.to(serviceLine, { scaleX: 1, duration: 0.04, ease: 'power2.out' }, 0.24);

  serviceItems.forEach((item, index) => {
    const start = 0.26 + index * 0.10;
    const end = start + 0.10;
    const pos = linePositions[index];

    if (pos) {
      tl.to(serviceLine, { x: pos.x, width: pos.width, duration: 0.10, ease: 'power2.inOut' }, start);
    }

    tl.to(
      item,
      {
        opacity: 1,
        color: SERVICE_GOLD,
        duration: 0.03,
        ease: 'power1.out',
      },
      start,
    );
    tl.to(
      item,
      { opacity: 0.38, color: SERVICE_MUTED, duration: 0.03, ease: 'power1.in' },
      end - 0.02,
    );
  });

  tl.to(servicesTagline, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.42);
  tl.to(servicesTagline, { opacity: 0, duration: 0.05, ease: 'power1.in' }, 0.64);

  tl.to(services, { opacity: 0, clipPath: 'inset(0 0 18% 0)', pointerEvents: 'none', duration: 0.06 }, 0.64);
  tl.to(serviceLine, { opacity: 0, duration: 0.04 }, 0.64);

  tl.to(wordmark, { opacity: 1, duration: 0.04, ease: 'power1.out' }, 0.64);
  tl.to(
    wordmarkOutline,
    { opacity: 0.72, clipPath: 'inset(0 0 0 0)', duration: 0.06, ease: 'power2.out' },
    0.64,
  );
  tl.to(
    wordmarkFill,
    { opacity: 0.92, clipPath: 'inset(0 0 0 0)', duration: 0.10, ease: 'power2.out' },
    0.72,
  );
  tl.to(wordmarkCloser, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.82);

  tl.to(navyFade, { opacity: 0.72, duration: 0.10, ease: 'power1.in' }, 0.88);
  tl.to(wordmark, { y: -14, opacity: 0.68, duration: 0.10, ease: 'power1.inOut' }, 0.88);
  tl.to(wordmarkCloser, { opacity: 0, duration: 0.08, ease: 'power1.in' }, 0.90);
  tl.to(bottomTransition, { opacity: 1, duration: 0.12, ease: 'power1.in' }, 0.92);

  return tl;
}

function initStaticReduced(root, targets) {
  const { scrollEl, stickyEl, video, services, wordmark } = targets;

  scrollEl.style.height = 'auto';
  stickyEl.style.position = 'relative';
  stickyEl.style.minHeight = '100svh';

  setLandingState(targets);
  gsap.set(services, { display: 'none' });
  gsap.set(wordmark, { display: 'none' });

  if (video) {
    video.pause();
    gsap.set(video, { opacity: 1 });
    video.currentTime = 0;
  }

  root.classList.add('is-video-hero-mounted', 'is-video-hero-reduced');

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.position = '';
    stickyEl.style.minHeight = '';
    gsap.set(services, { clearProps: 'display' });
    gsap.set(wordmark, { clearProps: 'display' });
    root.classList.remove('is-video-hero-mounted', 'is-video-hero-reduced', 'is-video-ready', 'is-video-error');
  };
}

function initErrorFallback(root, targets, ctxRef) {
  const { scrollEl, stickyEl, video } = targets;

  root.classList.add('is-video-error');
  scrollEl.style.height = 'auto';
  stickyEl.style.position = 'relative';
  stickyEl.style.minHeight = '100svh';

  setLandingState(targets);
  if (video) {
    video.pause();
    gsap.set(video, { opacity: 0 });
  }

  ctxRef.current?.revert();
  ctxRef.current = null;

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.position = '';
    stickyEl.style.minHeight = '';
    root.classList.remove('is-video-error', 'is-video-ready', 'is-video-hero-mounted', 'is-video-hero-active');
  };
}

function waitForVideoMetadata(video) {
  return new Promise((resolve) => {
    if (!video) {
      resolve(0);
      return;
    }

    if (Number.isFinite(video.duration) && video.duration > 0) {
      resolve(Math.max(video.duration - 0.04, 0));
      return;
    }

    const onReady = () => {
      cleanup();
      resolve(Math.max(video.duration - 0.04, 0));
    };

    const onError = () => {
      cleanup();
      resolve(-1);
    };

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('error', onError);
    };

    video.addEventListener('loadedmetadata', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.load();
  });
}

export function initVideoHeroAnimation() {
  const root = document.querySelector('[data-vl-video-hero-root]');
  if (!root) return () => {};

  const targets = collectTargets(root);
  const { scrollEl, stickyEl, video, cta } = targets;

  if (!scrollEl || !stickyEl) return () => {};

  if (prefersReducedMotion()) {
    return initStaticReduced(root, targets);
  }

  let ctx = null;
  let mm = null;
  let scrollTrigger = null;
  let resizeObserver = null;
  let refreshTimer = null;
  let disposed = false;
  let goldSweepCleanup = () => {};
  let videoReadyHandler = null;
  let errorHandler = null;
  let errorFallbackCleanup = null;

  const ctxRef = { current: null };

  const boot = async () => {
    const usableDuration = await waitForVideoMetadata(video);

    if (disposed) return;

    if (usableDuration < 0) {
      errorFallbackCleanup = initErrorFallback(root, targets, ctxRef);
      return;
    }

    const videoState = { time: 0 };
    video.pause();

    videoReadyHandler = () => {
      root.classList.add('is-video-ready');
      gsap.to(video, { opacity: 1, duration: 0.45, ease: 'power2.out' });
    };

    if (video.readyState >= 2) {
      videoReadyHandler();
    } else {
      video.addEventListener('loadeddata', videoReadyHandler, { once: true });
      video.addEventListener('canplay', videoReadyHandler, { once: true });
    }

    errorHandler = () => {
      if (errorFallbackCleanup) return;
      errorFallbackCleanup = initErrorFallback(root, targets, ctxRef);
      mm?.revert();
      mm = null;
    };
    video.addEventListener('error', errorHandler);

    if (cta) {
      goldSweepCleanup = bindGoldSweep(cta);
    }

    mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        mobile: '(max-width: 767px)',
      },
      (context) => {
        const { desktop, tablet } = context.conditions;
        const scrollVh = desktop
          ? SCROLL_VH.desktop
          : tablet
            ? SCROLL_VH.tablet
            : SCROLL_VH.mobile;

        setScrollHeight(scrollEl, scrollVh);
        setLandingState(targets);

        ctx = gsap.context(() => {
          const tl = buildTimeline(targets, video, videoState, usableDuration);

          scrollTrigger = ScrollTrigger.create({
            animation: tl,
            trigger: scrollEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: SCRUB,
            pin: stickyEl,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              const positions = measureServiceLine(targets.serviceItems, targets.servicesList);
              positions.forEach((pos, index) => {
                if (scrollTrigger.progress >= 0.26 + index * 0.10) {
                  applyServiceLine(targets.serviceLine, positions, index);
                }
              });
            },
          });

          syncVideoTime(video, videoState, scrollTrigger.progress, usableDuration);
          tl.progress(scrollTrigger.progress);

          root.classList.add('is-video-hero-active');
        }, root);

        ctxRef.current = ctx;
        root.classList.add('is-video-hero-mounted');
        ScrollTrigger.refresh();

        return () => {
          scrollTrigger?.kill();
          scrollTrigger = null;
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

  boot();

  return () => {
    disposed = true;
    clearTimeout(refreshTimer);

    if (errorFallbackCleanup) {
      errorFallbackCleanup();
      errorFallbackCleanup = null;
    }

    goldSweepCleanup();
    video?.pause();

    if (videoReadyHandler) {
      video.removeEventListener('loadeddata', videoReadyHandler);
      video.removeEventListener('canplay', videoReadyHandler);
    }
    if (errorHandler) {
      video.removeEventListener('error', errorHandler);
    }

    scrollTrigger?.kill();
    scrollTrigger = null;
    ctx?.revert();
    ctx = null;
    mm?.revert();
    mm = null;
    resizeObserver?.disconnect();
    resizeObserver = null;

    scrollEl.style.height = '';
    stickyEl.style.removeProperty('position');
    stickyEl.style.removeProperty('min-height');

    root.classList.remove(
      'is-video-hero-mounted',
      'is-video-hero-active',
      'is-video-ready',
      'is-video-error',
      'is-video-hero-reduced',
    );
  };
}
