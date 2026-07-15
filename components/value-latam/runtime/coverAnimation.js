import { gsap } from '@/lib/scroll/gsap';
import { ScrollTrigger } from '@/lib/scroll/gsap';
import { SCROLL_ANCHOR_OFFSET } from '@/lib/scroll/config';
import { getLenis } from '@/lib/scroll/lenis';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import {
  HERO_STATES,
  HERO_TIMELINE,
  designX,
  designY,
  getHeroScale,
} from './heroKeyframes';

const SCRUB = 0.82;
const INTERACTIVE_FROM = 0.32;

function getScrollHeight() {
  if (typeof window === 'undefined') return 280;
  if (window.matchMedia('(max-width: 760px)').matches) return 240;
  if (window.matchMedia('(max-width: 1024px)').matches) return 260;
  return 280;
}

function setContentInteractivity(content, progress) {
  if (!content) return;
  const interactive = progress >= INTERACTIVE_FROM && progress < 0.97;
  content.style.pointerEvents = interactive ? 'auto' : 'none';
  content.classList.toggle('is-cover-interactive', interactive);
}

function setTheme(root, theme) {
  root.classList.toggle('is-theme-gold', theme >= 0.5);
}

function applyState({ scale, content, cards, lines, radial, smoke, root, state }) {
  gsap.set(content, {
    x: designX(state.content.x, scale.x),
    opacity: state.content.opacity,
  });

  cards.forEach((card, index) => {
    const pos = state.cards[index];
    gsap.set(card, {
      x: designX(pos.x, scale.x),
      y: designY(pos.y, scale.y),
      opacity: pos.opacity,
    });
  });

  gsap.set(lines, { opacity: state.linesOpacity });
  gsap.set(radial, { opacity: state.radialOpacity });
  gsap.set(smoke, {
    y: designY(state.smoke.y, scale.y),
    opacity: state.smoke.opacity,
  });
  setTheme(root, state.theme);
}

function tweenState({
  tl,
  at,
  duration,
  scale,
  content,
  cards,
  lines,
  radial,
  smoke,
  root,
  from,
  to,
}) {
  tl.to(
    content,
    {
      x: designX(to.content.x, scale.x),
      opacity: to.content.opacity,
      duration,
      ease: 'none',
    },
    at,
  );

  cards.forEach((card, index) => {
    const target = to.cards[index];
    tl.to(
      card,
      {
        x: designX(target.x, scale.x),
        y: designY(target.y, scale.y),
        opacity: target.opacity,
        duration,
        ease: 'none',
      },
      at,
    );
  });

  if (from.linesOpacity !== to.linesOpacity) {
    tl.to(lines, { opacity: to.linesOpacity, duration, ease: 'none' }, at);
  }

  if (from.radialOpacity !== to.radialOpacity) {
    tl.to(radial, { opacity: to.radialOpacity, duration, ease: 'none' }, at);
  }

  tl.to(
    smoke,
    {
      y: designY(to.smoke.y, scale.y),
      opacity: to.smoke.opacity,
      duration,
      ease: 'none',
    },
    at,
  );

  if (from.theme !== to.theme) {
    const themeProxy = { value: from.theme };
    tl.to(
      themeProxy,
      {
        value: to.theme,
        duration,
        ease: 'none',
        onUpdate: () => setTheme(root, themeProxy.value),
      },
      at,
    );
  }
}

function initReducedLayout(scroller, sticky, root) {
  scroller.style.height = 'auto';
  sticky.style.position = 'relative';
  sticky.style.top = '';
  sticky.style.height = '';
  sticky.style.minHeight = '';

  const scale = getHeroScale(sticky);
  const content = root.querySelector('#coverContent');
  const cards = gsap.utils.toArray(root.querySelectorAll('[data-cover-card]'));
  const lines = root.querySelector('#coverLines');
  const radial = root.querySelector('#coverRadial');
  const smoke = root.querySelector('#coverSmoke');

  applyState({
    scale,
    content,
    cards,
    lines,
    radial,
    smoke,
    root,
    state: HERO_STATES.s4,
  });

  gsap.set(root.querySelector('#coverExit'), { opacity: 0 });
  if (content) {
    content.style.pointerEvents = 'auto';
    content.classList.add('is-cover-interactive');
  }
}

function waitForCoverImages(root) {
  const images = gsap.utils.toArray(root?.querySelectorAll('img') ?? []);
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
    ),
  );
}

function waitForLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function waitForLenis(maxMs = 2500) {
  return new Promise((resolve) => {
    if (getLenis()) {
      resolve();
      return;
    }

    const started = performance.now();
    const tick = () => {
      if (getLenis() || performance.now() - started >= maxMs) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };

    tick();
  });
}

/** Sincroniza video futuro con el progreso 0–1 del Hero. */
export function setCoverMediumProgress(root, progress) {
  const clamped = gsap.utils.clamp(0, 1, progress);
  const video = root?.querySelector('[data-cover-video]');
  if (video?.duration && Number.isFinite(video.duration)) {
    video.currentTime = clamped * video.duration;
  }
}

export function initCoverAnimation() {
  const root = document.querySelector('[data-vl-cover-root]');
  const scroller = document.getElementById('coverScroll');
  const sticky = document.getElementById('coverSticky');

  if (!root || !scroller || !sticky) return () => {};

  if (prefersReducedMotion()) {
    initReducedLayout(scroller, sticky, root);
    root.classList.add('is-cover-ready');
    return () => {
      scroller.style.height = '';
      sticky.style.position = '';
      sticky.style.top = '';
      sticky.style.height = '';
      sticky.style.minHeight = '';
    };
  }

  const content = root.querySelector('#coverContent');
  const cards = gsap.utils.toArray(root.querySelectorAll('[data-cover-card]'));
  const lines = root.querySelector('#coverLines');
  const radial = root.querySelector('#coverRadial');
  const smoke = root.querySelector('#coverSmoke');
  const exit = root.querySelector('#coverExit');

  let ctx;
  let refreshTimer;
  let disposed = false;

  const mountTimeline = () => {
    if (disposed) return;

    ctx?.revert();

    const scale = getHeroScale(sticky);
    const scrollVh = getScrollHeight();
    scroller.style.height = `${scrollVh}vh`;

    setTheme(root, 0);

    applyState({
      scale,
      content,
      cards,
      lines,
      radial,
      smoke,
      root,
      state: HERO_STATES.s1,
    });

    gsap.set(exit, { opacity: 0 });
    setContentInteractivity(content, 0);
    root.classList.add('is-cover-ready');

    const { s1toS2, s2toS3, s3toS4, exit: exitRange } = HERO_TIMELINE;

    ctx = gsap.context(() => {
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
          onUpdate: (self) => {
            setCoverMediumProgress(root, self.progress);
            setContentInteractivity(content, self.progress);
          },
        },
      });

      root.classList.add('is-cover-active');

      tweenState({
        tl,
        at: s1toS2[0],
        duration: s1toS2[1] - s1toS2[0],
        scale,
        content,
        cards,
        lines,
        radial,
        smoke,
        root,
        from: HERO_STATES.s1,
        to: HERO_STATES.s2,
      });

      tweenState({
        tl,
        at: s2toS3[0],
        duration: s2toS3[1] - s2toS3[0],
        scale,
        content,
        cards,
        lines,
        radial,
        smoke,
        root,
        from: HERO_STATES.s2,
        to: HERO_STATES.s3,
      });

      tweenState({
        tl,
        at: s3toS4[0],
        duration: s3toS4[1] - s3toS4[0],
        scale,
        content,
        cards,
        lines,
        radial,
        smoke,
        root,
        from: HERO_STATES.s3,
        to: HERO_STATES.s4,
      });

      tl.to(
        exit,
        { opacity: 0.65, duration: exitRange[1] - exitRange[0], ease: 'none' },
        exitRange[0],
      );
      tl.to(
        [content, ...cards, smoke],
        {
          opacity: 0.15,
          duration: exitRange[1] - exitRange[0],
          ease: 'none',
        },
        exitRange[0],
      );
    }, root);

    ScrollTrigger.refresh();
  };

  applyState({
    scale: getHeroScale(sticky),
    content,
    cards,
    lines,
    radial,
    smoke,
    root,
    state: HERO_STATES.s1,
  });

  const boot = async () => {
    await waitForCoverImages(root);
    await waitForLayout();
    await waitForLenis();
    mountTimeline();
  };

  boot();

  const onResize = () => {
    scroller.style.height = `${getScrollHeight()}vh`;
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      ctx?.revert();
      mountTimeline();
    }, 150);
  };

  window.addEventListener('resize', onResize);

  return () => {
    disposed = true;
    window.removeEventListener('resize', onResize);
    clearTimeout(refreshTimer);
    root.classList.remove('is-cover-active', 'is-cover-ready', 'is-theme-gold');
    scroller.style.height = '';
    sticky.style.position = '';
    sticky.style.top = '';
    sticky.style.height = '';
    sticky.style.minHeight = '';
    if (content) {
      content.style.pointerEvents = '';
      content.classList.remove('is-cover-interactive');
    }
    ctx?.revert();
  };
}
