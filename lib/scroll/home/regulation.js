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

  const textWrap = section.querySelector('.reg-inner > div:first-child');
  const textBlocks = gsap.utils.toArray(textWrap?.querySelectorAll(':scope > *') || []);
  const panel = section.querySelector('.reg-seal-panel');
  const seals = gsap.utils.toArray(section.querySelectorAll('.seal'));

  gsap.from(textBlocks, {
    opacity: 0,
    y: 12,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: textWrap || section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  if (panel) {
    gsap.from(panel, {
      opacity: 0,
      scale: 0.985,
      duration: 0.96,
      delay: 0.06,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: panel,
        start: triggerStart(ctx),
        once: true,
      },
    });

    gsap.fromTo(
      panel,
      { boxShadow: '0 24px 70px -42px rgba(0, 0, 0, 0.55)' },
      {
        boxShadow: `0 24px 70px -38px rgba(0, 0, 0, 0.55), 0 0 28px ${scrollPalette.glowIceSoft}`,
        duration: 1.04,
        ease: 'power1.out',
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
    stagger: 0.12,
    duration: 0.96,
    delay: 0.08,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: panel || section,
      start: triggerStart(ctx),
      once: true,
    },
  });
}
