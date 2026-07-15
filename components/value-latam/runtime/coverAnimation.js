import { gsap } from '@/lib/scroll/gsap';
import { ScrollTrigger } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import {
  HERO_CARD_FLOAT,
  HERO_DESIGN,
  HERO_SCROLL_DESKTOP_VH,
  HERO_SCROLL_MOBILE_VH,
  HERO_STATES,
  HERO_THEME,
  HERO_TIMELINE,
} from './heroKeyframes';

const SCRUB = 1.35;
const EASE_MOVE = 'power1.inOut';
const EASE_SOFT = 'sine.inOut';
const EASE_REVEAL = 'power2.out';
const CARD_STAGGER = 0.016;
const LINE_STAGGER = 0.011;
const COPY_ENTRANCE_DELAY = 0.022;

function applyThemeVars(root, themeKey) {
  const vars = HERO_THEME[themeKey];
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function collectTargets(root) {
  return {
    root,
    content: root.querySelector('#coverContent'),
    cards: gsap.utils.toArray(root.querySelectorAll('[data-cover-card]')),
    cardFloats: gsap.utils.toArray(root.querySelectorAll('[data-cover-card-float]')),
    lines: gsap.utils.toArray(root.querySelectorAll('[data-cover-line]')),
    radial: root.querySelector('#coverRadial'),
    smoke: root.querySelector('#coverSmoke'),
  };
}

function applyState(targets, state) {
  const { root, content, cards, lines, radial, smoke } = targets;

  gsap.set(content, {
    x: state.content.x,
    opacity: state.content.opacity,
    force3D: true,
  });

  state.cards.forEach((cardState, index) => {
    gsap.set(cards[index], {
      x: cardState.x,
      y: cardState.y,
      opacity: cardState.opacity,
      force3D: true,
    });
  });

  state.lines.x.forEach((x, index) => {
    gsap.set(lines[index], {
      x,
      opacity: state.lines.opacity,
      force3D: true,
    });
  });

  gsap.set(radial, { opacity: state.radial.opacity });
  gsap.set(smoke, {
    y: state.smoke.y,
    opacity: state.smoke.opacity,
    force3D: true,
  });

  applyThemeVars(root, state.theme === 1 ? 'gold' : 'blue');
}

function segmentDuration(total, offset) {
  return Math.max(total - offset, total * 0.72);
}

function buildTimeline(targets) {
  const { root, content, cards, lines, radial, smoke } = targets;
  const s1 = HERO_STATES.s1;
  const s2 = HERO_STATES.s2;
  const s3 = HERO_STATES.s3;
  const s4 = HERO_STATES.s4;
  const [t12Start, t12End] = HERO_TIMELINE.s1ToS2;
  const [t23Start, t23End] = HERO_TIMELINE.s2ToS3;
  const [t34Start, t34End] = HERO_TIMELINE.s3ToS4;
  const [, tHoldEnd] = HERO_TIMELINE.holdS4;

  const dur12 = t12End - t12Start;
  const dur23 = t23End - t23Start;
  const dur34 = t34End - t34Start;
  const durHold = tHoldEnd - t34End;

  const tl = gsap.timeline({ defaults: { ease: EASE_MOVE } });

  const copyStart = t12Start + COPY_ENTRANCE_DELAY;
  const copyDur12 = segmentDuration(dur12, COPY_ENTRANCE_DELAY);

  tl.fromTo(
    content,
    { x: s1.content.x, opacity: s1.content.opacity },
    { x: s2.content.x, opacity: s2.content.opacity, duration: copyDur12, ease: EASE_MOVE },
    copyStart,
  );

  tl.to(content, { x: s3.content.x, duration: dur23, ease: EASE_SOFT }, t23Start);

  cards.forEach((card, index) => {
    const cardStart = t12Start + index * CARD_STAGGER;
    const cardDur12 = segmentDuration(dur12, index * CARD_STAGGER);
    const revealDur = Math.min(cardDur12 * 0.62, cardDur12 - 0.012);

    tl.fromTo(
      card,
      {
        x: s1.cards[index].x,
        y: s1.cards[index].y,
      },
      {
        x: s2.cards[index].x,
        y: s2.cards[index].y,
        duration: cardDur12,
        ease: EASE_MOVE,
      },
      cardStart,
    );

    tl.fromTo(
      card,
      { opacity: s1.cards[index].opacity },
      { opacity: s2.cards[index].opacity, duration: revealDur, ease: EASE_REVEAL },
      cardStart + CARD_STAGGER * 0.35,
    );

    tl.to(card, { y: s3.cards[index].y, duration: dur23, ease: EASE_SOFT }, t23Start);
    tl.to(card, { y: s4.cards[index].y, duration: dur34, ease: EASE_SOFT }, t34Start);
  });

  lines.forEach((line, index) => {
    const lineStart = t12Start + index * LINE_STAGGER;
    const lineDur12 = segmentDuration(dur12, index * LINE_STAGGER);
    const lineRevealDur = Math.min(lineDur12 * 0.55, lineDur12 - 0.01);

    tl.fromTo(
      line,
      { x: s1.lines.x[index] },
      { x: s2.lines.x[index], duration: lineDur12, ease: EASE_MOVE },
      lineStart,
    );

    tl.fromTo(
      line,
      { opacity: s1.lines.opacity },
      { opacity: s2.lines.opacity, duration: lineRevealDur, ease: EASE_REVEAL },
      lineStart + LINE_STAGGER * 0.4,
    );
  });

  tl.fromTo(
    radial,
    { opacity: s1.radial.opacity },
    { opacity: s2.radial.opacity, duration: dur12 * 0.72, ease: EASE_REVEAL },
    t12Start + 0.012,
  );

  tl.fromTo(
    smoke,
    { y: s1.smoke.y },
    { y: s2.smoke.y, duration: dur12, ease: EASE_MOVE },
    t12Start,
  );

  tl.fromTo(
    smoke,
    { opacity: s1.smoke.opacity },
    { opacity: s2.smoke.opacity, duration: dur12 * 0.68, ease: EASE_REVEAL },
    t12Start + 0.018,
  );

  tl.to(smoke, { y: s3.smoke.y, duration: dur23, ease: EASE_SOFT }, t23Start);

  tl.fromTo(
    root,
    { ...HERO_THEME.blue },
    { ...HERO_THEME.gold, duration: dur23, ease: EASE_SOFT },
    t23Start,
  );

  tl.to({}, { duration: durHold }, t34End);

  return tl;
}

function buildCardFloatAnimations(floatEls) {
  return floatEls.map((el, index) =>
    gsap.fromTo(
      el,
      { y: 0 },
      {
        y: HERO_CARD_FLOAT.amplitude[index] ?? 6,
        duration: HERO_CARD_FLOAT.duration[index] ?? 2.8,
        delay: HERO_CARD_FLOAT.delay[index] ?? index * 0.25,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
      },
    ),
  );
}

function setCardFloatActive(floatAnims, floatEls, active) {
  floatAnims.forEach((anim, index) => {
    if (active) {
      anim.play();
      return;
    }

    anim.pause(0);
    gsap.set(floatEls[index], { y: 0 });
  });
}

function updateStageScale(viewport) {
  if (!viewport) return 1;
  const scale = Math.max(
    viewport.clientWidth / HERO_DESIGN.width,
    viewport.clientHeight / HERO_DESIGN.height,
  );
  viewport.style.setProperty('--hero-stage-scale', String(scale));
  return scale;
}

function setScrollHeight(scrollEl, mobile) {
  scrollEl.style.height = `${mobile ? HERO_SCROLL_MOBILE_VH : HERO_SCROLL_DESKTOP_VH}vh`;
}

function waitForHeroImages(root) {
  const images = gsap.utils.toArray(root.querySelectorAll('img'));
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

function initStaticReduced(root, scrollEl, stickyEl, viewport) {
  setScrollHeight(scrollEl, false);
  scrollEl.style.height = 'auto';
  stickyEl.style.position = 'relative';
  stickyEl.style.height = '100svh';

  const targets = collectTargets(root);
  applyState(targets, HERO_STATES.s4);
  updateStageScale(viewport);
  root.classList.add('is-cover-mounted');

  return () => {
    scrollEl.style.height = '';
    stickyEl.style.position = '';
    stickyEl.style.height = '';
    root.classList.remove('is-cover-mounted', 'is-cover-active');
    viewport?.style.removeProperty('--hero-stage-scale');
  };
}

export function initCoverAnimation() {
  const root = document.querySelector('[data-vl-cover-root]');
  const scrollEl = document.getElementById('coverScroll');
  const stickyEl = document.getElementById('coverSticky');
  const viewport = document.getElementById('coverViewport');

  if (!root || !scrollEl || !stickyEl || !viewport) return () => {};

  if (prefersReducedMotion()) {
    return initStaticReduced(root, scrollEl, stickyEl, viewport);
  }

  let ctx;
  let mm;
  let resizeObserver;
  let refreshTimer;
  let disposed = false;

  const boot = async () => {
    await waitForHeroImages(root);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    if (disposed) return;

    mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px)',
        mobile: '(max-width: 1023px)',
      },
      (context) => {
        const { desktop } = context.conditions;
        const targets = collectTargets(root);
        const mobile = !desktop;

        setScrollHeight(scrollEl, mobile);
        updateStageScale(viewport);
        applyState(targets, HERO_STATES.s1);

        ctx = gsap.context(() => {
          const tl = buildTimeline(targets);
          const floatAnims = buildCardFloatAnimations(targets.cardFloats);
          const floatStart = HERO_TIMELINE.holdS4[0];
          let cardFloatActive = false;

          ScrollTrigger.create({
            animation: tl,
            trigger: scrollEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: SCRUB,
            pin: stickyEl,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const shouldFloat = self.progress >= floatStart;
              if (shouldFloat === cardFloatActive) return;
              cardFloatActive = shouldFloat;
              setCardFloatActive(floatAnims, targets.cardFloats, shouldFloat);
            },
            onRefresh(self) {
              const shouldFloat = self.progress >= floatStart;
              if (shouldFloat === cardFloatActive) return;
              cardFloatActive = shouldFloat;
              setCardFloatActive(floatAnims, targets.cardFloats, shouldFloat);
            },
          });

          root.classList.add('is-cover-active');
        }, root);

        root.classList.add('is-cover-mounted');
        ScrollTrigger.refresh();

        return () => {
          root.classList.remove('is-cover-active');
        };
      },
    );

    resizeObserver = new ResizeObserver(() => {
      updateStageScale(viewport);
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    resizeObserver.observe(viewport);
  };

  boot();

  return () => {
    disposed = true;
    clearTimeout(refreshTimer);
    resizeObserver?.disconnect();
    mm?.revert();
    ctx?.revert();

    root.classList.remove('is-cover-mounted', 'is-cover-active');
    scrollEl.style.height = '';
    stickyEl.style.position = '';
    stickyEl.style.top = '';
    stickyEl.style.height = '';
    stickyEl.style.minHeight = '';
    viewport?.style.removeProperty('--hero-stage-scale');

    Object.keys(HERO_THEME.blue).forEach((key) => {
      root.style.removeProperty(key);
    });
  };
}
