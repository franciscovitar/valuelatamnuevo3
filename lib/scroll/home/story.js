import { gsap } from '../gsap';

export const STORY_EASE = 'sine.inOut';
export const STORY_EASE_OUT = 'power1.out';
export const STORY_SCRUB = 0.95;
export const STORY_INTRO = 0.07;
export const STORY_CROSSFADE = 0.12;

export function storyScrollDistance(count, { closer = false } = {}) {
  const perItem = closer ? 30 : 28;
  const padding = closer ? 18 : 16;
  return `+=${padding + count * perItem + (closer ? 18 : 0)}%`;
}

export function storySegmentTimes(count, { intro = STORY_INTRO, body = 1 } = {}) {
  const segment = body / count;
  return { intro, body, segment, total: intro + body };
}

export function storyCrossfade(segment) {
  return Math.min(STORY_CROSSFADE, segment * 0.58);
}

/** Índice protagonista según progreso normalizado de la timeline (0–1). */
export function storyActiveIndex(progress, count) {
  const { intro, segment } = storySegmentTimes(count);
  const crossfade = storyCrossfade(segment);
  let active = 0;

  for (let index = 1; index < count; index += 1) {
    if (progress >= intro + index * segment - crossfade * 1.28) {
      active = index;
    }
  }

  return active;
}

export function prepareStoryMotion(targets) {
  const items = gsap.utils.toArray(targets);
  if (!items.length) return;
  gsap.set(items, { force3D: true });
}

export function smoothStoryProps(props) {
  return {
    ...props,
    ease: STORY_EASE,
    overwrite: 'auto',
  };
}
