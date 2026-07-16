import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from '../home/palette';
import { initLineMaskReveal, initTextPaint } from '@/lib/motion/textEffects';
import { bindGoldSweep, initClipReveal, initDrawLine } from '@/lib/motion/uiEffects';
import {
  pushCleanup,
  setInternalVisible,
  triggerStart,
} from './utils';

function initFinancingFeatures(section, ctx, cleanups) {
  const features = gsap.utils.toArray(section.querySelectorAll('.feat'));

  features.forEach((feat, index) => {
    const title = feat.querySelector('h4');
    const copy = feat.querySelector('p');
    const rotation = index % 2 === 0 ? -0.4 : 0.4;

    gsap.set(feat, { opacity: 0, y: 14, rotation });
    if (copy) gsap.set(copy, { opacity: 0, y: 10 });

    const st = ScrollTrigger.create({
      trigger: feat,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(feat, {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.92,
          ease: 'power2.out',
        });
        if (copy) {
          gsap.to(copy, {
            opacity: 1,
            y: 0,
            duration: 0.82,
            ease: 'power2.out',
            delay: 0.14,
          });
        }
      },
    });
    pushCleanup(cleanups, () => st.kill());

    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: feat, stagger: 0.08 }));
    }
  });
}

function initFinancingSubunit(section, ctx, cleanups) {
  const grid = section.querySelector('.fin-grid');
  const subunit = section.querySelector('.subunit');
  if (!subunit) return;

  const tag = subunit.querySelector('.su-tag');
  const title = subunit.querySelector('h3');
  const copy = subunit.querySelector('.fin-paint');

  if (grid) {
    let line = section.querySelector('.vl-fin-divider');
    if (!line) {
      line = document.createElement('span');
      line.className = 'vl-fin-divider';
      line.setAttribute('aria-hidden', 'true');
      grid.insertAdjacentElement('afterend', line);
    }
    pushCleanup(
      cleanups,
      initDrawLine(line, ctx, { trigger: subunit, axis: 'x', duration: 0.88 }),
    );
  }

  pushCleanup(
    cleanups,
    initClipReveal(subunit, ctx, { direction: 'right', trigger: subunit, duration: 0.92 }),
  );

  if (tag) {
    gsap.set(tag, { opacity: 0, y: 8 });
    const st = ScrollTrigger.create({
      trigger: subunit,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(tag, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out', delay: 0.08 });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }

  if (title) {
    pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: subunit, stagger: 0.08 }));
  }

  if (copy) {
    pushCleanup(
      cleanups,
      initTextPaint(copy, ctx, {
        trigger: subunit,
        goldPhrases: ['trabajamos para vos'],
      }),
    );
  }
}

function initFinancingCta(section, ctx, cleanups) {
  const cta = section.querySelector('.fin-cta');
  if (!cta) return;

  pushCleanup(
    cleanups,
    initClipReveal(cta, ctx, { direction: 'bottom', trigger: cta, duration: 0.88 }),
  );

  const btn = cta.querySelector('.btn-primary');
  if (btn) pushCleanup(cleanups, bindGoldSweep(btn));
}

export function initFinancingPage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="financing"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initFinancingFeatures(section, ctx, cleanups);
  initFinancingSubunit(section, ctx, cleanups);
  initFinancingCta(section, ctx, cleanups);
}
