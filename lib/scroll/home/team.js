import { gsap } from '../gsap';
import {
  bindCardTilt,
  pushCleanup,
  revealOnce,
  setVisible,
} from './utils';

export function initTeamSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="team"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const head = section.querySelectorAll('.sec-head > *');
  const cards = gsap.utils.toArray(section.querySelectorAll('.person'));

  revealOnce(head, ctx, { trigger: section, y: 12, duration: 0.82 });
  revealOnce(cards, ctx, { trigger: section.querySelector('.team-grid'), y: 16, stagger: 0.12, duration: 0.74 });

  cards.forEach((card) => {
    const inner = card.querySelectorAll('.role, h4, p, .li');
    gsap.from(inner, {
      opacity: 0,
      y: 8,
      stagger: 0.06,
      duration: 0.68,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 82%',
        once: true,
      },
    });

    pushCleanup(cleanups, bindCardTilt(card, ctx, { max: 5.5, glowClass: 'vl-team-glow' }));
  });
}
