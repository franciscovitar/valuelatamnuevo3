import { gsap, ScrollTrigger } from '../gsap';
import { initTextPaint, initFadeReveal, initProgressiveWrite } from '@/lib/motion/textEffects';
import { initClipReveal, bindGoldSweep } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

export function initContactSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="contact"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const textCol = section.querySelector('.cta-grid > div:first-child');
  const form = section.querySelector('form');
  const eyebrow = textCol?.querySelector('.eyebrow');
  const title = textCol?.querySelector('h2');
  const lead = textCol?.querySelector('p');
  const benefits = gsap.utils.toArray(section.querySelectorAll('.reassure > div'));

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: textCol || section, y: 8 }));
  pushCleanup(
    cleanups,
    initTextPaint(title, ctx, {
      trigger: textCol || section,
      goldPhrases: ['lo damos con vos'],
    }),
  );
  if (lead) {
    pushCleanup(cleanups, initProgressiveWrite(lead, ctx, { trigger: textCol || section, mode: 'phrases' }));
  }

  benefits.forEach((benefit, index) => {
    benefit.querySelector('.vl-check-draw')?.remove();
    benefit.querySelector('.vl-benefit-line')?.remove();

    gsap.set(benefit, { opacity: 0, x: -6 });

    const st = ScrollTrigger.create({
      trigger: benefit,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(benefit, {
          opacity: 1,
          x: 0,
          duration: 0.72,
          ease: 'power2.out',
          delay: index * 0.08,
        });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  });

  if (form) {
    pushCleanup(cleanups, initClipReveal(form, ctx, { direction: 'bottom', trigger: form }));

    const rows = gsap.utils.toArray(form.querySelectorAll('.field, .row, .btn'));
    gsap.set(rows, { opacity: 0, y: 12 });
    const submit = form.querySelector('.btn-primary');

    const formTl = gsap.timeline({
      scrollTrigger: {
        trigger: form,
        start: triggerStart(ctx),
        once: true,
      },
    });

    formTl.to(rows, { opacity: 1, y: 0, duration: 0.72, stagger: 0.08, ease: 'power2.out' }, 0.12);
    if (submit) pushCleanup(cleanups, bindGoldSweep(submit));

    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const onFocus = () => gsap.to(field, { boxShadow: '0 0 0 1px rgba(143,178,214,0.35)', duration: 0.22 });
      const onBlur = () => gsap.to(field, { boxShadow: 'none', duration: 0.22 });
      field.addEventListener('focus', onFocus);
      field.addEventListener('blur', onBlur);
      pushCleanup(cleanups, () => {
        field.removeEventListener('focus', onFocus);
        field.removeEventListener('blur', onBlur);
      });
    });

    pushCleanup(cleanups, () => formTl.scrollTrigger?.kill());
  }
}
