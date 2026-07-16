import { gsap, ScrollTrigger } from '../gsap';
import { initTextPaint, initFadeReveal, initProgressiveWrite } from '@/lib/motion/textEffects';
import { bindGoldSweep, bindMagnetic } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

export function initReferralsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="referrals"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const body = section.querySelector('.fin-lede');
  const ctaWrap = section.querySelector('.fin-cta');
  const cta = section.querySelector('.fin-cta .btn-primary');

  section.querySelector('.vl-referral-halo')?.remove();

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: secHead || section, y: 8 }));
  pushCleanup(
    cleanups,
    initTextPaint(title, ctx, {
      trigger: secHead || section,
      goldPhrases: ['estructura CNV'],
    }),
  );

  if (body) {
    pushCleanup(
      cleanups,
      initProgressiveWrite(body, ctx, {
        trigger: body,
        mode: 'phrases',
        duration: 0.72,
        stagger: 0.1,
      }),
    );
  }

  if (cta) {
    gsap.set(cta, { opacity: 0, y: 6 });
    const st = ScrollTrigger.create({
      trigger: ctaWrap || cta,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(cta, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' });
      },
    });
    pushCleanup(cleanups, () => st.kill());
    pushCleanup(cleanups, bindGoldSweep(cta));
    if (!ctx.mobile) pushCleanup(cleanups, bindMagnetic(cta, { max: 2, scaleMax: 1.01 }));
  }
}
