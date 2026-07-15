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

  const secHead = section.querySelector('.sec-head');
  const head = section.querySelectorAll('.sec-head > *');
  const body = section.querySelector('.fin-lede');
  const ctaWrap = section.querySelector('.fin-cta');
  const cta = section.querySelector('.fin-cta .btn-primary');

  revealOnce(head, ctx, { trigger: secHead || section, y: 17, stagger: 0.12, duration: 0.96, delay: 0.04 });

  if (body) {
    gsap.from(body, {
      opacity: 0,
      x: -14,
      duration: 0.96,
      delay: 0.06,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: body,
        start: triggerStart(ctx),
        once: true,
      },
    });
  }

  if (cta) {
    gsap.from(cta, {
      opacity: 0,
      x: -10,
      duration: 0.96,
      delay: 0.08,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: ctaWrap || cta,
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

  scrubParallax(section.querySelector('.wrap'), section, ctx, { y: 10, scrub: 0.85 });
}
