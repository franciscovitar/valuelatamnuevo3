import { gsap } from '../gsap';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
  revealOnce,
  setVisible,
} from './utils';
import {
  STORY_EASE_OUT,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storyCrossfade,
  storyScrollDistance,
  storySegmentTimes,
} from './story';

const SOLUTION_CARD_ACTIVE = {
  opacity: 1,
  scale: 1,
  y: -2,
  borderColor: 'rgba(210, 183, 117, 0.78)',
  backgroundColor: 'rgba(255, 255, 255, 0.102)',
  boxShadow:
    '0 24px 52px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(210, 183, 117, 0.2)',
  zIndex: 4,
};

const SOLUTION_CARD_PAST = {
  opacity: 0.46,
  scale: 0.97,
  y: 8,
  borderColor: 'rgba(246, 243, 236, 0.07)',
  backgroundColor: 'rgba(255, 255, 255, 0.025)',
  boxShadow: '0 10px 28px -24px rgba(0, 0, 0, 0.12)',
  zIndex: 1,
};

const SOLUTION_CARD_NEXT = {
  opacity: 0.64,
  scale: 0.98,
  y: 6,
  borderColor: 'rgba(246, 243, 236, 0.09)',
  backgroundColor: 'rgba(255, 255, 255, 0.032)',
  boxShadow: '0 12px 30px -24px rgba(0, 0, 0, 0.16)',
  zIndex: 2,
};

const SOLUTION_CARD_FUTURE = {
  opacity: 0.28,
  scale: 0.955,
  y: 12,
  borderColor: 'rgba(246, 243, 236, 0.05)',
  backgroundColor: 'rgba(255, 255, 255, 0.018)',
  boxShadow: '0 8px 22px -24px rgba(0, 0, 0, 0)',
  zIndex: 0,
};

const SOLUTION_CARD_RESOLVED = {
  opacity: 1,
  scale: 1,
  y: 0,
  borderColor: 'rgba(210, 183, 117, 0.52)',
  backgroundColor: 'rgba(255, 255, 255, 0.09)',
  boxShadow: '0 20px 48px -22px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(210, 183, 117, 0.12)',
  zIndex: 2,
};

const SOLUTION_CARD_STATES = {
  active: SOLUTION_CARD_ACTIVE,
  past: SOLUTION_CARD_PAST,
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
  past: {
    index: { opacity: 0.52, y: 4 },
    title: { opacity: 0.4, y: 4 },
    copy: { opacity: 0.16, y: 4 },
    link: { opacity: 0.1, y: 4 },
  },
  next: {
    index: { opacity: 0.7, y: 3 },
    title: { opacity: 0.55, y: 3 },
    copy: { opacity: 0.22, y: 3 },
    link: { opacity: 0.12, y: 3 },
  },
  future: {
    index: { opacity: 0.34, y: 6 },
    title: { opacity: 0.18, y: 6 },
    copy: { opacity: 0.05, y: 6 },
    link: { opacity: 0, y: 6 },
  },
};

function getStoryPosition(index, activeIndex) {
  if (index === activeIndex) return 'active';
  if (index < activeIndex) return 'past';
  if (index === activeIndex + 1) return 'next';
  return 'future';
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

function initSolutionsMobile(section, ctx) {
  const secHead = section.querySelector('.sec-head');
  const head = section.querySelectorAll('.sec-head > .eyebrow');
  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));
  const grid = section.querySelector('.sol-grid');

  revealOnce(head, ctx, { trigger: secHead || section, y: 17, duration: 0.96, delay: 0.04 });
  revealOnce(cards, ctx, {
    trigger: grid || section,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });
}

function initSolutionsDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.solutions-pin');
  const stage = section.querySelector('.solutions-pin .wrap');
  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));
  const progress = section.querySelector('.sol-story-progress__fill');
  const head = section.querySelectorAll('.sec-head > *');

  if (!pin || !stage || cards.length === 0) {
    initSolutionsMobile(section, ctx);
    return;
  }

  const { intro, body, segment } = storySegmentTimes(cards.length);
  const crossfade = storyCrossfade(segment);
  const resolveDuration = Math.min(crossfade * 1.4, segment * 0.85);
  const resolveStart = intro + body - resolveDuration;
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([
    ...cards,
    ...head,
    progress,
    ...cards.flatMap((card) => Object.values(solutionParts(card)).filter(Boolean)),
  ].filter(Boolean));

  gsap.set(head, { opacity: 0, y: 10 });
  setSolutionFocus(cards, 0);
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: storyScrollDistance(cards.length),
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
  });

  const tl = gsap.timeline({ scrollTrigger: pinConfig });

  tl.to(head, smoothStoryProps({ opacity: 1, y: 0, duration: intro, ease: STORY_EASE_OUT }), 0);

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

  initSolutionsMobile(section, ctx);
}
