import { gsap } from '../gsap';
import { scrollPalette } from './palette';
import { revealOnce, scrubParallax, setVisible, triggerStart } from './utils';

export function initReferralsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="referrals"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const head = section.querySelectorAll('.sec-head > *');
  const body = section.querySelector('.fin-lede');
  const cta = section.querySelector('.fin-cta .btn-primary');

  gsap.from(head, {
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
  });

  if (body) {
    gsap.from(body, {
      opacity: 0,
      x: -14,
      duration: 0.82,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: triggerStart(ctx),
        once: true,
      },
    });
  }

  if (cta) {
    gsap.from(cta, {
      opacity: 0,
      x: -10,
      duration: 0.78,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: triggerStart(ctx),
        once: true,
      },
    });

    if (!ctx.mobile) {
      const onEnter = () => {
        gsap.to(cta, {
          y: -3,
          scale: 1.016,
          boxShadow: `0 16px 40px -12px ${scrollPalette.glowGold}, 0 0 0 1px ${scrollPalette.glowGoldSoft}`,
          duration: 0.24,
          ease: 'power2.out',
        });
      };
      const onLeave = () => {
        gsap.to(cta, {
          y: 0,
          scale: 1,
          boxShadow: 'none',
          duration: 0.24,
          ease: 'power2.out',
        });
      };
      cta.addEventListener('pointerenter', onEnter);
      cta.addEventListener('pointerleave', onLeave);
    }
  }

  scrubParallax(section.querySelector('.wrap'), section, ctx, { y: 10, scrub: 0.55 });
}
