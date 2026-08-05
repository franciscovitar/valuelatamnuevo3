import { gsap } from '../gsap';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
  pushCleanup,
  revealOnce,
  setVisible,
  triggerStart,
} from './utils';
import { initTextPaint, initFadeReveal, initLineMaskReveal, initProgressiveWrite } from '@/lib/motion/textEffects';
import {
  STORY_EASE_OUT,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storyActiveIndex,
  storyCrossfade,
  storyScrollDistance,
  storySegmentTimes,
} from './story';

const SOLUTION_CARD_ACTIVE = {
  opacity: 1,
  scale: 1,
  y: -1,
  borderColor: 'rgba(201, 168, 95, 0.18)',
  backgroundColor: '#16243a',
  boxShadow:
    '0 22px 48px -28px rgba(0, 0, 0, 0.64), 0 0 0 1px rgba(208, 179, 105, 0.12)',
  zIndex: 4,
};

const SOLUTION_CARD_PAST = {
  opacity: 1,
  scale: 0.99,
  y: 3,
  borderColor: 'rgba(169, 182, 193, 0.10)',
  backgroundColor: '#111c31',
  boxShadow: '0 12px 30px -26px rgba(0, 0, 0, 0.34)',
  zIndex: 1,
};

const SOLUTION_CARD_NEXT = {
  opacity: 1,
  scale: 0.992,
  y: 2,
  borderColor: 'rgba(169, 182, 193, 0.12)',
  backgroundColor: '#0d1527',
  boxShadow: '0 12px 30px -26px rgba(0, 0, 0, 0.32)',
  zIndex: 2,
};

const SOLUTION_CARD_FUTURE = {
  opacity: 1,
  scale: 0.982,
  y: 4,
  borderColor: 'rgba(169, 182, 193, 0.08)',
  backgroundColor: '#0a1020',
  boxShadow: '0 10px 24px -24px rgba(0, 0, 0, 0.24)',
  zIndex: 0,
};

const SOLUTION_CARD_RESOLVED = {
  opacity: 1,
  scale: 1,
  y: 0,
  borderColor: 'rgba(201, 168, 95, 0.14)',
  backgroundColor: '#121d33',
  boxShadow: '0 18px 42px -28px rgba(0, 0, 0, 0.52), 0 0 0 1px rgba(208, 179, 105, 0.07)',
  zIndex: 2,
};

const SOLUTION_CARD_STATES = {
  active: SOLUTION_CARD_ACTIVE,
  resolved: SOLUTION_CARD_RESOLVED,
  past: SOLUTION_CARD_RESOLVED,
  next: SOLUTION_CARD_NEXT,
  future: SOLUTION_CARD_FUTURE,
};

const SOLUTION_INNER_STATES = {
  active: {
    index: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
    link: { opacity: 1, y: 0 },
  },
  resolved: {
    index: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
    link: { opacity: 1, y: 0 },
  },
  past: {
    index: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
    link: { opacity: 1, y: 0 },
  },
  next: {
    index: { opacity: 0.88, y: 1 },
    title: { opacity: 0.82, y: 1 },
    copy: { opacity: 0.58, y: 1 },
    link: { opacity: 0.48, y: 1 },
  },
  future: {
    index: { opacity: 0.70, y: 2 },
    title: { opacity: 0.60, y: 2 },
    copy: { opacity: 0.38, y: 2 },
    link: { opacity: 0.30, y: 2 },
  },
};

function getStoryPosition(index, activeIndex) {
  if (index < activeIndex) return 'resolved';
  if (index === activeIndex) return 'active';
  if (index === activeIndex + 1) return 'next';
  return 'future';
}

function persistSeenSolutionCards(cards, maxSeenIndex, activeIndex) {
  const innerResolved = SOLUTION_INNER_STATES.resolved;

  cards.forEach((card, cardIndex) => {
    if (cardIndex > maxSeenIndex || cardIndex === activeIndex) return;

    gsap.set(card, SOLUTION_CARD_RESOLVED);
    const parts = solutionParts(card);
    if (parts.index) gsap.set(parts.index, innerResolved.index);
    if (parts.title) gsap.set(parts.title, innerResolved.title);
    if (parts.copy) gsap.set(parts.copy, innerResolved.copy);
    if (parts.link) gsap.set(parts.link, innerResolved.link);
  });
}

function solutionParts(card) {
  return {
    index: card.querySelector('.idx'),
    title: card.querySelector('h3'),
    copy: card.querySelector('p'),
    link: card.querySelector('.arrow'),
  };
}

function setSolutionFocus(cards, activeIndex) {
  cards.forEach((card, cardIndex) => {
    const stateName = getStoryPosition(cardIndex, activeIndex);
    const cardState = SOLUTION_CARD_STATES[stateName];
    const innerState = SOLUTION_INNER_STATES[stateName];
    const parts = solutionParts(card);

    gsap.set(card, { ...cardState, clearProps: 'filter' });
    if (parts.index) gsap.set(parts.index, innerState.index);
    if (parts.title) gsap.set(parts.title, innerState.title);
    if (parts.copy) gsap.set(parts.copy, innerState.copy);
    if (parts.link) gsap.set(parts.link, innerState.link);
  });
}

function applySolutionFocus(tl, cards, activeIndex, position, duration) {
  cards.forEach((card, cardIndex) => {
    const stateName = getStoryPosition(cardIndex, activeIndex);
    const cardState = SOLUTION_CARD_STATES[stateName];
    const innerState = SOLUTION_INNER_STATES[stateName];
    const parts = solutionParts(card);

    tl.to(card, smoothStoryProps({ ...cardState, duration }), position);

    if (parts.index) {
      tl.to(parts.index, smoothStoryProps({ ...innerState.index, duration }), position);
    }
    if (parts.title) {
      tl.to(parts.title, smoothStoryProps({ ...innerState.title, duration }), position);
    }
    if (parts.copy) {
      tl.to(parts.copy, smoothStoryProps({ ...innerState.copy, duration }), position);
    }
    if (parts.link) {
      tl.to(parts.link, smoothStoryProps({ ...innerState.link, duration }), position);
    }
  });
}

function applySolutionFocusResolved(tl, cards, position, duration) {
  const innerActive = SOLUTION_INNER_STATES.active;

  cards.forEach((card) => {
    const parts = solutionParts(card);

    tl.to(card, smoothStoryProps({ ...SOLUTION_CARD_RESOLVED, duration }), position);

    if (parts.index) {
      tl.to(parts.index, smoothStoryProps({ ...innerActive.index, duration }), position);
    }
    if (parts.title) {
      tl.to(parts.title, smoothStoryProps({ ...innerActive.title, duration }), position);
    }
    if (parts.copy) {
      tl.to(parts.copy, smoothStoryProps({ ...innerActive.copy, duration }), position);
    }
    if (parts.link) {
      tl.to(parts.link, smoothStoryProps({ ...innerActive.link, duration }), position);
    }
  });
}

function initSolutionsMobile(section, ctx, cleanups) {
  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));
  const grid = section.querySelector('.sol-grid');

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: secHead || section, y: 8 }));
  pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: secHead || section }));

  cards.forEach((card) => {
    const cardTitle = card.querySelector('h3');
    const cardCopy = card.querySelector('p');
    pushCleanup(cleanups, initLineMaskReveal(cardTitle, ctx, { trigger: card }));
    if (cardCopy) {
      pushCleanup(cleanups, initProgressiveWrite(cardCopy, ctx, { trigger: card, mode: 'phrases' }));
    }
  });

  gsap.from(cards, {
    opacity: 0,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: grid || section,
      start: triggerStart(ctx),
      once: true,
    },
  });
}

function initSolutionsDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.solutions-pin');
  const stage = section.querySelector('.solutions-pin .wrap');
  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));
  const progress = section.querySelector('.sol-story-progress__fill');
  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');

  if (!pin || !stage || cards.length === 0) {
    initSolutionsMobile(section, ctx, cleanups);
    return;
  }

  const { intro, body, segment } = storySegmentTimes(cards.length);
  const crossfade = storyCrossfade(segment);
  const resolveDuration = Math.min(crossfade * 1.4, segment * 0.85);
  const resolveStart = intro + body - resolveDuration;
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([
    ...cards,
    eyebrow,
    progress,
    ...cards.flatMap((card) => Object.values(solutionParts(card)).filter(Boolean)),
  ].filter(Boolean));

  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 8 });
  setSolutionFocus(cards, 0);
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  pushCleanup(
    cleanups,
    initTextPaint(title, ctx, {
      trigger: secHead || section,
      goldPhrases: ['Un solo socio'],
    }),
  );

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: storyScrollDistance(cards.length),
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
  });

  let maxSeenIndex = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      ...pinConfig,
      onUpdate(self) {
        const activeIndex = storyActiveIndex(self.progress, cards.length);
        maxSeenIndex = Math.max(maxSeenIndex, activeIndex);
        persistSeenSolutionCards(cards, maxSeenIndex, activeIndex);
      },
    },
  });

  if (eyebrow) {
    tl.to(eyebrow, smoothStoryProps({ opacity: 1, y: 0, duration: intro, ease: STORY_EASE_OUT }), 0);
  }

  if (progress) {
    tl.to(progress, { scaleX: 1, ease: 'none', duration: body, overwrite: 'auto' }, intro);
  }

  for (let index = 1; index < cards.length; index += 1) {
    const at = intro + index * segment;
    const fadeStart = at - crossfade;
    applySolutionFocus(tl, cards, index, fadeStart, crossfade);
  }

  if (cards.length > 1) {
    applySolutionFocusResolved(tl, cards, resolveStart, resolveDuration);
  }

  fitStage();
}

export function initSolutionsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="solutions"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  if (ctx.advanced) {
    initSolutionsDesktop(section, ctx, cleanups);
    return;
  }

  initSolutionsMobile(section, ctx, cleanups);
}
