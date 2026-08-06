import { gsap } from '../gsap';
import {
  pushCleanup,
  revealOnce,
  setVisible,
} from './utils';

export function initSolutionsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="solutions"]');
  if (!section) return;

  const cards = gsap.utils.toArray(section.querySelectorAll('.sol-card'));
  const grid = section.querySelector('.sol-grid');

  if (ctx.reduced || !cards.length) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  gsap.set(cards, { opacity: 1, y: 0 });

  const tween = revealOnce(cards, ctx, {
    trigger: grid || section,
    y: 14,
    duration: 0.56,
    stagger: 0.07,
    delay: 0,
  });

  if (tween) {
    pushCleanup(cleanups, () => tween.scrollTrigger?.kill());
    pushCleanup(cleanups, () => tween.kill());
  }
}
