import { gsap } from '../gsap';
import { initBandWipe } from '@/lib/motion/bandTransition';
import {
  pushCleanup,
  revealInGroups,
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

  // Corte editorial contra la sección oscura anterior.
  pushCleanup(cleanups, initBandWipe(section, ctx));

  gsap.set(cards, { opacity: 1, y: 0 });

  // Grilla 2x2: las cards llegan por filas, no una detrás de otra. Una fila
  // completa entrando de golpe se lee como composición; en fila india se lee
  // como listado.
  const tween = revealInGroups(cards, ctx, {
    trigger: grid || section,
    groupSize: 2,
    groupGap: 0.18,
    stagger: 0.05,
  });

  if (tween) {
    pushCleanup(cleanups, () => tween.scrollTrigger?.kill());
    pushCleanup(cleanups, () => tween.kill());
  }
}
