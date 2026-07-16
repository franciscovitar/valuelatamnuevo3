import { gsap } from '@/lib/scroll/gsap';
import { initLineMaskReveal, initFadeReveal } from '@/lib/motion/textEffects';
import { initClipReveal } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

export function initPartnersSection(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="partners"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const partnerHead = section.querySelector('.partner-head');
  const eyebrow = section.querySelector('.partner-head > .eyebrow');
  const title = section.querySelector('.partner-head h2');
  const logoGrid = section.querySelector('.partner-logo-grid--static');
  const logos = gsap.utils.toArray(logoGrid?.querySelectorAll('.partner-logo') || []);

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: partnerHead || section, y: 8 }));
  pushCleanup(
    cleanups,
    initLineMaskReveal(title, ctx, { trigger: partnerHead || section, stagger: 0.1 }),
  );

  if (logoGrid && !ctx.mobile) {
    logoGrid.classList.add('vl-partners-clip');
    pushCleanup(
      cleanups,
      initClipReveal(logoGrid, ctx, { direction: 'left', trigger: logoGrid || section }),
    );

    const logoTl = gsap.timeline({
      scrollTrigger: {
        trigger: logoGrid,
        start: triggerStart(ctx),
        once: true,
      },
    });

    logoTl.fromTo(
      logos,
      { opacity: 0.35 },
      { opacity: 1, duration: 0.88, stagger: 0.06, ease: 'power2.out' },
      0.12,
    );

    pushCleanup(cleanups, () => logoTl.scrollTrigger?.kill());
  } else if (logos.length) {
    gsap.fromTo(
      logos,
      { opacity: 0.35, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.88,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: logoGrid || section,
          start: triggerStart(ctx),
          once: true,
        },
      },
    );
  }
}
