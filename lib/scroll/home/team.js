import { gsap } from '../gsap';
import {
  bindCardTilt,
  pushCleanup,
  revealOnce,
  setVisible,
  triggerStart,
} from './utils';

export function initTeamSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="team"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const secHead = section.querySelector('.sec-head');
  const teamGrid = section.querySelector('.team-grid');
  const head = section.querySelectorAll('.sec-head > *');
  const cards = gsap.utils.toArray(section.querySelectorAll('.person'));

  revealOnce(head, ctx, { trigger: secHead || section, y: 17, duration: 0.96, delay: 0.04 });
  revealOnce(cards, ctx, {
    trigger: teamGrid || section,
    y: 17,
    stagger: 0.12,
    duration: 0.96,
    delay: 0.04,
  });

  cards.forEach((card) => {
    const inner = card.querySelectorAll('.role, h4, p, .li');
    gsap.from(inner, {
      opacity: 0,
      y: 10,
      stagger: 0.1,
      duration: 0.92,
      delay: 0.04,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 70%',
        once: true,
      },
    });

    pushCleanup(cleanups, bindCardTilt(card, ctx, { max: 5.5, glowClass: 'vl-team-glow' }));
  });
}
