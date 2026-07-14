import { gsap } from '../gsap';

export const STORY_EASE = 'sine.inOut';
export const STORY_EASE_OUT = 'power2.out';
export const STORY_SCRUB = 1.05;
export const STORY_INTRO = 0.08;
export const STORY_CROSSFADE = 0.24;

export function storyScrollDistance(count, { closer = false } = {}) {
  const perItem = closer ? 26 : 22;
  const padding = closer ? 16 : 12;
  return `+=${padding + count * perItem + (closer ? 18 : 0)}%`;
}

export function storySegmentTimes(count, { intro = STORY_INTRO, body = 1 } = {}) {
  const segment = body / count;
  return { intro, body, segment, total: intro + body };
}

export function storyCrossfade(segment) {
  return Math.max(STORY_CROSSFADE, segment * 0.46);
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
