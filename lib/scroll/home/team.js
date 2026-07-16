import { gsap } from '../gsap';
import { initLineMaskReveal, initFadeReveal } from '@/lib/motion/textEffects';
import { initClipReveal, bindSpotlightCard, bindGoldSweep } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

function animatePersonCard(card, ctx, direction, cleanups) {
  const role = card.querySelector('.role');
  const name = card.querySelector('h4');
  const bio = card.querySelector('p');
  const link = card.querySelector('.person-linkedin');

  pushCleanup(
    cleanups,
    initClipReveal(card, ctx, {
      direction: ctx.mobile ? 'bottom' : direction,
      trigger: card,
    }),
  );

  if (name && !name.querySelector('.vl-name-inner')) {
    const inner = document.createElement('span');
    inner.className = 'vl-name-inner';
    inner.style.display = 'block';
    inner.textContent = name.textContent;
    name.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'vl-tx-line';
    wrap.appendChild(inner);
    name.appendChild(wrap);
    gsap.set(inner, { y: '108%' });
  }

  const nameInner = name?.querySelector('.vl-name-inner');
  const bioLines = bio
    ? bio.textContent.split(/(?<=\.)\s+/).filter(Boolean).map((line, i, arr) => {
        const span = document.createElement('span');
        span.className = 'vl-tx-phrase';
        span.style.display = 'block';
        span.textContent = line + (i < arr.length - 1 ? ' ' : '');
        return span;
      })
    : [];

  if (bio && bioLines.length) {
    bio.textContent = '';
    bioLines.forEach((span) => bio.appendChild(span));
  }

  gsap.set([role, link].filter(Boolean), { opacity: 0, y: 10 });
  if (nameInner) gsap.set(nameInner, { y: '108%' });
  if (bioLines.length) gsap.set(bioLines, { opacity: 0, y: 8 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: card,
      start: triggerStart(ctx),
      once: true,
    },
  });

  tl.to(role, { opacity: 1, y: 0, duration: 0.62, ease: 'power2.out' }, 0.14);
  if (nameInner) {
    tl.to(nameInner, { y: 0, duration: 0.78, ease: 'power2.out' }, 0.22);
  }
  if (bioLines.length) {
    tl.to(bioLines, { opacity: 1, y: 0, duration: 0.68, stagger: 0.1, ease: 'power2.out' }, 0.34);
  }
  if (link) {
    tl.to(link, { opacity: 1, y: 0, duration: 0.58, ease: 'power2.out' }, 0.52);
    pushCleanup(cleanups, bindGoldSweep(link));
  }

  pushCleanup(cleanups, () => tl.scrollTrigger?.kill());
}

export function initTeamSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="team"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const cards = gsap.utils.toArray(section.querySelectorAll('.person'));

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: secHead || section, y: 8 }));
  pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: secHead || section }));

  cards.forEach((card, index) => {
    animatePersonCard(card, ctx, index === 0 ? 'left' : 'right', cleanups);
    pushCleanup(cleanups, bindSpotlightCard(card, ctx, { maxTilt: 2.75 }));
  });
}
