import { gsap, ScrollTrigger } from '../gsap';
import { initFadeReveal } from '@/lib/motion/textEffects';
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
  const links = gsap.utils.toArray(footer.querySelectorAll('a'));

  footer.querySelector('.vl-nav-topline')?.remove();

  if (logo) {
    gsap.set(logo, { opacity: 0.7, y: 5 });
    const st = ScrollTrigger.create({
      trigger: footer,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(logo, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' });
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
      gsap.to(columns, { opacity: 1, y: 0, duration: 0.82, stagger: 0.09, ease: 'power2.out' });
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
        gsap.to(bottom, { opacity: 1, duration: 0.72, ease: 'power2.out' });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }

  links.forEach((link) => {
    let underline = link.querySelector('.vl-foot-underline');
    if (!underline) {
      underline = document.createElement('span');
      underline.className = 'vl-foot-underline';
      underline.setAttribute('aria-hidden', 'true');
      underline.style.cssText = 'display:block;height:1px;width:100%;margin-top:2px;background:currentColor;transform-origin:left center;transform:scaleX(0);opacity:0.65;';
      link.style.position = 'relative';
      link.appendChild(underline);
    }

    const onEnter = () => {
      gsap.to(link, { x: 2, duration: 0.18, ease: 'power2.out' });
      gsap.to(underline, { scaleX: 1, duration: 0.24, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to(link, { x: 0, duration: 0.18, ease: 'power2.out' });
      gsap.to(underline, { scaleX: 0, duration: 0.22, ease: 'power2.in' });
    };

    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    pushCleanup(cleanups, () => {
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
    });
  });
}
