import { gsap } from '../gsap';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
} from '../home/utils';
import {
  STORY_EASE_OUT,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storySegmentTimes,
} from '../home/story';
import {
  initInternalHeader,
  revealOnScroll,
  setInternalVisible,
  setVisible,
} from './utils';

function initProcessRouteMobile(section, ctx) {
  initInternalHeader(section, ctx);
  revealOnScroll(section.querySelectorAll('.process-route__mobile .step'), ctx, {
    trigger: section.querySelector('.process-route__mobile .steps'),
    stagger: 0.1,
    y: 12,
  });
  revealOnScroll(section.querySelector('.process-route__mobile .closer'), ctx, { y: 10 });
}

function initProcessRouteDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.process-route-pin');
  const stage = pin?.querySelector('.wrap');
  const track = section.querySelector('.process-route-track');
  const viewport = section.querySelector('.process-route-viewport');
  const panels = gsap.utils.toArray(section.querySelectorAll('.process-route-panel'));
  const progress = section.querySelector('.process-route-progress__fill');
  const head = section.querySelectorAll('.process-route__desktop .sec-head > *');
  const closer = section.querySelector('.process-route__desktop .closer');

  if (!pin || !track || !viewport || !panels.length) {
    initProcessRouteMobile(section, ctx);
    return;
  }

  const getScrollAmount = () => Math.max(0, track.scrollWidth - viewport.offsetWidth);
  const { intro, body } = storySegmentTimes(1, { intro: 0.1, body: 1 });
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([...panels, ...head, progress, closer].filter(Boolean));

  setVisible([...head, ...panels, closer].filter(Boolean));
  if (closer) gsap.set(closer, { opacity: 1, y: 10 });
  gsap.set(head, { opacity: 1, y: 10 });
  gsap.set(panels, { opacity: 1, scale: 1, y: 0, clearProps: 'filter' });
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: () => `+=${Math.max(getScrollAmount() * 1.06, window.innerHeight * 0.55)}`,
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
  });

  const tl = gsap.timeline({ scrollTrigger: pinConfig });

  tl.to(head, smoothStoryProps({ opacity: 1, y: 0, duration: intro, ease: STORY_EASE_OUT }), 0);

  if (progress) {
    tl.to(progress, { scaleX: 1, ease: 'none', duration: body, overwrite: 'auto' }, intro);
  }

  tl.to(
    track,
    {
      x: () => -getScrollAmount(),
      ease: 'none',
      duration: body,
      overwrite: 'auto',
    },
    intro,
  );

  if (closer) {
    tl.to(
      closer,
      smoothStoryProps({ opacity: 1, y: 0, duration: 0.22, ease: STORY_EASE_OUT }),
      intro + body * 0.82,
    );
  }

  fitStage();
}

export function initProcessRoutePage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="process-route"]');
  if (!section) return;

  setInternalVisible(section);

  if (ctx.reduced) {
    return;
  }

  if (ctx.advanced) {
    initProcessRouteDesktop(section, ctx, cleanups);
    return;
  }

  initProcessRouteMobile(section, ctx);
}
