import { gsap } from '../gsap';
import { scrollPalette } from './palette';
import { setVisible, triggerStart } from './utils';

export function initRegulationSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="regulation"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const textBlocks = gsap.utils.toArray(section.querySelectorAll('.reg-inner > div:first-child > *'));
  const panel = section.querySelector('.reg-seal-panel');
  const seals = gsap.utils.toArray(section.querySelectorAll('.seal'));

  gsap.from(textBlocks, {
    opacity: 0,
    y: 10,
    stagger: 0.07,
    duration: 0.76,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  if (panel) {
    gsap.from(panel, {
      opacity: 0,
      scale: 0.985,
      duration: 0.78,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: triggerStart(ctx),
        once: true,
      },
    });

    gsap.fromTo(
      panel,
      { boxShadow: '0 24px 70px -42px rgba(0, 0, 0, 0.55)' },
      {
        boxShadow: `0 24px 70px -38px rgba(0, 0, 0, 0.55), 0 0 28px ${scrollPalette.glowIceSoft}`,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: triggerStart(ctx),
          once: true,
        },
      },
    );
  }

  gsap.from(seals, {
    opacity: 0,
    scale: 0.96,
    stagger: 0.1,
    duration: 0.72,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: panel || section,
      start: triggerStart(ctx),
      once: true,
    },
  });
}
