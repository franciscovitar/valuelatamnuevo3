import { gsap } from '@/lib/scroll/gsap';
import { ScrollTrigger } from '@/lib/scroll/gsap';
import { SCROLL_ANCHOR_OFFSET } from '@/lib/scroll/config';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const SCRUB = 0.95;

function getScrollHeight() {
  if (typeof window === 'undefined') return 340;
  if (window.matchMedia('(max-width: 760px)').matches) return 260;
  if (window.matchMedia('(max-width: 1024px)').matches) return 300;
  return 340;
}

function getMediaTransform() {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches) {
    return { scale: 1.28, yPercent: -10, xPercent: -1 };
  }
  return { scale: 1.52, yPercent: -17, xPercent: -2.5 };
}

function prepareSymbolPaths(svg) {
  const paths = gsap.utils.toArray(svg?.querySelectorAll('.cover-symbol__path') ?? []);
  paths.forEach((path) => {
    let length = 1;
    try {
      length = path.getTotalLength();
    } catch {
      length = 1;
    }
    gsap.set(path, {
      fill: 'transparent',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  });
  return paths;
}

/** Sincroniza video futuro con el progreso 0–1 del Hero. */
export function setCoverMediumProgress(root, progress) {
  const clamped = gsap.utils.clamp(0, 1, progress);
  const video = root?.querySelector('[data-cover-video]');
  if (video?.duration && Number.isFinite(video.duration)) {
    video.currentTime = clamped * video.duration;
  }
}

function initReducedLayout(scroller, sticky, root) {
  scroller.style.height = 'auto';
  sticky.style.position = 'relative';
  sticky.style.minHeight = '100svh';

  gsap.set(root.querySelector('#coverMediaOverlay'), { opacity: 0.32 });
  gsap.set(root.querySelector('#coverExterior'), { opacity: 0 });
  gsap.set(root.querySelector('#coverBrand'), { opacity: 0.35 });
  gsap.set(root.querySelector('#coverLogoOutline'), { opacity: 0 });
  gsap.set(root.querySelector('#coverLogoStage'), { opacity: 0.5 });
  gsap.set(root.querySelector('#coverDissolve'), { opacity: 0 });
  gsap.set(root.querySelector('#coverContent'), { opacity: 1, pointerEvents: 'auto' });

  const paths = root.querySelectorAll('.cover-symbol__path');
  paths.forEach((path) => {
    gsap.set(path, {
      strokeDashoffset: 0,
      fill: path.classList.contains('cover-symbol__path--gold')
        ? 'rgba(191, 160, 90, 0.9)'
        : 'rgba(246, 243, 236, 0.88)',
    });
  });
}

export function initCoverAnimation() {
  const root = document.querySelector('[data-vl-cover-root]');
  const scroller = document.getElementById('coverScroll');
  const sticky = document.getElementById('coverSticky');

  if (!root || !scroller || !sticky) return () => {};

  if (prefersReducedMotion()) {
    initReducedLayout(scroller, sticky, root);
    return () => {
      scroller.style.height = '';
      sticky.style.position = '';
      sticky.style.minHeight = '';
    };
  }

  const scrollVh = getScrollHeight();
  scroller.style.height = `${scrollVh}vh`;

  const media = root.querySelector('#coverMedia');
  const mediaVisual = root.querySelector('#coverMediaVisual');
  const mediaOverlay = root.querySelector('#coverMediaOverlay');
  const exterior = root.querySelector('#coverExterior');
  const content = root.querySelector('#coverContent');
  const eyebrow = root.querySelector('#coverEyebrow');
  const title = root.querySelector('#coverTitle');
  const lead = root.querySelector('#coverLead');
  const actions = root.querySelector('#coverActions');
  const badge = root.querySelector('#coverBadge');
  const hint = root.querySelector('#coverScrollHint');
  const brand = root.querySelector('#coverBrand');
  const symbol = root.querySelector('#coverSymbol');
  const logoOutline = root.querySelector('#coverLogoOutline');
  const logoStage = root.querySelector('#coverLogoStage');
  const logoMask = root.querySelector('#coverLogoMask');
  const maskFill = root.querySelector('#coverLogoMaskFill');
  const dissolve = root.querySelector('#coverDissolve');
  const ivoryPath = root.querySelector('.cover-symbol__path--ivory');
  const goldPath = root.querySelector('.cover-symbol__path--gold');

  const symbolPaths = prepareSymbolPaths(symbol);

  gsap.set(mediaVisual, { scale: 1, yPercent: 0, xPercent: 0, transformOrigin: '50% 38%' });
  gsap.set(maskFill, { scale: 1.12, yPercent: -4, xPercent: -1, transformOrigin: '50% 38%' });
  gsap.set(brand, { opacity: 0 });
  gsap.set(logoOutline, { opacity: 0, scale: 0.94 });
  gsap.set(logoStage, { opacity: 0, scale: 0.9 });
  gsap.set(exterior, { opacity: 0 });
  gsap.set(dissolve, { opacity: 0 });
  gsap.set(media, { opacity: 1 });
  gsap.set(content, { opacity: 1, pointerEvents: 'auto' });

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scroller,
        start: `top top+=${SCROLL_ANCHOR_OFFSET}`,
        end: 'bottom bottom',
        scrub: SCRUB,
        pin: sticky,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setCoverMediumProgress(root, self.progress),
      },
    });

    root.classList.add('is-cover-active');

    // Fase 1 — Presentación (0–20%)
    tl.to(mediaOverlay, { opacity: 0.34, duration: 0.08 }, 0);

    // Fase 2 — Retirada del contenido (15–38%)
    tl.to(hint, { opacity: 0, y: 10, filter: 'blur(2px)', duration: 0.04 }, 0.14);
    tl.to(eyebrow, { opacity: 0, y: -14, filter: 'blur(4px)', duration: 0.05 }, 0.17);
    tl.to(title, { opacity: 0, y: -22, filter: 'blur(4px)', duration: 0.07 }, 0.2);
    tl.to(lead, { opacity: 0, y: -16, filter: 'blur(4px)', duration: 0.05 }, 0.26);
    tl.to(actions, { opacity: 0, y: -14, filter: 'blur(3px)', duration: 0.05 }, 0.29);
    tl.to(badge, { opacity: 0, y: -10, filter: 'blur(3px)', duration: 0.04 }, 0.33);
    tl.add(() => gsap.set(content, { pointerEvents: 'none' }), 0.3);

    // Fase 3 — Movimiento del medio (15–55%)
    tl.to(
      mediaOverlay,
      { opacity: 0.52, duration: 0.14 },
      0.18,
    );
    tl.fromTo(
      mediaVisual,
      { scale: 1, yPercent: 0, xPercent: 0 },
      {
        scale: () => getMediaTransform().scale,
        yPercent: () => getMediaTransform().yPercent,
        xPercent: () => getMediaTransform().xPercent,
        duration: 0.38,
      },
      0.14,
    );

    // Fase 4 — Construcción del logo (32–62%)
    tl.to(brand, { opacity: 1, duration: 0.06 }, 0.32);
    tl.to(symbolPaths, {
      strokeDashoffset: 0,
      stagger: 0.03,
      duration: 0.14,
    }, 0.34);
    tl.to(ivoryPath, {
      fill: 'rgba(246, 243, 236, 0.94)',
      duration: 0.06,
    }, 0.48);
    tl.to(goldPath, {
      fill: 'rgba(191, 160, 90, 0.96)',
      duration: 0.06,
    }, 0.5);
    tl.to(logoOutline, { opacity: 0.42, scale: 1, duration: 0.08 }, 0.5);
    tl.to(symbol, { opacity: 0, scale: 0.82, duration: 0.06 }, 0.54);
    tl.to(logoOutline, { opacity: 0.58, duration: 0.04 }, 0.54);

    // Fase 5 — Logo con imagen en el interior (58–88%)
    tl.to(mediaOverlay, { opacity: 0, duration: 0.06 }, 0.56);
    tl.to(media, { opacity: 0, duration: 0.08 }, 0.56);
    tl.to(exterior, { opacity: 1, duration: 0.1 }, 0.54);
    tl.to(logoOutline, { opacity: 0, scale: 1.02, duration: 0.06 }, 0.58);
    tl.to(logoStage, { opacity: 1, scale: 1, duration: 0.1 }, 0.58);
    tl.to(brand, { opacity: 0, duration: 0.04 }, 0.58);
    tl.fromTo(
      maskFill,
      { scale: 1.12, yPercent: -4, xPercent: -1 },
      {
        scale: () => getMediaTransform().scale * 0.96,
        yPercent: () => getMediaTransform().yPercent * 0.85,
        xPercent: () => getMediaTransform().xPercent,
        duration: 0.26,
      },
      0.6,
    );
    tl.to(logoMask, { scale: 1.06, duration: 0.18 }, 0.64);

    // Fase 6 — Cierre hacia Resultados (86–100%)
    tl.to(logoStage, { scale: 0.96, y: -12, duration: 0.06 }, 0.86);
    tl.to(dissolve, { opacity: 1, duration: 0.1 }, 0.88);
    tl.to(logoStage, { opacity: 0, duration: 0.08 }, 0.92);
    tl.to(exterior, { opacity: 1, duration: 0.04 }, 0.94);
  }, root);

  const onResize = () => {
    scroller.style.height = `${getScrollHeight()}vh`;
    ScrollTrigger.refresh();
  };

  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    root.classList.remove('is-cover-active');
    scroller.style.height = '';
    sticky.style.position = '';
    sticky.style.minHeight = '';
    content?.classList.remove('is-cover-content-hidden');
    ctx.revert();
  };
}
