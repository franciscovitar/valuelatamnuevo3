import { gsap } from '../gsap';
import { revealOnce, setVisible, triggerStart, pushCleanup } from './utils';

export function initFooterSection(ctx, cleanups) {
  const footer = document.querySelector('footer[data-vl-gsap-root="footer"]');
  if (!footer) return;

  if (ctx.reduced) {
    setVisible(footer.querySelectorAll('*'));
    return;
  }

  const columns = gsap.utils.toArray(footer.querySelectorAll('.foot-grid > div'));
  const bottom = footer.querySelector('.foot-bottom');
  const links = gsap.utils.toArray(footer.querySelectorAll('a'));

  revealOnce(columns, ctx, { trigger: footer, y: 14, stagger: 0.08, duration: 0.74 });

  if (bottom) {
    gsap.from(bottom, {
      opacity: 0,
      y: 10,
      duration: 0.72,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: footer,
        start: triggerStart(ctx),
        once: true,
      },
    });

    gsap.fromTo(
      bottom,
      { borderTopColor: 'rgba(246, 243, 236, 0.04)' },
      {
        borderTopColor: 'rgba(246, 243, 236, 0.14)',
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bottom,
          start: 'top 92%',
          once: true,
        },
      },
    );
  }

  links.forEach((link) => {
    const onEnter = () => gsap.to(link, { x: 2, color: 'rgba(246, 243, 236, 1)', duration: 0.18 });
    const onLeave = () => gsap.to(link, { x: 0, clearProps: 'color', duration: 0.18 });
    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    pushCleanup(cleanups, () => {
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
    });
  });
}
