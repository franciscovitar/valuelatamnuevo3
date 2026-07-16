import { gsap, ScrollTrigger } from '../gsap';
import { STORY_EASE_OUT } from '../home/story';
import {
  initCharReveal,
  initLineMaskReveal,
  initProgressiveWrite,
  initTextPaint,
} from '@/lib/motion/textEffects';
import {
  bindGoldSweep,
  bindSpotlightCard,
  initClipReveal,
  initDrawLine,
} from '@/lib/motion/uiEffects';
import {
  bindCardTilt,
  pushCleanup,
  runCountUp,
  setInternalVisible,
  triggerStart,
} from './utils';

const STEP_BASE = { opacity: 0.74 };
const STEP_ACTIVE = { opacity: 1 };

function wrapGainNumber(gnumEl) {
  if (!gnumEl || gnumEl.querySelector('.vl-metric-mask__inner')) return null;

  const inner = document.createElement('span');
  inner.className = 'vl-metric-mask__inner';
  while (gnumEl.firstChild) {
    inner.appendChild(gnumEl.firstChild);
  }
  const mask = document.createElement('span');
  mask.className = 'vl-metric-mask';
  mask.appendChild(inner);
  gnumEl.prepend(mask);
  return inner;
}

function setActiveStep(steps, stepIndex) {
  steps.forEach((step, i) => {
    gsap.to(step, {
      ...(i === stepIndex ? STEP_ACTIVE : STEP_BASE),
      duration: 0.55,
      ease: STORY_EASE_OUT,
      overwrite: 'auto',
    });
  });
}

function initAIStory(section, ctx, cleanups) {
  const steps = gsap.utils.toArray(section.querySelectorAll('.ai-steps li'));
  const railFill = section.querySelector('.ai-story-rail__fill');
  const stepsWrap = section.querySelector('.ai-steps-wrap');

  if (!steps.length) return;

  gsap.set(steps, STEP_BASE);
  gsap.set(steps[0], STEP_ACTIVE);

  if (railFill && stepsWrap) {
    gsap.set(railFill, { scaleY: 0, transformOrigin: 'top center' });
    pushCleanup(
      cleanups,
      initDrawLine(railFill, ctx, {
        trigger: stepsWrap,
        axis: 'y',
        scrub: 0.8,
        start: triggerStart(ctx),
        end: 'bottom 28%',
      }),
    );
  }

  steps.forEach((step, index) => {
    const num = step.querySelector('.n');
    const title = step.querySelector('h4');
    const copy = step.querySelector('p');

    if (num) {
      pushCleanup(
        cleanups,
        initCharReveal(num, ctx, { trigger: step, maxChars: 2, duration: 0.62 }),
      );
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

    const st = ScrollTrigger.create({
      trigger: step,
      start: ctx.mobile ? 'top 76%' : 'top 70%',
      end: ctx.mobile ? 'bottom 24%' : 'bottom 30%',
      onEnter: () => setActiveStep(steps, index),
      onEnterBack: () => setActiveStep(steps, index),
    });
    pushCleanup(cleanups, () => st.kill());
  });

  pushCleanup(cleanups, () => {
    steps.forEach((step) => gsap.set(step, { clearProps: 'opacity' }));
  });
}

function initAIGains(section, ctx, cleanups) {
  const gains = gsap.utils.toArray(section.querySelectorAll('.gain'));
  const playedCounters = new Set();

  gains.forEach((gain, index) => {
    const gnum = gain.querySelector('.gnum');
    const copy = gain.querySelector('p');
    const counter = gain.querySelector('.cv');
    const valueInner = wrapGainNumber(gnum);
    let played = false;

    gsap.set(gain, { opacity: 0, y: 14 });
    if (copy) gsap.set(copy, { opacity: 0, y: 8 });

    const play = () => {
      if (played) return;
      played = true;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      const at = index * 0.04;

      tl.to(gain, { opacity: 1, y: 0, duration: 0.78 }, at);

      if (valueInner) {
        tl.fromTo(
          valueInner,
          { y: '108%', opacity: 0.45 },
          { y: 0, opacity: 1, duration: 0.82 },
          at + 0.08,
        );
      } else if (gnum) {
        tl.fromTo(gnum, { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.78 }, at + 0.08);
      }

      if (counter && !playedCounters.has(counter)) {
        playedCounters.add(counter);
        tl.add(() => {
          runCountUp(counter, counter.getAttribute('data-count'), ctx, {
            decimals: Number.parseInt(counter.getAttribute('data-dec') || '0', 10),
            duration: 1.02,
          });
        }, at + 0.18);
      }

      if (copy) {
        tl.to(copy, { opacity: 1, y: 0, duration: 0.72 }, at + 0.22);
      }
    };

    const st = ScrollTrigger.create({
      trigger: gain,
      start: triggerStart(ctx),
      once: true,
      onEnter: play,
    });
    pushCleanup(cleanups, () => st.kill());
  });

  pushCleanup(cleanups, () => {
    gains.forEach((gain) => {
      const counter = gain.querySelector('.cv');
      if (counter) {
        const target = Number.parseFloat(counter.getAttribute('data-count') || '0');
        const decimals = Number.parseInt(counter.getAttribute('data-dec') || '0', 10);
        counter.textContent = target.toFixed(decimals);
      }
      gsap.set(gain, { clearProps: 'opacity,transform' });
    });
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

  if (title) {
    pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: block }));
  }

  if (lede) {
    gsap.set(lede, { opacity: 0, y: 10 });
    const st = ScrollTrigger.create({
      trigger: block,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(lede, { opacity: 1, y: 0, duration: 0.82, ease: 'power2.out', delay: 0.1 });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }

  if (line) {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    pushCleanup(
      cleanups,
      initDrawLine(line, ctx, { trigger: block, axis: 'x', duration: 0.88 }),
    );
  }

  cards.forEach((card, index) => {
    const cardTitle = card.querySelector('h4');
    const cardCopy = card.querySelector('p');
    let border = card.querySelector('.vl-card-topline');
    if (!border) {
      border = document.createElement('span');
      border.className = 'vl-card-topline';
      border.setAttribute('aria-hidden', 'true');
      card.style.position = 'relative';
      card.prepend(border);
    }
    gsap.set(border, { scaleX: 0, transformOrigin: 'left center' });

    pushCleanup(
      cleanups,
      initClipReveal(card, ctx, {
        direction: index % 2 === 0 ? 'left' : 'bottom',
        trigger: card,
        duration: 0.9,
      }),
    );

    if (cardTitle) {
      pushCleanup(cleanups, initLineMaskReveal(cardTitle, ctx, { trigger: card, stagger: 0.08 }));
    }

    if (cardCopy) {
      gsap.set(cardCopy, { opacity: 0, y: 10 });
      const st = ScrollTrigger.create({
        trigger: card,
        start: triggerStart(ctx),
        once: true,
        onEnter: () => {
          gsap.to(cardCopy, { opacity: 1, y: 0, duration: 0.78, ease: 'power2.out', delay: 0.14 });
          gsap.to(border, { scaleX: 1, duration: 0.52, ease: 'power2.out', delay: 0.08 });
        },
      });
      pushCleanup(cleanups, () => st.kill());
    }
  });

  if (closer) {
    gsap.set(closer, { opacity: 0, y: 10 });
    const st = ScrollTrigger.create({
      trigger: closer,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(closer, { opacity: 1, y: 0, duration: 0.82, ease: 'power2.out' });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }
}

function initAIBand(section, ctx, cleanups) {
  const band = section.querySelector('.ai-band');
  if (!band) return;

  const tagline = band.querySelector('.tagline');
  const btn = band.querySelector('.btn-primary');

  pushCleanup(
    cleanups,
    initClipReveal(band, ctx, { direction: 'bottom', trigger: band, duration: 0.92 }),
  );

  if (tagline) {
    pushCleanup(
      cleanups,
      initTextPaint(tagline, ctx, {
        trigger: band,
        goldPhrases: ['tomar decisiones'],
      }),
    );
  }

  if (btn) {
    gsap.set(btn, { opacity: 0, y: 8 });
    const st = ScrollTrigger.create({
      trigger: band,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(btn, { opacity: 1, y: 0, duration: 0.78, ease: 'power2.out', delay: 0.16 });
      },
    });
    pushCleanup(cleanups, () => st.kill());
    pushCleanup(cleanups, bindGoldSweep(btn));
    if (!ctx.mobile) pushCleanup(cleanups, bindSpotlightCard(band, ctx, { maxTilt: 1.8 }));
  }
}

export function initAIPage(root, ctx, cleanups = []) {
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

  initAIStory(section, ctx, cleanups);
  initAIGains(section, ctx, cleanups);
  initAIDelivery(section, ctx, cleanups);
  initAIBand(section, ctx, cleanups);

  const protagonist = section.querySelector('.jcard[data-vl-gsap-tilt]');
  if (ctx.advanced && protagonist) {
    pushCleanup(cleanups, bindCardTilt(protagonist, ctx, { max: 3.2, glowClass: 'vl-card-glow' }));
  }
}
