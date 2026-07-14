import { gsap } from '../gsap';
import { revealOnce, scrubParallax, setVisible, triggerStart } from './utils';

export function initPartnersSection(root, ctx) {
  const section = root.querySelector('[data-vl-gsap-root="partners"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const head = section.querySelectorAll('.partner-head > *');
  const logos = gsap.utils.toArray(section.querySelectorAll('.partner-logo-grid--static .partner-logo'));

  revealOnce(head, ctx, { trigger: section, y: 12, stagger: 0.08, duration: 0.8 });

  gsap.from(logos, {
    opacity: 0,
    y: 14,
    stagger: 0.09,
    duration: 0.74,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  logos.forEach((logo, index) => {
    const direction = index % 3 === 0 ? -8 : index % 3 === 1 ? 0 : 8;
    scrubParallax(logo, section, ctx, { y: 6 + (index % 2) * 3, scrub: 0.65 });
    gsap.set(logo, { x: direction * 0.15 });
  });

  scrubParallax(section.querySelector('.partner-logo-grid--static'), section, ctx, { y: 8, scrub: 0.55 });
}
