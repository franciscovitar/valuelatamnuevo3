import { gsap } from '@/lib/scroll/gsap';
import { ScrollTrigger } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import {
  HERO_CARD_DEPTH,
  HERO_COPY_STATES,
  HERO_DESIGN,
  HERO_HANDOFF,
  HERO_LANDING_STATE,
  HERO_SCROLL_DESKTOP_VH,
  HERO_SCROLL_MOBILE_VH,
  HERO_STATES,
  HERO_THEME,
  HERO_TIMELINE,
} from './heroKeyframes';

const SCRUB = 1.18;
const EASE_MOVE = 'power1.inOut';
const EASE_SOFT = 'sine.inOut';
const EASE_REVEAL = 'power2.inOut';
const CARD_STAGGER = 0.052;
const LINE_STAGGER = 0.036;
const COPY_PART_STAGGER = 0.028;

function applyThemeVars(root, themeKey) {
  const vars = HERO_THEME[themeKey];
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function collectTargets(root) {
  const content = root.querySelector('#coverContent');

  return {
    root,
    content,
    copyParts: {
      eyebrow: content?.querySelector('.cover-hero__eyebrow'),
      titleLines: gsap.utils.toArray(content?.querySelectorAll('.cover-hero__title-line') ?? []),
      leadLine: content?.querySelector('.cover-hero__lead-line'),
      leadCloser: content?.querySelector('.cover-hero__lead-closer'),
    },
    cards: gsap.utils.toArray(root.querySelectorAll('[data-cover-card]')),
    lines: gsap.utils.toArray(root.querySelectorAll('[data-cover-line]')),
    radial: root.querySelector('#coverRadial'),
    smoke: root.querySelector('#coverSmoke'),
    stage: root.querySelector('.cover-hero__design-stage'),
  };
}

function applyCopyParts(copyParts, copyState) {
  if (!copyState) return;

  const { eyebrow, titleLines, leadLine, leadCloser } = copyParts;

  if (eyebrow) {
    gsap.set(eyebrow, {
      y: copyState.eyebrow.y,
      opacity: copyState.eyebrow.opacity,
      force3D: true,
    });
  }

  copyState.titleLines.forEach((lineState, index) => {
    if (!titleLines[index]) return;
    gsap.set(titleLines[index], {
      y: lineState.y,
      opacity: lineState.opacity,
      force3D: true,
    });
  });

  if (leadLine) {
    gsap.set(leadLine, {
      y: copyState.leadLine.y,
      opacity: copyState.leadLine.opacity,
      force3D: true,
    });
  }

  if (leadCloser) {
    gsap.set(leadCloser, {
      y: copyState.leadCloser.y,
      opacity: copyState.leadCloser.opacity,
      force3D: true,
    });
  }
}

function applyState(targets, state, copyState = HERO_COPY_STATES.landing) {
  const { root, content, cards, lines, radial, smoke, stage, copyParts } = targets;

  gsap.set(content, {
    x: state.content.x,
    y: state.content.y ?? 0,
    opacity: state.content.opacity,
    force3D: true,
  });

  applyCopyParts(copyParts, copyState);

  state.cards.forEach((cardState, index) => {
    gsap.set(cards[index], {
      x: cardState.x,
      y: cardState.y,
      opacity: cardState.opacity,
      scale: cardState.scale ?? 1,
      rotation: cardState.rotate ?? 0,
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

  if (state.camera != null && stage) {
    stage.style.setProperty('--hero-camera-scale', String(state.camera));
  }

  applyThemeVars(root, state.theme === 1 ? 'gold' : 'blue');
}

function segmentDuration(total, offset) {
  return Math.max(total - offset, total * 0.68);
}

function addCopyPartMotion(tl, copyParts, fromState, toState, start, duration) {
  const { eyebrow, titleLines, leadLine, leadCloser } = copyParts;
  let cursor = start;

  if (eyebrow) {
    tl.fromTo(
      eyebrow,
      { y: fromState.eyebrow.y, opacity: fromState.eyebrow.opacity },
      { y: toState.eyebrow.y, opacity: toState.eyebrow.opacity, duration, ease: EASE_REVEAL },
      cursor,
    );
    cursor += COPY_PART_STAGGER;
  }

  titleLines.forEach((line, index) => {
    const from = fromState.titleLines[index];
    const to = toState.titleLines[index];
    if (!from || !to) return;

    tl.fromTo(
      line,
      { y: from.y, opacity: from.opacity },
      { y: to.y, opacity: to.opacity, duration, ease: EASE_REVEAL },
      cursor + index * COPY_PART_STAGGER,
    );
  });

  cursor += COPY_PART_STAGGER * 2.2;

  if (leadLine) {
    tl.fromTo(
      leadLine,
      { y: fromState.leadLine.y, opacity: fromState.leadLine.opacity },
      { y: toState.leadLine.y, opacity: toState.leadLine.opacity, duration, ease: EASE_REVEAL },
      cursor,
    );
    cursor += COPY_PART_STAGGER;
  }

  if (leadCloser) {
    tl.fromTo(
      leadCloser,
      { y: fromState.leadCloser.y, opacity: fromState.leadCloser.opacity },
      { y: toState.leadCloser.y, opacity: toState.leadCloser.opacity, duration, ease: EASE_REVEAL },
      cursor + COPY_PART_STAGGER * 0.6,
    );
  }
}

function buildTimeline(targets) {
  const { root, content, cards, lines, radial, smoke, stage, copyParts } = targets;
  const landing = HERO_LANDING_STATE;
  const s2 = HERO_STATES.s2;
  const s3 = HERO_STATES.s3;
  const s4 = HERO_STATES.s4;
  const handoff = HERO_HANDOFF;

  const [tHoldLandingStart, tHoldLandingEnd] = HERO_TIMELINE.holdLanding;
  const [tL2Start, tL2End] = HERO_TIMELINE.landingToS2;
  const [tHoldS2Start, tHoldS2End] = HERO_TIMELINE.holdS2;
  const [t23Start, t23End] = HERO_TIMELINE.s2ToS3;
  const [t34Start, t34End] = HERO_TIMELINE.s3ToS4;
  const [tHoldS4Start, tHoldS4End] = HERO_TIMELINE.holdS4;
  const [tHandoffStart, tHandoffEnd] = HERO_TIMELINE.handoff;

  const durHoldLanding = tHoldLandingEnd - tHoldLandingStart;
  const durL2 = tL2End - tL2Start;
  const durHoldS2 = tHoldS2End - tHoldS2Start;
  const dur23 = t23End - t23Start;
  const dur34 = t34End - t34Start;
  const durHoldS4 = tHoldS4End - tHoldS4Start;
  const durHandoff = tHandoffEnd - tHandoffStart;

  const tl = gsap.timeline({ defaults: { ease: EASE_MOVE } });

  tl.to({}, { duration: durHoldLanding }, tHoldLandingStart);

  addCopyPartMotion(
    tl,
    copyParts,
    HERO_COPY_STATES.landing,
    HERO_COPY_STATES.built,
    tL2Start,
    durL2 * 0.88,
  );

  cards.forEach((card, index) => {
    const depth = HERO_CARD_DEPTH[index] ?? 1;
    const cardStart = tL2Start + index * CARD_STAGGER;
    const cardDur = segmentDuration(durL2, index * CARD_STAGGER * depth);

    tl.fromTo(
      card,
      {
        x: landing.cards[index].x,
        y: landing.cards[index].y,
        opacity: landing.cards[index].opacity,
        scale: landing.cards[index].scale ?? 1,
        rotation: landing.cards[index].rotate ?? 0,
      },
      {
        x: s2.cards[index].x,
        y: s2.cards[index].y,
        opacity: s2.cards[index].opacity,
        scale: s2.cards[index].scale ?? 1,
        rotation: s2.cards[index].rotate ?? 0,
        duration: cardDur,
        ease: EASE_REVEAL,
      },
      cardStart,
    );

    tl.to(card, { y: s3.cards[index].y, duration: dur23 * depth, ease: EASE_SOFT }, t23Start);
    tl.to(
      card,
      {
        y: s4.cards[index].y,
        scale: s4.cards[index].scale ?? 1,
        rotation: s4.cards[index].rotate ?? 0,
        duration: dur34 * depth,
        ease: EASE_SOFT,
      },
      t34Start,
    );
  });

  lines.forEach((line, index) => {
    const lineStart = tL2Start + index * LINE_STAGGER;
    const lineDur = segmentDuration(durL2, index * LINE_STAGGER);

    tl.fromTo(
      line,
      {
        x: landing.lines.x[index],
        opacity: landing.lines.opacity,
      },
      {
        x: s2.lines.x[index],
        opacity: s2.lines.opacity,
        duration: lineDur,
        ease: EASE_REVEAL,
      },
      lineStart,
    );
  });

  tl.fromTo(
    radial,
    { opacity: landing.radial.opacity },
    { opacity: s2.radial.opacity, duration: durL2 * 0.92, ease: EASE_REVEAL },
    tL2Start + 0.01,
  );

  tl.fromTo(
    smoke,
    { y: landing.smoke.y, opacity: landing.smoke.opacity },
    { y: s2.smoke.y, opacity: s2.smoke.opacity, duration: durL2, ease: EASE_MOVE },
    tL2Start,
  );

  tl.to({}, { duration: durHoldS2 }, tHoldS2Start);

  tl.to(content, { x: s3.content.x, duration: dur23, ease: EASE_SOFT }, t23Start);
  tl.to(smoke, { y: s3.smoke.y, duration: dur23, ease: EASE_SOFT }, t23Start);

  tl.fromTo(
    root,
    { ...HERO_THEME.blue },
    { ...HERO_THEME.gold, duration: dur23, ease: EASE_SOFT },
    t23Start,
  );

  tl.fromTo(
    radial,
    { opacity: s2.radial.opacity },
    { opacity: 1.08, duration: dur23 * 0.42, ease: 'power2.out' },
    t23Start,
  );

  tl.to(radial, { opacity: s3.radial.opacity, duration: dur23 * 0.58, ease: EASE_SOFT }, t23Start + dur23 * 0.42);

  tl.to({}, { duration: durHoldS4 }, tHoldS4Start);

  tl.to(
    content,
    {
      x: handoff.content.x,
      y: handoff.content.y,
      opacity: handoff.content.opacity,
      duration: durHandoff,
      ease: EASE_SOFT,
    },
    tHandoffStart,
  );

  addCopyPartMotion(
    tl,
    copyParts,
    HERO_COPY_STATES.built,
    HERO_COPY_STATES.handoff,
    tHandoffStart,
    durHandoff * 0.9,
  );

  cards.forEach((card, index) => {
    const depth = HERO_CARD_DEPTH[index] ?? 1;
    tl.to(
      card,
      {
        x: handoff.cards[index].x,
        y: handoff.cards[index].y,
        opacity: handoff.cards[index].opacity,
        scale: handoff.cards[index].scale ?? 1,
        rotation: handoff.cards[index].rotate ?? 0,
        duration: durHandoff * depth,
        ease: EASE_SOFT,
      },
      tHandoffStart,
    );
  });

  tl.to(radial, { opacity: handoff.radial.opacity, duration: durHandoff, ease: EASE_SOFT }, tHandoffStart);
  tl.to(
    smoke,
    { y: handoff.smoke.y, opacity: handoff.smoke.opacity, duration: durHandoff, ease: EASE_SOFT },
    tHandoffStart,
  );

  if (stage) {
    tl.fromTo(
      stage,
      { '--hero-camera-scale': 1 },
      { '--hero-camera-scale': handoff.camera, duration: durHandoff, ease: EASE_SOFT },
      tHandoffStart,
    );
  }

  return tl;
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
  applyState(targets, HERO_STATES.s4, HERO_COPY_STATES.built);
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
        targets.stage?.style.setProperty('--hero-camera-scale', '1');
        applyState(targets, HERO_LANDING_STATE, HERO_COPY_STATES.landing);

        ctx = gsap.context(() => {
          const tl = buildTimeline(targets);

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
    root.querySelector('.cover-hero__design-stage')?.style.removeProperty('--hero-camera-scale');

    Object.keys(HERO_THEME.blue).forEach((key) => {
      root.style.removeProperty(key);
    });
  };
}
