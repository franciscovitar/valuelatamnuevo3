import { gsap } from '../gsap';
import { MOTION_SYSTEM } from '@/lib/motion/tokens';

export const STORY_EASE = MOTION_SYSTEM.easeInOut;
export const STORY_EASE_OUT = MOTION_SYSTEM.easeOut;
export const STORY_SCRUB = MOTION_SYSTEM.scrub;
export const STORY_INTRO = 0.06;
export const STORY_CROSSFADE = 0.1;

export function storyScrollDistance(
  count,
  { closer = false } = {}
) {
  const perItem = closer ? 25 : 23;
  const padding = closer ? 14 : 12;

  return (
    `+=${padding + count * perItem + (closer ? 14 : 0)}%`
  );
}

export function storySegmentTimes(
  count,
  { intro = STORY_INTRO, body = 1 } = {}
) {
  const segment = body / count;

  return {
    intro,
    body,
    segment,
    total: intro + body,
  };
}

export function storyCrossfade(segment) {
  return Math.min(
    STORY_CROSSFADE,
    segment * 0.56
  );
}

export function storyActiveIndex(progress, count) {
  const { intro, segment } = storySegmentTimes(count);
  const crossfade = storyCrossfade(segment);
  let active = 0;

  for (let index = 1; index < count; index += 1) {
    if (
      progress
      >= intro + index * segment - crossfade * 1.2
    ) {
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
