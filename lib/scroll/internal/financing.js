import { SECTION_MOTION } from '../../motion/tokens';
import { gsap, ScrollTrigger } from '../gsap';
import { initLineMaskReveal, initTextPaint } from '@/lib/motion/textEffects';
import { bindGoldSweep, initClipReveal } from '@/lib/motion/uiEffects';
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

    gsap.set(feat, { opacity: 0, y: 14 });
    if (copy) gsap.set(copy, { opacity: 0, y: 10 });

    const st = ScrollTrigger.create({
      trigger: feat,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(feat, {
          opacity: 1,
          y: 0,
          duration: SECTION_MOTION.duration,
          ease: SECTION_MOTION.ease,
        });
        if (copy) {
          gsap.to(copy, {
            opacity: 1,
            y: 0,
            duration: SECTION_MOTION.duration,
            ease: SECTION_MOTION.ease,
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
  const subunit = section.querySelector('.subunit');
  if (!subunit) return;

  const tag = subunit.querySelector('.su-tag');
  const title = subunit.querySelector('h3');
  const copy = subunit.querySelector('.fin-paint');

  pushCleanup(
    cleanups,
    initClipReveal(subunit, ctx, { direction: 'right', trigger: subunit, duration: SECTION_MOTION.duration }),
  );

  if (tag) {
    gsap.set(tag, { opacity: 0, y: 8 });
    const st = ScrollTrigger.create({
      trigger: subunit,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(tag, { opacity: 1, y: 0, duration: SECTION_MOTION.duration, ease: SECTION_MOTION.ease, delay: 0.08 });
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
    initClipReveal(cta, ctx, { direction: 'bottom', trigger: cta, duration: SECTION_MOTION.duration }),
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
