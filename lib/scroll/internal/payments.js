import {
  initInternalHeader,
  initInternalHeroCopy,
  revealOnScroll,
  setInternalVisible,
} from './utils';

export function initPaymentsPage(root, ctx) {
  const section = root.querySelector('[data-vl-gsap-root="payments"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initInternalHeader(section, ctx);
  initInternalHeroCopy(section, ctx, '.pay-hero');

  revealOnScroll(section.querySelector('.pay-feat-hint'), ctx, { y: 8 });

  section.querySelectorAll('.pay-group').forEach((group) => {
    revealOnScroll(group.querySelectorAll('.pay-group-label, .pay-feat'), ctx, {
      trigger: group,
      stagger: 0.06,
      y: 10,
    });
  });

  revealOnScroll(section.querySelector('.pay-pillars'), ctx, { y: 12 });
  revealOnScroll(section.querySelector('.pay-giros'), ctx, { y: 10 });
  revealOnScroll(section.querySelector('.pay-support'), ctx, { y: 10 });
  revealOnScroll(section.querySelector('.fin-cta'), ctx, { y: 8 });
}
