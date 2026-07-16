import { gsap } from '../gsap';

export const STORY_EASE = 'sine.inOut';
export const STORY_EASE_OUT = 'power1.out';
export const STORY_SCRUB = 0.95;
export const STORY_INTRO = 0.12;
export const STORY_CROSSFADE = 0.14;

export function storyScrollDistance(count, { closer = false } = {}) {
  const perItem = closer ? 40 : 38;
  const padding = closer ? 26 : 24;
  return `+=${padding + count * perItem + (closer ? 24 : 0)}%`;
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
    if (progress >= intro + index * segment - crossfade) {
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
