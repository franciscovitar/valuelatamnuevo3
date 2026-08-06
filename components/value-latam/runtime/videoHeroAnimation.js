import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { getLenis, scrollToTop } from '@/lib/scroll/lenis';
import { refreshScrollTriggers } from '@/lib/scroll/routeScroll';
import {
  HERO_MARK_REVEALS,
  HERO_SCENE,
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

/*
 * El contenedor necesita la altura de la escena (100svh) mas el recorrido que
 * consume la narrativa. Es lo que le da al hijo sticky algo sobre lo que
 * pegarse: con 100svh justos no hay pin posible.
 */
function setScrollHeight(scrollEl) {
  scrollEl.style.height = `${100 + getHeroScrollDistanceVh()}svh`;
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
  setMarkInitialState(timeline, targets);
  addWordCloud(timeline, targets);
  addMarkReveal(timeline, targets);
  addHeroExit(timeline, targets);
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

/*
 * Estado de la nube. Se escribe estilo inline directo en vez de usar tweens
 * por palabra: la proyeccion se recalcula entera en cada frame y crear 16
 * tweens por frame seria trabajo tirado.
 */
const cloudState = {
  entries: [],
  progress: 0,
};

function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function refreshCloudEntries(targets) {
  const layoutName = getLayoutName();

  cloudState.entries = [];

  targets.words.forEach((element) => {
    const baseWord = getWordConfig(element.dataset.heroWord);

    if (!baseWord || !isWordVisible(baseWord, layoutName)) {
      element.style.display = 'none';
      return;
    }

    element.style.display = 'block';
    element.style.transformOrigin = '50% 50%';

    cloudState.entries.push({
      element,
      word: getResponsiveWord(baseWord, layoutName),
    });
  });
}

/**
 * Proyecta la nube para un avance de camara normalizado (0 -> 1).
 * Escala y distancia radial comparten el divisor `k = focal / z`, de modo que
 * una palabra cercana crece y se abre hacia el borde mas rapido que una
 * lejana sin necesidad de easings por elemento.
 */
function renderCloud(progress) {
  cloudState.progress = progress;

  const layout = getLayout();
  const { focal, zNear, zContent, cameraTravel } = HERO_SCENE;
  const cameraZ = progress * cameraTravel;
  const unitX = window.innerWidth * 0.01 * layout.xFactor;
  const unitY = window.innerHeight * 0.01 * layout.yFactor;

  cloudState.entries.forEach(({ element, word }) => {
    const z = word.z0 - cameraZ;

    if (z <= zNear) {
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
      return;
    }

    const k = focal / z;

    // Nace tenue junto al punto de fuga y se apaga al alcanzar la camara.
    const born = clamp01((k - 0.16) / 0.34);
    const exit = clamp01((z - zNear) / 0.6);
    const alpha = born * exit
      * (word.opacity ?? 1)
      * (word.depth === 'far' ? 0.62 : 1);

    // Blur solo en lo muy lejano: la profundidad la comunica la escala.
    const blur = k >= 0.5 ? 0 : Math.min(2.2, (0.5 - k) * 6);

    element.style.visibility = alpha > 0.004 ? 'visible' : 'hidden';
    element.style.opacity = alpha.toFixed(3);
    element.style.filter = blur > 0.02 ? `blur(${blur.toFixed(2)}px)` : 'none';
    element.style.transform = `translate3d(${(word.wx * k * unitX).toFixed(2)}px, ${(word.wy * k * unitY).toFixed(2)}px, 0) scale(${k.toFixed(4)}) rotate(${word.rotation}deg)`;

    // Mas cerca que el plano del bloque central => pasa por delante del logo.
    element.style.zIndex = z > zContent
      ? String(Math.round(40 - Math.min(z, 6) * 4))
      : String(Math.round(150 + (zContent - z) * 60));
  });
}

/*
 * Salida del bloque central mientras la seccion sigue pinneada. El simbolo
 * arranca antes que la copia: el bloque no se va rigido, se deshace de arriba
 * hacia abajo. Cuando el sticky finalmente suelta, la escena ya esta vacia y
 * el paso a la seccion siguiente no deja un vacio negro.
 */
function addHeroExit(timeline, targets) {
  const start = HERO_TIMELINE.exitAt;
  const span = 1 - start;
  const anchor = targets.root.querySelector('[data-hero-mark-anchor]');

  if (anchor) {
    timeline.to(anchor, {
      y: () => -window.innerHeight * 0.52,
      autoAlpha: 0,
      duration: span * 0.86,
      ease: 'power2.in',
    }, start);
  }

  if (targets.copy) {
    timeline.to(targets.copy, {
      y: () => -window.innerHeight * 0.42,
      autoAlpha: 0,
      duration: span * 0.88,
      ease: 'power2.in',
    }, start + span * 0.12);
  }
}

function addWordCloud(timeline, targets) {
  refreshCloudEntries(targets);

  const camera = { progress: 0 };

  timeline.to(camera, {
    progress: 1,
    duration: HERO_SCENE.cloudEnd,
    ease: 'none',
    onUpdate: () => renderCloud(camera.progress),
  }, 0);

  renderCloud(0);
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

  // Estado base de la salida: sin esto el scroll inverso no devuelve el
  // bloque a su lugar y un remount por resize lo dejaria fuera de pantalla.
  const anchor = targets.root.querySelector('[data-hero-mark-anchor]');

  if (anchor) {
    timeline.set(anchor, { y: 0, autoAlpha: 1 }, 0);
  }

  if (targets.copy) {
    timeline.set(targets.copy, { y: 0, autoAlpha: 1 }, 0);
  }

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

      // Mismo layout: la proyeccion sigue en pixeles del viewport anterior y
      // solo se recalcula en el onUpdate del timeline, que no dispara si el
      // usuario redimensiona sin scrollear.
      setScrollHeight(targets.scrollEl);
      renderCloud(cloudState.progress);
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
