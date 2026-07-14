import { gsap } from '../gsap';
import { revealOnce, scrubParallax, setVisible, triggerStart } from './utils';

export function initContactSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="contact"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const textCol = section.querySelector('.cta-grid > div:first-child');
  const form = section.querySelector('form');
  const benefits = gsap.utils.toArray(section.querySelectorAll('.reassure > div'));

  gsap.from(
    gsap.utils.toArray(textCol?.children || []).filter((el) => !el.matches('h2.serif')),
    {
      opacity: 0,
      y: 12,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: triggerStart(ctx),
        once: true,
      },
    },
  );

  revealOnce(benefits, ctx, { trigger: textCol, x: -8, y: 0, stagger: 0.09, duration: 0.72 });

  if (form) {
    gsap.from(form, {
      opacity: 0,
      y: 16,
      x: 10,
      duration: 0.82,
      ease: 'power2.out',
      delay: 0.12,
      scrollTrigger: {
        trigger: section,
        start: triggerStart(ctx),
        once: true,
      },
    });
  }

  scrubParallax(textCol, section, ctx, { y: 8, scrub: 0.6 });
  scrubParallax(form, section, ctx, { y: -6, scrub: 0.6 });
}
