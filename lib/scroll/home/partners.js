import { gsap } from '../gsap';
import { revealOnce, scrubParallax, setVisible, triggerStart } from './utils';

export function initPartnersSection(root, ctx) {
  const section = root.querySelector('[data-vl-gsap-root="partners"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const partnerHead = section.querySelector('.partner-head');
  const logoGrid = section.querySelector('.partner-logo-grid--static');
  const head = section.querySelectorAll('.partner-head > *');
  const logos = gsap.utils.toArray(logoGrid?.querySelectorAll('.partner-logo') || []);

  revealOnce(head, ctx, { trigger: partnerHead || section, y: 17, stagger: 0.12, duration: 0.96, delay: 0.04 });

  gsap.from(logos, {
    opacity: 0,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: logoGrid || section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  logos.forEach((logo, index) => {
    const direction = index % 3 === 0 ? -8 : index % 3 === 1 ? 0 : 8;
    scrubParallax(logo, logoGrid || section, ctx, { y: 6 + (index % 2) * 3, scrub: 0.85 });
    gsap.set(logo, { x: direction * 0.15 });
  });

  if (logoGrid) {
    scrubParallax(logoGrid, logoGrid, ctx, { y: 8, scrub: 0.85 });
  }
}
