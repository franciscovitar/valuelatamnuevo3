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

const STEP_BASE = { opacity: 0.62, y: 3, scale: 0.994 };
const STEP_ACTIVE = { opacity: 1, y: 0, scale: 1 };

const STEP_INNER_BASE = { opacity: 0.78, y: 3 };
const STEP_INNER_ACTIVE = { opacity: 1, y: 0 };

function stepInner(step) {
  return step.querySelectorAll('.n, h4, p');
}

function initProcessMobile(section, ctx) {
  const head = section.querySelectorAll('.sec-head > .eyebrow');
  const steps = gsap.utils.toArray(section.querySelectorAll('.step'));
  const closer = section.querySelector('.closer');

  revealOnce(head, ctx, { trigger: section, y: 12, duration: 0.82 });
  revealOnce(steps, ctx, { trigger: section.querySelector('.steps'), y: 14, stagger: 0.11, duration: 0.72 });
  if (closer) revealOnce(closer, ctx, { trigger: closer, y: 10, duration: 0.74 });
}

function initProcessDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.process-pin');
  const stage = section.querySelector('.process-pin .wrap');
  const steps = gsap.utils.toArray(section.querySelectorAll('.step'));
  const closer = section.querySelector('.closer');
  const progress = section.querySelector('.process-story-progress__fill');
  const head = section.querySelectorAll('.sec-head > *');
  const connectors = gsap.utils.toArray(section.querySelectorAll('.step-connector'));

  if (!pin || !stage || !steps.length) {
    initProcessMobile(section, ctx);
    return;
  }

  const { intro, body, segment, total } = storySegmentTimes(steps.length);
  const crossfade = storyCrossfade(segment);
  const closerStart = intro + body + 0.04;
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([
    ...steps,
    ...head,
    progress,
    closer,
    ...connectors,
    ...steps.flatMap((step) => [...stepInner(step)]),
  ].filter(Boolean));

  gsap.set(head, { opacity: 0, y: 10 });
  gsap.set(steps, STEP_BASE);
  gsap.set(steps[0], STEP_ACTIVE);
  steps.forEach((step, index) => {
    gsap.set(stepInner(step), index === 0 ? STEP_INNER_ACTIVE : STEP_INNER_BASE);
  });
  gsap.set(connectors, { opacity: 0, scaleX: 0, scaleY: 0 });
  section.querySelectorAll('.step-connector--horizontal').forEach((el) => {
    gsap.set(el, { transformOrigin: 'left center' });
  });
  section.querySelectorAll('.step-connector--vertical').forEach((el) => {
    gsap.set(el, { transformOrigin: 'top center' });
  });
  if (closer) gsap.set(closer, { opacity: 0, y: 8, clearProps: 'boxShadow' });
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: storyScrollDistance(steps.length, { closer: Boolean(closer) }),
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
  });

  const tl = gsap.timeline({ scrollTrigger: pinConfig });

  tl.to(head, smoothStoryProps({ opacity: 1, y: 0, duration: intro, ease: STORY_EASE_OUT }), 0);

  if (progress) {
    tl.to(progress, { scaleX: 1, ease: 'none', duration: body, overwrite: 'auto' }, intro);
  }

  for (let index = 1; index < steps.length; index += 1) {
    const at = intro + index * segment;
    const fadeStart = at - crossfade;
    const connector = steps[index].querySelector('.step-connector--vertical')
      || steps[index].querySelector('.step-connector--horizontal');

    tl.to(steps[index - 1], smoothStoryProps({ ...STEP_BASE, duration: crossfade }), fadeStart)
      .to(stepInner(steps[index - 1]), smoothStoryProps({ ...STEP_INNER_BASE, duration: crossfade }), fadeStart)
      .to(steps[index], smoothStoryProps({ ...STEP_ACTIVE, duration: crossfade }), fadeStart)
      .to(stepInner(steps[index]), smoothStoryProps({ ...STEP_INNER_ACTIVE, duration: crossfade }), fadeStart);

    if (connector) {
      tl.fromTo(connector, {
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
      }, smoothStoryProps({
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        duration: crossfade,
        ease: STORY_EASE,
      }), fadeStart + crossfade * 0.12);
    }
  }

  if (closer) {
    tl.to(closer, smoothStoryProps({
      opacity: 1,
      y: 0,
      duration: 0.28,
      ease: STORY_EASE,
    }), closerStart);
  }

  tl.to({}, { duration: closerStart + 0.28 - total }, total);

  fitStage();
}

export function initProcessSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="process"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  if (ctx.advanced) {
    initProcessDesktop(section, ctx, cleanups);
    return;
  }

  initProcessMobile(section, ctx);
}
