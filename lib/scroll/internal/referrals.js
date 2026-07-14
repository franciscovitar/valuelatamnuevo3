import {
  bindCardTilt,
  initInternalHeader,
  initInternalHeroCopy,
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

  initInternalHeader(section, ctx, cleanups);
  initInternalHeroCopy(section, ctx);

  section.querySelectorAll('.join-section-sub').forEach((block) => {
    revealOnScroll(block, ctx, { y: 12 });
  });

  revealOnScroll(section.querySelectorAll('.feat'), ctx, {
    trigger: section.querySelector('.fin-grid'),
    stagger: 0.08,
    y: 12,
  });
  revealOnScroll(section.querySelectorAll('.jcard'), ctx, {
    trigger: section.querySelector('.join-cards'),
    stagger: 0.09,
    y: 12,
  });

  const faq = section.querySelector('.faq');
  if (faq) {
    revealOnScroll(faq.querySelectorAll('details'), ctx, { trigger: faq, stagger: 0.06, y: 8 });
  }

  revealOnScroll(section.querySelector('.fin-cta'), ctx, { y: 8 });

  if (ctx.advanced) {
    const card = section.querySelector('.jcard[data-vl-gsap-tilt]');
    if (card) {
      pushCleanup(cleanups, bindCardTilt(card, ctx, { max: 3.2, glowClass: 'vl-card-glow' }));
    }
  }
}
