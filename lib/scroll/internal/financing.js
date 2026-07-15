import { revealOnScroll, setInternalVisible } from './utils';

export function initFinancingPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="financing"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  revealOnScroll(section.querySelectorAll('.feat'), ctx, {
    trigger: section.querySelector('.fin-grid'),
    stagger: 0.12,
    y: 16,
    duration: 0.96,
    delay: 0.04,
  });
  revealOnScroll(section.querySelector('.subunit'), ctx, {
    trigger: section.querySelector('.subunit'),
    y: 14,
    duration: 0.96,
  });
  revealOnScroll(section.querySelector('.fin-cta'), ctx, {
    trigger: section.querySelector('.fin-cta'),
    y: 12,
    duration: 0.96,
    delay: 0.06,
  });
}
