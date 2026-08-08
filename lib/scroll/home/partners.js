import { SECTION_MOTION } from '../../motion/tokens';
import { gsap } from '@/lib/scroll/gsap';
import { initLineMaskReveal, initFadeReveal } from '@/lib/motion/textEffects';
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
  const carousel = section.querySelector('[data-vl-partner-carousel]');

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: partnerHead || section, y: 8 }));
  pushCleanup(
    cleanups,
    initLineMaskReveal(title, ctx, { trigger: partnerHead || section, stagger: 0.1 }),
  );

  if (!carousel) return;

  /*
   * La cinta ya se mueve sola por CSS, asi que la entrada solo la presenta: un
   * fade del conjunto. Escalonar logo por logo peleaba con el desplazamiento y
   * dejaba huecos moviendose a distinta opacidad.
   */
  const reveal = gsap.fromTo(
    carousel,
    { opacity: 0 },
    {
      opacity: 1,
      duration: SECTION_MOTION.duration,
      ease: SECTION_MOTION.ease,
      scrollTrigger: {
        trigger: carousel,
        start: triggerStart(ctx),
        once: true,
      },
    },
  );

  pushCleanup(cleanups, () => {
    reveal.scrollTrigger?.kill();
    reveal.kill();
    gsap.set(carousel, { clearProps: 'opacity' });
  });
}
