import { gsap } from '@/lib/scroll/gsap';
import { initTextPaint, initFadeReveal } from '@/lib/motion/textEffects';
import {
  pushCleanup,
  runCountUp,
  setVisible,
  triggerStart,
} from './utils';

export function initMetricsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="metrics"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const metrics = gsap.utils.toArray(section.querySelectorAll('.metric'));
  const grid = section.querySelector('.metrics-grid');

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: secHead || section, y: 8 }));
  pushCleanup(
    cleanups,
    initTextPaint(title, ctx, {
      trigger: secHead || section,
      goldPhrases: ['estructuras cerradas'],
    }),
  );

  const metricsTl = gsap.timeline({
    scrollTrigger: {
      trigger: grid || section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  metrics.forEach((metric, index) => {
    metric.querySelector('.vl-metric-sep')?.remove();
    metric.querySelector('.vl-metric-halo')?.remove();

    const cap = metric.querySelector('.cap');
    const capInner = cap?.querySelector('.vl-metric-mask__inner');
    if (cap && capInner) cap.textContent = capInner.textContent;

    const numWrap = metric.querySelector('.num');
    const valueInner = numWrap?.querySelector('.vl-metric-mask__inner');
    if (numWrap && valueInner) {
      numWrap.textContent = '';
      while (valueInner.firstChild) numWrap.appendChild(valueInner.firstChild);
      numWrap.querySelector('.vl-metric-mask')?.remove();
    }

    const valueEl = metric.querySelector('.cv');
    const target = Number(valueEl?.dataset.count || 0);
    const at = index * 0.12;

    gsap.set([numWrap, cap].filter(Boolean), { opacity: 0, y: 10 });

    if (numWrap) {
      metricsTl.to(numWrap, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }, at);
    }

    if (valueEl) {
      metricsTl.add(() => {
        runCountUp(valueEl, target, ctx, { duration: 1.02 });
      }, at + 0.1);
    }

    if (cap) {
      metricsTl.to(cap, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }, at + 0.08);
    }
  });

  pushCleanup(cleanups, () => metricsTl.scrollTrigger?.kill());
}
