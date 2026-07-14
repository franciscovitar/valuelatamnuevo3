import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from '../home/palette';
import { pushCleanup } from '../home/utils';
import { STORY_EASE_OUT } from '../home/story';
import {
  initInternalHeader,
  initInternalHeroCopy,
  revealOnScroll,
  setInternalVisible,
  setVisible,
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

function positionReadingMarks(section, groups, marks) {
  const guide = section.querySelector('.pay-reading-guide');
  if (!guide || !groups.length) return () => {};

  const layout = () => {
    const guideTop = guide.offsetTop;
    groups.forEach((group, index) => {
      const mark = marks[index];
      if (!mark) return;
      const top = group.offsetTop + Math.min(group.offsetHeight * 0.15, 40) - guideTop;
      mark.style.top = `${Math.max(0, top)}px`;
    });
  };

  layout();
  window.addEventListener('resize', layout);
  return () => window.removeEventListener('resize', layout);
}

function initReadingGuide(section, ctx, cleanups) {
  const groups = gsap.utils.toArray(section.querySelectorAll('.pay-group'));
  const fill = section.querySelector('.pay-reading-guide__fill');
  const marks = gsap.utils.toArray(section.querySelectorAll('.pay-reading-guide__mark'));
  const stickyCurrent = section.querySelector('[data-pay-sticky-current]');
  const cta = section.querySelector('.fin-cta');

  if (!groups.length) return;

  if (!ctx.mobile && marks.length) {
    pushCleanup(cleanups, positionReadingMarks(section, groups, marks));
  }

  const setActive = (index) => {
    groups.forEach((group, i) => group.classList.toggle('is-pay-active', i === index));
    marks.forEach((mark, i) => mark.classList.toggle('is-pay-active', i === index));
    if (stickyCurrent) {
      stickyCurrent.textContent = groups[index]?.querySelector('.pay-group-label')?.textContent?.trim() || '';
    }
  };

  groups.forEach((group, index) => {
    ScrollTrigger.create({
      trigger: group,
      start: ctx.mobile ? 'top 72%' : 'top 58%',
      end: ctx.mobile ? 'bottom 28%' : 'bottom 42%',
      onEnter: () => setActive(index),
      onEnterBack: () => setActive(index),
    });
  });

  if (fill && cta) {
    ScrollTrigger.create({
      trigger: groups[0],
      endTrigger: cta,
      start: 'top 70%',
      end: 'bottom 80%',
      scrub: 0.45,
      onUpdate: (self) => {
        gsap.set(fill, { scaleY: self.progress, transformOrigin: 'top center' });
      },
    });
  }

  setActive(0);
  pushCleanup(cleanups, () => {
    groups.forEach((group) => group.classList.remove('is-pay-active'));
    marks.forEach((mark) => mark.classList.remove('is-pay-active'));
    if (stickyCurrent) stickyCurrent.textContent = '';
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
    gsap.set([cold, gold], { opacity: 0.52, clipPath: 'inset(0 100% 0 0)' });

    const pillarTl = gsap.timeline({
      scrollTrigger: {
        trigger: pillars,
        start: 'top 80%',
        once: true,
      },
    });

    pillarTl
      .to(cold, {
        opacity: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.88,
        ease: STORY_EASE_OUT,
        boxShadow: `0 0 40px -24px ${scrollPalette.glowIce}`,
        clearProps: 'clipPath,opacity',
      }, 0)
      .to(gold, {
        opacity: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.88,
        ease: STORY_EASE_OUT,
        boxShadow: `0 0 40px -24px ${scrollPalette.glowGold}`,
        clearProps: 'clipPath,opacity',
      }, 0.12);

    if (!ctx.mobile) {
      gsap.to(cold, {
        y: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: pillars,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.55,
        },
      });
      gsap.to(gold, {
        y: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: pillars,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.55,
        },
      });
    }
  }

  [giros, support].filter(Boolean).forEach((block, index) => {
    gsap.fromTo(
      block,
      { opacity: 0.52, y: 18, borderColor: 'rgba(246, 243, 236, 0.1)' },
      {
        opacity: 1,
        y: 0,
        borderColor: 'rgba(143, 178, 214, 0.32)',
        duration: 0.84,
        delay: index * 0.08,
        ease: STORY_EASE_OUT,
        scrollTrigger: {
          trigger: block,
          start: 'top 86%',
          once: true,
        },
        clearProps: 'transform,opacity',
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
        duration: 0.82,
        ease: STORY_EASE_OUT,
        boxShadow: `0 0 36px -28px ${scrollPalette.glowGoldSoft}`,
        scrollTrigger: {
          trigger: cta,
          start: 'top 90%',
          once: true,
        },
        clearProps: 'transform,opacity',
      },
    );
  }
}

export function initPaymentsPage(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="payments"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initInternalHeader(section, ctx, cleanups);
  initInternalHeroCopy(section, ctx, '.pay-hero');

  revealOnScroll(section.querySelector('.pay-feat-hint'), ctx, { y: 14, opacity: 0.54 });

  section.querySelectorAll('.pay-group').forEach((group) => {
    setVisible(group.querySelectorAll('.pay-group-label, .pay-feat'));
  });

  initReadingGuide(section, ctx, cleanups);
  bindPaymentAccordions(section, cleanups);
  initFinalBlocks(section, ctx);
}
