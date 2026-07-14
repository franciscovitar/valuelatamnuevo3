import { gsap } from '../gsap';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
  revealOnce,
  setVisible,
} from './utils';
import {
  STORY_EASE,
  STORY_EASE_OUT,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storyCrossfade,
  storyScrollDistance,
  storySegmentTimes,
} from './story';

const CARD_BASE = {
  borderColor: 'rgba(246, 243, 236, 0.11)',
  backgroundColor: 'rgba(255, 255, 255, 0.038)',
  scale: 0.99,
  y: 2,
  boxShadow: '0 14px 36px -24px rgba(0, 0, 0, 0)',
  zIndex: 1,
};

const CARD_ACTIVE = {
  borderColor: 'rgba(210, 183, 117, 0.78)',
  backgroundColor: 'rgba(255, 255, 255, 0.102)',
  scale: 1,
  y: -2,
  boxShadow: '0 24px 52px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(210, 183, 117, 0.2)',
  zIndex: 4,
};

const CARD_INNER_BASE = { opacity: 0.82, y: 2 };
const CARD_INNER_ACTIVE = { opacity: 1, y: 0 };

function cardInner(card) {
  return card.querySelectorAll('.idx, h3, p, .arrow');
}

function initSolutionsMobile(section, ctx) {
  const head = section.querySelectorAll('.sec-head > *');
  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));

  revealOnce(head, ctx, { trigger: section, y: 12, duration: 0.82 });
  revealOnce(cards, ctx, { trigger: section.querySelector('.sol-grid'), y: 16, stagger: 0.1, duration: 0.72 });
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
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([
    ...cards,
    ...head,
    progress,
    ...cards.flatMap((card) => [...cardInner(card)]),
  ].filter(Boolean));

  gsap.set(head, { opacity: 0, y: 10 });
  gsap.set(cards, { ...CARD_BASE, clearProps: 'filter' });
  gsap.set(cards[0], { ...CARD_ACTIVE, y: -2 });
  cards.forEach((card, index) => {
    gsap.set(cardInner(card), index === 0 ? CARD_INNER_ACTIVE : CARD_INNER_BASE);
  });
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

    tl.to(cards[index - 1], smoothStoryProps({ ...CARD_BASE, duration: crossfade }), fadeStart)
      .to(cardInner(cards[index - 1]), smoothStoryProps({ ...CARD_INNER_BASE, duration: crossfade }), fadeStart)
      .to(cards[index], smoothStoryProps({ ...CARD_ACTIVE, duration: crossfade }), fadeStart)
      .to(cardInner(cards[index]), smoothStoryProps({ ...CARD_INNER_ACTIVE, duration: crossfade }), fadeStart);
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
