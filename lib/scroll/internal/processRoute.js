import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from '../home/palette';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
  pushCleanup,
} from '../home/utils';
import {
  STORY_EASE_OUT,
  STORY_INTRO,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storySegmentTimes,
} from '../home/story';
import {
  initCharReveal,
  initLineMaskReveal,
  initProgressiveWrite,
  initTextPaint,
} from '@/lib/motion/textEffects';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import {
  setInternalVisible,
  setVisible,
  triggerStart,
} from './utils';

const PANEL_BASE = { opacity: 0.68, scale: 0.97, y: 0 };
const PANEL_ACTIVE = { opacity: 1, scale: 1, y: 0 };

function panelInner(panel) {
  return {
    num: panel.querySelector('.n'),
    title: panel.querySelector('h4'),
    copy: panel.querySelector('p'),
  };
}

function syncRouteStage(section, track, viewport, panels) {
  const scrollAmount = Math.max(0, (track?.scrollWidth || 0) - (viewport?.offsetWidth || 0));
  const currentX = Math.abs(Number(gsap.getProperty(track, 'x')) || 0);
  const scrollP = scrollAmount > 0 ? gsap.utils.clamp(0, 1, currentX / scrollAmount) : 0;
  const exactIndex = scrollP * Math.max(panels.length - 1, 1);

  panels.forEach((panel, index) => {
    const dist = Math.abs(index - exactIndex);
    const focus = Math.max(0, 1 - dist * 0.72);
    const opacity = gsap.utils.interpolate(PANEL_BASE.opacity, PANEL_ACTIVE.opacity, focus);
    const scale = gsap.utils.interpolate(PANEL_BASE.scale, PANEL_ACTIVE.scale, focus);
    const shadow = focus > 0.55
      ? '0 18px 44px -26px rgba(0, 0, 0, 0.48)'
      : '0 4px 16px -14px rgba(0, 0, 0, 0.18)';

    gsap.set(panel, {
      opacity,
      scale,
      boxShadow: shadow,
    });

    const { num, title, copy } = panelInner(panel);
    if (num) {
      gsap.set(num, {
        y: gsap.utils.interpolate(3, 0, focus),
        textShadow: focus > 0.55
          ? `0 0 18px ${scrollPalette.glowGold}`
          : '0 0 0 transparent',
      });
    }
    if (title) gsap.set(title, { y: gsap.utils.interpolate(4, 0, focus) });
    if (copy) gsap.set(copy, { y: gsap.utils.interpolate(6, 0, focus * 0.85) });
  });

  const activeIndex = Math.min(panels.length - 1, Math.round(exactIndex));
  const current = section.querySelector('.process-route__desktop .process-route-stage__current');
  const segments = gsap.utils.toArray(section.querySelectorAll('.process-route-segments__item'));

  if (current) {
    current.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  segments.forEach((segment, index) => {
    segment.classList.toggle('is-route-active', index === activeIndex);
    segment.classList.toggle('is-route-done', index < activeIndex);
  });

  return activeIndex;
}

function revealPanelContent(panel, ctx, cleanups, revealed) {
  const { title, copy } = panelInner(panel);
  if (title && !revealed.titles.has(title)) {
    revealed.titles.add(title);
    pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: panel, stagger: 0.08 }));
  }
  if (copy && !revealed.copies.has(copy)) {
    revealed.copies.add(copy);
    pushCleanup(
      cleanups,
      initProgressiveWrite(copy, ctx, {
        trigger: panel,
        mode: 'phrases',
        duration: 0.66,
        stagger: 0.09,
      }),
    );
  }
}

function initProcessRouteCloser(closer, ctx, cleanups) {
  if (!closer) return;

  const copy = closer.querySelector('p');
  if (copy) {
    pushCleanup(
      cleanups,
      initTextPaint(copy, ctx, {
        trigger: closer,
        goldPhrases: ['un solo interlocutor', 'toda tu operación'],
      }),
    );
  }

  const btn = closer.querySelector('.btn-primary');
  if (btn) pushCleanup(cleanups, bindGoldSweep(btn));
}

function initProcessRouteMobile(section, ctx, cleanups) {
  const steps = gsap.utils.toArray(section.querySelectorAll('.process-route__mobile .step'));
  const fill = section.querySelector('.process-route-progress-mobile__fill');
  const current = section.querySelector('.process-route-stage--mobile .process-route-stage__current');
  const closer = section.querySelector('.process-route__mobile .closer');

  if (fill) {
    gsap.set(fill, { scaleY: 0, transformOrigin: 'top center' });
  }

  steps.forEach((step, index) => {
    const num = step.querySelector('.n');
    const title = step.querySelector('h4');
    const copy = step.querySelector('p');

    if (num) {
      pushCleanup(cleanups, initCharReveal(num, ctx, { trigger: step, maxChars: 2, duration: 0.62 }));
    }
    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: step, stagger: 0.08 }));
    }
    if (copy) {
      pushCleanup(
        cleanups,
        initProgressiveWrite(copy, ctx, {
          trigger: step,
          mode: 'phrases',
          duration: 0.66,
          stagger: 0.09,
        }),
      );
    }

    ScrollTrigger.create({
      trigger: step,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        step.classList.add('is-route-step-active');
        steps.forEach((other, i) => {
          if (i !== index) other.classList.remove('is-route-step-active');
        });
        if (current) current.textContent = String(index + 1).padStart(2, '0');
        if (fill) {
          gsap.to(fill, {
            scaleY: (index + 1) / steps.length,
            duration: 0.75,
            ease: STORY_EASE_OUT,
            overwrite: 'auto',
          });
        }
      },
    });
  });

  initProcessRouteCloser(closer, ctx, cleanups);
}

function initProcessRouteDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.process-route-pin');
  const stage = pin?.querySelector('.wrap');
  const track = section.querySelector('.process-route-track');
  const viewport = section.querySelector('.process-route-viewport');
  const panels = gsap.utils.toArray(section.querySelectorAll('.process-route-panel'));
  const closer = section.querySelector('.process-route__desktop .closer');

  if (!pin || !track || !viewport || !panels.length) {
    initProcessRouteMobile(section, ctx, cleanups);
    return;
  }

  const getScrollAmount = () => Math.max(0, track.scrollWidth - viewport.offsetWidth);
  const timings = storySegmentTimes(panels.length, { intro: STORY_INTRO, body: 1 });
  const { intro, body } = timings;
  const fitStage = fitPinnedStoryStage(stage, cleanups);
  const revealed = { titles: new Set(), copies: new Set() };

  prepareStoryMotion([...panels, closer].filter(Boolean));

  setVisible([...panels, closer].filter(Boolean));
  if (closer) gsap.set(closer, { opacity: 0.48, y: 14 });
  gsap.set(panels, { ...PANEL_BASE, clearProps: 'filter' });

  const sync = () => syncRouteStage(section, track, viewport, panels);

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: () => `+=${Math.max(getScrollAmount() * 1.18, window.innerHeight * 0.72)}`,
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
    onUpdate: () => {
      const activeIndex = sync();
      const panel = panels[activeIndex];
      if (panel) revealPanelContent(panel, ctx, cleanups, revealed);
    },
  });

  const tl = gsap.timeline({ scrollTrigger: pinConfig });

  tl.to(
    track,
    {
      x: () => -getScrollAmount(),
      ease: 'none',
      duration: body,
      overwrite: 'auto',
      onUpdate: sync,
    },
    intro,
  );

  if (closer) {
    tl.to(
      closer,
      smoothStoryProps({
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: STORY_EASE_OUT,
        boxShadow: `0 0 32px -26px ${scrollPalette.glowGoldSoft}`,
      }),
      intro + body * 0.86,
    );
    initProcessRouteCloser(closer, ctx, cleanups);
  }

  revealPanelContent(panels[0], ctx, cleanups, revealed);
  sync();
  fitStage();
}

export function initProcessRoutePage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="process-route"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  if (ctx.advanced) {
    initProcessRouteDesktop(section, ctx, cleanups);
    return;
  }

  initProcessRouteMobile(section, ctx, cleanups);
}
