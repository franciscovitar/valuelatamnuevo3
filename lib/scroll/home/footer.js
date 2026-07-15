import { gsap } from '../gsap';
import { revealOnce, setVisible, triggerStart, pushCleanup } from './utils';

export function initFooterSection(ctx, cleanups) {
  const footer = document.querySelector('footer[data-vl-gsap-root="footer"]');
  if (!footer) return;

  if (ctx.reduced) {
    setVisible(footer.querySelectorAll('*'));
    return;
  }

  const footGrid = footer.querySelector('.foot-grid');
  const columns = gsap.utils.toArray(footGrid?.querySelectorAll(':scope > div') || []);
  const bottom = footer.querySelector('.foot-bottom');
  const links = gsap.utils.toArray(footer.querySelectorAll('a'));

  revealOnce(columns, ctx, {
    trigger: footGrid || footer,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });

  if (bottom) {
    gsap.from(bottom, {
      opacity: 0,
      y: 12,
      duration: 0.96,
      delay: 0.04,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: bottom,
        start: triggerStart(ctx),
        once: true,
      },
    });

    gsap.fromTo(
      bottom,
      { borderTopColor: 'rgba(246, 243, 236, 0.04)' },
      {
        borderTopColor: 'rgba(246, 243, 236, 0.14)',
        duration: 0.96,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: bottom,
          start: 'top 78%',
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
