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
  const benefitsWrap = section.querySelector('.reassure');
  const benefits = gsap.utils.toArray(section.querySelectorAll('.reassure > div'));

  gsap.from(
    gsap.utils.toArray(textCol?.children || []).filter((el) => !el.matches('h2.serif')),
    {
      opacity: 0,
      y: 17,
      stagger: 0.12,
      duration: 0.96,
      delay: 0.04,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: textCol || section,
        start: triggerStart(ctx),
        once: true,
      },
    },
  );

  revealOnce(benefits, ctx, {
    trigger: benefitsWrap || textCol,
    x: -8,
    y: 0,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });

  if (form) {
    gsap.from(form, {
      opacity: 0,
      y: 17,
      x: 10,
      duration: 0.96,
      ease: 'power1.out',
      delay: 0.1,
      scrollTrigger: {
        trigger: form,
        start: triggerStart(ctx),
        once: true,
      },
    });
  }

  scrubParallax(textCol, textCol || section, ctx, { y: 8, scrub: 0.85 });
  scrubParallax(form, form || section, ctx, { y: -6, scrub: 0.85 });
}
