import { gsap } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import { bindGoldSweep, bindMagnetic } from '@/lib/motion/uiEffects';

export function initHeaderMotion() {
  if (prefersReducedMotion()) return () => {};

  const cleanups = [];
  const header = document.querySelector('header.nav');
  if (!header) return () => {};

  const brand = header.querySelector('.brand');
  if (brand && !sessionStorage.getItem('vl-logo-intro')) {
    gsap.fromTo(
      brand,
      { opacity: 0.82, y: -4 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
    );
    sessionStorage.setItem('vl-logo-intro', '1');
  }

  if (window.matchMedia('(min-width: 981px)').matches) {
    const cta = header.querySelector('.nav-cta .btn-primary') || header.querySelector('.nav .btn-primary');
    if (cta) {
      cleanups.push(bindMagnetic(cta, { max: 2, scaleMax: 1.01 }));
      cleanups.push(bindGoldSweep(cta));
    }
  }

  return () => cleanups.forEach((fn) => fn());
}
