import { SECTION_MOTION } from '../../motion/tokens';
import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup, setVisible, triggerStart } from './utils';

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
  const logo = footer.querySelector('.foot-logo, .brand');

  footer.querySelector('.vl-nav-topline')?.remove();
  footer.querySelectorAll('.vl-foot-underline').forEach((underline) => underline.remove());
  footer.querySelectorAll('a').forEach((link) => {
    link.style.removeProperty('transform');
  });

  if (logo) {
    gsap.set(logo, { opacity: 0.7, y: 5 });
    const st = ScrollTrigger.create({
      trigger: footer,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(logo, { opacity: 1, y: 0, duration: SECTION_MOTION.duration, ease: SECTION_MOTION.ease });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }

  gsap.set(columns, { opacity: 0, y: 14 });
  const colSt = ScrollTrigger.create({
    trigger: footGrid || footer,
    start: triggerStart(ctx),
    once: true,
    onEnter: () => {
      gsap.to(columns, { opacity: 1, y: 0, duration: SECTION_MOTION.duration, stagger: 0.09, ease: SECTION_MOTION.ease });
    },
  });
  pushCleanup(cleanups, () => colSt.kill());

  if (bottom) {
    gsap.set(bottom, { opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: bottom,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(bottom, { opacity: 1, duration: SECTION_MOTION.duration, ease: SECTION_MOTION.ease });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }
}
