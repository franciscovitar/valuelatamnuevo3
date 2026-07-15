import { gsap } from '../gsap';
import {
  pushCleanup,
  revealOnce,
  runCountUp,
  scrubParallax,
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
  const head = section.querySelectorAll('.sec-head > .eyebrow');
  const metrics = gsap.utils.toArray(section.querySelectorAll('.metric'));
  const grid = section.querySelector('.metrics-grid');

  revealOnce(head, ctx, { trigger: secHead || section, y: 17, stagger: 0.12, duration: 0.96, delay: 0.04 });

  const metricsTl = gsap.timeline({
    scrollTrigger: {
      trigger: grid || section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  metricsTl.from(metrics, {
    opacity: 0,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    ease: 'power1.out',
  }, 0.08);

  metrics.forEach((metric, index) => {
    const valueEl = metric.querySelector('.cv');
    const target = Number(valueEl?.dataset.count || 0);
    const suffix = metric.querySelector('.num small');
    const cap = metric.querySelector('.cap');

    metricsTl.from([metric.querySelector('.num'), suffix, cap].filter(Boolean), {
      opacity: 0,
      y: 10,
      stagger: 0.08,
      duration: 0.92,
      ease: 'power1.out',
    }, 0.16 + index * 0.1);

    if (valueEl) {
      metricsTl.add(() => {
        runCountUp(valueEl, target, ctx, { duration: 1.04 });
      }, 0.24 + index * 0.12);
    }
  });

  pushCleanup(cleanups, () => metricsTl.scrollTrigger?.kill());

  if (grid) {
    gsap.fromTo(
      grid,
      { '--vl-metrics-line': '0%' },
      {
        '--vl-metrics-line': '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: grid,
          start: 'top 76%',
          end: 'bottom 32%',
          scrub: 0.85,
        },
      },
    );
  }

  scrubParallax(grid, grid || section, ctx, { y: 12, scrub: 0.85 });
}
