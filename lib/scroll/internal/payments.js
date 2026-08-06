import { gsap } from '../gsap';
import { pushCleanup } from '../home/utils';
import {
  revealOnScroll,
  setInternalVisible,
  setVisible,
  triggerStart,
} from './utils';

function bindPaymentAccordions(section, cleanups) {
  section.querySelectorAll('.pay-feat').forEach((detail) => {
    const sync = () => {
      detail.classList.toggle('is-pay-open', detail.open);
    };
    detail.addEventListener('toggle', sync);
    pushCleanup(cleanups, () => detail.removeEventListener('toggle', sync));
  });
}

function initFinalBlocks(section, ctx) {
  const pillars = section.querySelector('.pay-pillars');
  const cold = section.querySelector('[data-pay-block="pillar-cold"]');
  const gold = section.querySelector('[data-pay-block="pillar-gold"]');
  const giros = section.querySelector('[data-pay-block="giros"]');
  const support = section.querySelector('[data-pay-block="support"]');
  const cta = section.querySelector('[data-pay-block="cta"]');

  if (pillars && cold && gold) {
    gsap.fromTo(
      [cold, gold],
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.68,
        stagger: 0.14,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: pillars,
          start: triggerStart(ctx),
          once: true,
        },
      },
    );
  }

  [giros, support].filter(Boolean).forEach((block, index) => {
    gsap.fromTo(
      block,
      { opacity: 0.52, y: 17, borderColor: 'rgba(246, 243, 236, 0.1)' },
      {
        opacity: 1,
        y: 0,
        borderColor: 'rgba(196, 194, 190, 0.32)',
        duration: 0.68,
        delay: 0.04 + index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: block,
          start: triggerStart(ctx),
          once: true,
        },
      },
    );
  });

  if (cta) {
    gsap.fromTo(
      cta,
      { opacity: 0.5, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.68,
        delay: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cta,
          start: ctx.mobile ? 'top 76%' : 'top 70%',
          once: true,
        },
      },
    );
  }
}

export function initPaymentsPage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="payments"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  revealOnScroll(section.querySelector('.pay-feat-hint'), ctx, {
    trigger: section.querySelector('.pay-feat-hint'),
    y: 14,
    opacity: 0.54,
    duration: 0.68,
  });

  section.querySelectorAll('.pay-group').forEach((group) => {
    setVisible(group.querySelectorAll('.pay-group-label, .pay-feat'));
  });

  bindPaymentAccordions(section, cleanups);
  initFinalBlocks(section, ctx);
}
