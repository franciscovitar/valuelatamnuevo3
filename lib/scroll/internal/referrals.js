import {
  bindCardTilt,
  pushCleanup,
  revealOnScroll,
  setInternalVisible,
} from './utils';

export function initReferralsPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="referrals"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  section.querySelectorAll('.join-section-sub').forEach((block) => {
    revealOnScroll(block.querySelectorAll(':scope > *'), ctx, {
      trigger: block,
      y: 14,
      stagger: 0.12,
      duration: 0.96,
      delay: 0.04,
    });
  });

  revealOnScroll(section.querySelectorAll('.feat'), ctx, {
    trigger: section.querySelector('.fin-grid'),
    stagger: 0.12,
    y: 14,
    duration: 0.96,
  });
  revealOnScroll(section.querySelectorAll('.jcard'), ctx, {
    trigger: section.querySelector('.join-cards'),
    stagger: 0.12,
    y: 14,
    duration: 0.96,
    delay: 0.04,
  });

  const faq = section.querySelector('.faq');
  if (faq) {
    revealOnScroll(faq.querySelectorAll('details'), ctx, {
      trigger: faq,
      stagger: 0.1,
      y: 12,
      duration: 0.96,
    });
  }

  revealOnScroll(section.querySelector('.fin-cta'), ctx, {
    trigger: section.querySelector('.fin-cta'),
    y: 12,
    duration: 0.96,
    delay: 0.06,
  });

  if (ctx.advanced) {
    const card = section.querySelector('.jcard[data-vl-gsap-tilt]');
    if (card) {
      pushCleanup(cleanups, bindCardTilt(card, ctx, { max: 3.2, glowClass: 'vl-card-glow' }));
    }
  }
}
