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

  initInternalHeader(section, ctx);
  initInternalHeroCopy(section, ctx);

  const cards = section.querySelectorAll('.biz');
  revealOnScroll(cards, ctx, {
    trigger: section.querySelector('.biz-grid'),
    stagger: 0.1,
    y: 16,
  });
  revealOnScroll(section.querySelector('.liquidity-operators'), ctx, { y: 10 });
  revealOnScroll(section.querySelector('.fin-cta'), ctx, { y: 8 });

  if (ctx.advanced && cards[0]) {
    pushCleanup(cleanups, bindCardTilt(cards[0], ctx, { max: 3.5, glowClass: 'vl-card-glow' }));
  }
}
