import {
  bindCardTilt,
  initInternalHeader,
  initInternalHeroCopy,
  pushCleanup,
  revealOnScroll,
  setInternalVisible,
} from './utils';

export function initLiquidityPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="liquidity"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initInternalHeader(section, ctx, cleanups);
  initInternalHeroCopy(section, ctx);

  const bizGrid = section.querySelector('.biz-grid');
  const cards = section.querySelectorAll('.biz');

  revealOnScroll(cards, ctx, {
    trigger: bizGrid || section,
    stagger: 0.12,
    y: 16,
    duration: 0.96,
    delay: 0.04,
  });
  revealOnScroll(section.querySelector('.liquidity-operators'), ctx, {
    trigger: section.querySelector('.liquidity-operators'),
    y: 14,
    duration: 0.96,
  });
  revealOnScroll(section.querySelector('.fin-cta'), ctx, {
    trigger: section.querySelector('.fin-cta'),
    y: 12,
    duration: 0.96,
    delay: 0.06,
  });

  if (ctx.advanced && cards[0]) {
    pushCleanup(cleanups, bindCardTilt(cards[0], ctx, { max: 3.5, glowClass: 'vl-card-glow' }));
  }
}
