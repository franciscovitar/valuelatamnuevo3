import { ScrollTrigger } from '../gsap';
import {
  bindCardTilt,
  initInternalHeader,
  initInternalHeroCopy,
  pushCleanup,
  revealOnScroll,
  runCountUp,
  setInternalVisible,
} from './utils';

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

  initInternalHeader(section, ctx);
  initInternalHeroCopy(section, ctx, '.ai-lede');

  const left = section.querySelector('.ai-do');
  const right = section.querySelector('.ai-gain');
  const delivery = section.querySelector('.join-section-sub');
  const jcards = section.querySelectorAll('.jcard');
  const band = section.querySelector('.ai-band');

  revealOnScroll(left, ctx, { y: 12 });
  revealOnScroll(right, ctx, { y: 12, delay: 0.06 });
  revealOnScroll(section.querySelectorAll('.ai-steps li'), ctx, {
    trigger: left,
    stagger: 0.07,
    y: 10,
  });
  revealOnScroll(section.querySelectorAll('.gain'), ctx, {
    trigger: right,
    stagger: 0.08,
    y: 10,
  });

  section.querySelectorAll('.gain').forEach((gain) => {
    const counter = gain.querySelector('.cv');
    if (!counter) return;

    ScrollTrigger.create({
      trigger: gain,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        runCountUp(
          counter,
          counter.getAttribute('data-count'),
          ctx,
          { decimals: Number.parseInt(counter.getAttribute('data-dec') || '0', 10) },
        );
      },
    });
  });

  revealOnScroll(delivery, ctx, { y: 12 });
  revealOnScroll(jcards, ctx, {
    trigger: delivery?.querySelector('.join-cards') || delivery,
    stagger: 0.08,
    y: 12,
  });
  revealOnScroll(band, ctx, { y: 10 });

  if (ctx.advanced && jcards[1]) {
    pushCleanup(cleanups, bindCardTilt(jcards[1], ctx, { max: 3.2, glowClass: 'vl-card-glow' }));
  }
}
