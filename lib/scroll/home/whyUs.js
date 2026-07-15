import { gsap } from '../gsap';
import { scrollPalette } from './palette';
import { revealOnce, scrubParallax, setVisible, triggerStart } from './utils';

export function initWhyUsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="why-us"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const edgeGrid = section.querySelector('.edge-grid');
  const content = section.querySelector('.edge-grid > div:first-child');
  const quote = section.querySelector('.pullquote');
  const bulletsWrap = section.querySelector('.edge ul');
  const bullets = gsap.utils.toArray(section.querySelectorAll('.edge li'));
  const gold = section.querySelector('.pullquote .q span');

  gsap.from(content?.children || [], {
    opacity: 0,
    x: -18,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: edgeGrid || content || section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  if (quote) {
    gsap.from(quote, {
      opacity: 0,
      x: 18,
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.98,
      delay: 0.06,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: quote,
        start: triggerStart(ctx),
        once: true,
      },
    });
  }

  revealOnce(bullets, ctx, {
    trigger: bulletsWrap || content,
    x: -10,
    y: 0,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });

  if (gold) {
    gsap.fromTo(
      gold,
      { opacity: 0.65 },
      {
        opacity: 1,
        duration: 0.96,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: quote || section,
          start: triggerStart(ctx),
          once: true,
        },
      },
    );
  }

  scrubParallax(content, content || section, ctx, { y: 10, scrub: 0.85 });
  scrubParallax(quote, quote || section, ctx, { y: -12, scrub: 0.85 });

  if (quote) {
    gsap.to(quote, {
      boxShadow: `0 24px 70px -42px rgba(0, 0, 0, 0.65), 0 0 0 1px ${scrollPalette.glowGoldSoft}`,
      scrollTrigger: {
        trigger: quote,
        start: 'top 72%',
        end: 'center center',
        scrub: 0.85,
      },
    });
  }
}
