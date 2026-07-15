import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from '../home/palette';
import { STORY_EASE_OUT } from '../home/story';
import { initTextReveal } from '@/lib/motion/textReveal';
import {
  bindCardTilt,
  initInternalHeader,
  initInternalHeroCopy,
  pushCleanup,
  runCountUp,
  setInternalVisible,
  setVisible,
  textRevealStart,
  triggerStart,
} from './utils';

const STEP_BASE = { opacity: 0.74 };
const STEP_ACTIVE = { opacity: 1 };
const GAIN_BASE = { opacity: 0.72 };
const GAIN_ACTIVE = { opacity: 1 };

function gainIndexForStep(stepIndex, stepCount, gainCount) {
  return Math.min(
    Math.floor((stepIndex / Math.max(stepCount - 1, 1)) * (gainCount - 1)),
    gainCount - 1,
  );
}

function bindCounters(gains, ctx, counted) {
  gains.forEach((gain) => {
    const counter = gain.querySelector('.cv');
    if (!counter || counted.has(counter)) return;
    counted.add(counter);
    runCountUp(
      counter,
      counter.getAttribute('data-count'),
      ctx,
      { decimals: Number.parseInt(counter.getAttribute('data-dec') || '0', 10) },
    );
  });
}

function setActivePair(steps, gains, stepIndex, ctx, counted) {
  const gainIndex = gainIndexForStep(stepIndex, steps.length, gains.length);

  steps.forEach((step, i) => {
    gsap.to(step, {
      ...(i === stepIndex ? STEP_ACTIVE : STEP_BASE),
      duration: 0.55,
      ease: STORY_EASE_OUT,
      overwrite: 'auto',
    });
  });

  gains.forEach((gain, i) => {
    gsap.to(gain, {
      ...(i === gainIndex ? GAIN_ACTIVE : GAIN_BASE),
      duration: 0.55,
      ease: STORY_EASE_OUT,
      overwrite: 'auto',
    });
  });

  if (gains[gainIndex]) bindCounters([gains[gainIndex]], ctx, counted);
}

function initAIStory(section, ctx, cleanups) {
  const steps = gsap.utils.toArray(section.querySelectorAll('.ai-steps li'));
  const gains = gsap.utils.toArray(section.querySelectorAll('.gain'));
  const railFill = section.querySelector('.ai-story-rail__fill');
  const counted = new Set();

  if (!steps.length) return;

  gsap.set(steps, STEP_BASE);
  gsap.set(steps[0], STEP_ACTIVE);
  gsap.set(gains, GAIN_BASE);
  if (gains[0]) gsap.set(gains[0], GAIN_ACTIVE);
  if (railFill) gsap.set(railFill, { scaleY: 0, transformOrigin: 'top center' });

  bindCounters(gains.slice(0, 1), ctx, counted);

  steps.forEach((step, index) => {
    ScrollTrigger.create({
      trigger: step,
      start: ctx.mobile ? 'top 76%' : 'top 70%',
      end: ctx.mobile ? 'bottom 24%' : 'bottom 30%',
      onEnter: () => {
        setActivePair(steps, gains, index, ctx, counted);
        if (railFill) {
          gsap.to(railFill, {
            scaleY: (index + 1) / steps.length,
            duration: 0.5,
            ease: STORY_EASE_OUT,
            overwrite: 'auto',
          });
        }
      },
      onEnterBack: () => {
        setActivePair(steps, gains, index, ctx, counted);
        if (railFill) {
          gsap.to(railFill, {
            scaleY: (index + 1) / steps.length,
            duration: 0.5,
            ease: STORY_EASE_OUT,
            overwrite: 'auto',
          });
        }
      },
    });
  });

  pushCleanup(cleanups, () => {
    steps.forEach((step) => gsap.set(step, { clearProps: 'opacity' }));
    gains.forEach((gain) => gsap.set(gain, { clearProps: 'opacity' }));
  });
}

function initAIDelivery(section, ctx, cleanups) {
  const block = section.querySelector('.ai-delivery');
  if (!block) return;

  const title = block.querySelector('.join-h3');
  const line = block.querySelector('.ai-delivery-line__fill');
  const cards = gsap.utils.toArray(block.querySelectorAll('.jcard'));
  const closer = block.querySelector('.ai-delivery-closer');
  const lede = block.querySelector('.fin-lede');
  const eyebrow = block.querySelector('.join-sub-eyebrow');

  setVisible([eyebrow, lede, ...cards, closer].filter(Boolean));

  if (title) {
    pushCleanup(cleanups, initTextReveal(title, ctx, {
      mode: 'words',
      trigger: block,
      start: textRevealStart(ctx),
      duration: 0.96,
      delay: 0.05,
    }));
  }

  if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(cards, { opacity: 0.52, y: 16 });
  if (closer) gsap.set(closer, { opacity: 0.52, y: 12 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: triggerStart(ctx),
      once: true,
    },
  });

  if (line) {
    tl.to(line, { scaleX: 1, duration: 0.96, ease: 'sine.out' }, 0);
  }

  tl.to(
    cards,
    {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.96,
      ease: 'sine.out',
      force3D: true,
    },
    0.1,
  );

  if (closer) {
    tl.to(closer, {
      opacity: 1,
      y: 0,
      duration: 0.96,
      ease: 'sine.out',
      force3D: true,
    }, 0.42);
  }
}

function initAIBand(section, ctx) {
  const band = section.querySelector('.ai-band');
  if (!band) return;

  setVisible(band);
  gsap.fromTo(
    band,
    { opacity: 0.52, y: 14 },
    {
      opacity: 1,
      y: 0,
      duration: 0.96,
      delay: 0.04,
      ease: 'sine.out',
      force3D: true,
      scrollTrigger: {
        trigger: band,
        start: ctx.mobile ? 'top 76%' : 'top 70%',
        once: true,
      },
    },
  );
}

export function initAIPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="ai-processes"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    section.querySelectorAll('.cv').forEach((el) => {
      const target = Number.parseFloat(el.getAttribute('data-count') || '0');
      const decimals = Number.parseInt(el.getAttribute('data-dec') || '0', 10);
      el.textContent = target.toFixed(decimals);
    });
    return;
  }

  initInternalHeader(section, ctx, cleanups);
  initInternalHeroCopy(section, ctx, '.ai-lede');
  initAIStory(section, ctx, cleanups);
  initAIDelivery(section, ctx, cleanups);
  initAIBand(section, ctx);

  const protagonist = section.querySelector('.jcard[data-vl-gsap-tilt]');
  if (ctx.advanced && protagonist) {
    pushCleanup(cleanups, bindCardTilt(protagonist, ctx, { max: 3.2, glowClass: 'vl-card-glow' }));
  }
}
