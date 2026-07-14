import {
  initInternalHeader,
  initInternalHeroCopy,
  revealOnScroll,
  setInternalVisible,
} from './utils';

export function initFinancingPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="financing"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initInternalHeader(section, ctx, cleanups);
  initInternalHeroCopy(section, ctx);

  revealOnScroll(section.querySelectorAll('.feat'), ctx, {
    trigger: section.querySelector('.fin-grid'),
    stagger: 0.09,
    y: 16,
  });
  revealOnScroll(section.querySelector('.subunit'), ctx, { y: 12 });
  revealOnScroll(section.querySelector('.fin-cta'), ctx, { y: 8 });
}
