import { gsap } from '../gsap';
import { revealOnce } from '../home/utils';
import {
  pushCleanup,
  setInternalVisible,
} from './utils';

export function initProcessRoutePage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="process-route"]');
  if (!section) return;

  const panels = gsap.utils.toArray(section.querySelectorAll('.process-route-panel'));
  const grid = section.querySelector('.process-route-grid');

  if (ctx.reduced || !panels.length) {
    setInternalVisible(section);
    return;
  }

  gsap.set(panels, { opacity: 1, y: 0 });

  const tween = revealOnce(panels, ctx, {
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
