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

  const head = section.querySelectorAll('.sec-head > .eyebrow');
  const metrics = gsap.utils.toArray(section.querySelectorAll('.metric'));
  const grid = section.querySelector('.metrics-grid');

  revealOnce(head, ctx, { trigger: section, stagger: 0.08, y: 12, duration: 0.82 });

  const metricsTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: triggerStart(ctx),
      once: true,
    },
  });

  metricsTl.from(metrics, {
    opacity: 0,
    y: 16,
    stagger: 0.11,
    duration: 0.74,
    ease: 'power2.out',
  }, 0.12);

  metrics.forEach((metric, index) => {
    const valueEl = metric.querySelector('.cv');
    const target = Number(valueEl?.dataset.count || 0);
    const suffix = metric.querySelector('.num small');
    const cap = metric.querySelector('.cap');

    metricsTl.from([metric.querySelector('.num'), suffix, cap].filter(Boolean), {
      opacity: 0,
      y: 8,
      stagger: 0.06,
      duration: 0.68,
      ease: 'power2.out',
    }, 0.18 + index * 0.08);

    if (valueEl) {
      metricsTl.add(() => {
        runCountUp(valueEl, target, ctx, { duration: 0.92 });
      }, 0.24 + index * 0.1);
    }
  });

  pushCleanup(cleanups, () => metricsTl.scrollTrigger?.kill());

  const line = section.querySelector('.metrics-grid');
  if (line) {
    gsap.fromTo(
      line,
      { '--vl-metrics-line': '0%' },
      {
        '--vl-metrics-line': '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: 0.45,
        },
      },
    );
  }

  scrubParallax(grid, section, ctx, { y: 12, scrub: 0.5 });
}
