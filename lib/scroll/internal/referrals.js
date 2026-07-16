import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from '../home/palette';
import {
  initLineMaskReveal,
  initProgressiveWrite,
  initTextPaint,
} from '@/lib/motion/textEffects';
import {
  bindGoldSweep,
  initClipReveal,
  initDrawLine,
} from '@/lib/motion/uiEffects';
import {
  pushCleanup,
  setInternalVisible,
  triggerStart,
} from './utils';

const CLIP_DIRECTIONS = ['left', 'bottom', 'right'];

function initReferralsJoinBlock(block, ctx, cleanups) {
  if (!block) return;

  const eyebrow = block.querySelector('.join-sub-eyebrow');
  const title = block.querySelector('.join-h3');
  const copy = block.querySelector('.fin-lede');

  if (eyebrow) {
    gsap.set(eyebrow, { opacity: 0, y: 8 });
    const st = ScrollTrigger.create({
      trigger: block,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  }

  if (title) {
    pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: block, stagger: 0.08 }));
  }

  if (copy) {
    pushCleanup(
      cleanups,
      initProgressiveWrite(copy, ctx, {
        trigger: block,
        mode: 'phrases',
        duration: 0.68,
        stagger: 0.1,
      }),
    );
  }
}

function initReferralsFeatures(section, ctx, cleanups) {
  const features = gsap.utils.toArray(section.querySelectorAll('.feat'));

  features.forEach((feat, index) => {
    const dot = feat.querySelector('.dot');
    const title = feat.querySelector('h4');
    const copy = feat.querySelector('p');
    const fromX = index % 2 === 0 ? -12 : 12;
    const isCnv = feat.classList.contains('feat-hl');

    gsap.set(feat, { opacity: 0, x: fromX });
    if (dot) gsap.set(dot, { opacity: 0, scale: 0.6 });
    if (copy) gsap.set(copy, { opacity: 0, y: 8 });

    const st = ScrollTrigger.create({
      trigger: feat,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(feat, { opacity: 1, x: 0, duration: 0.88, ease: 'power2.out' });
        if (dot) {
          gsap.to(dot, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(1.6)', delay: 0.06 });
        }
        if (copy && !isCnv) {
          gsap.to(copy, { opacity: 1, y: 0, duration: 0.78, ease: 'power2.out', delay: 0.16 });
        }
      },
    });
    pushCleanup(cleanups, () => st.kill());

    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: feat, stagger: 0.08 }));
    }

    if (isCnv && copy) {
      pushCleanup(
        cleanups,
        initTextPaint(copy, ctx, {
          trigger: feat,
          goldPhrases: ['Agente Productor CNV', 'estructura'],
        }),
      );
    }
  });
}

function initReferralsExperience(section, ctx, cleanups) {
  const cards = gsap.utils.toArray(section.querySelectorAll('.join-cards .jcard'));

  cards.forEach((card, index) => {
    const title = card.querySelector('h4');
    const copy = card.querySelector('p');
    const direction = CLIP_DIRECTIONS[index % CLIP_DIRECTIONS.length];

    pushCleanup(
      cleanups,
      initClipReveal(card, ctx, { direction, trigger: card, duration: 0.9 }),
    );

    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: card, stagger: 0.08 }));
    }

    if (copy) {
      gsap.set(copy, { opacity: 0, y: 10 });
      const st = ScrollTrigger.create({
        trigger: card,
        start: triggerStart(ctx),
        once: true,
        onEnter: () => {
          gsap.to(copy, { opacity: 1, y: 0, duration: 0.78, ease: 'power2.out', delay: 0.14 });
        },
      });
      pushCleanup(cleanups, () => st.kill());
    }
  });
}

function initReferralsFaq(section, ctx, cleanups) {
  const faq = section.querySelector('.faq');
  if (!faq) return;

  gsap.utils.toArray(faq.querySelectorAll('details')).forEach((item, index) => {
    gsap.set(item, { opacity: 0, y: 10 });

    const st = ScrollTrigger.create({
      trigger: item,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.82,
          ease: 'power2.out',
          delay: index * 0.06,
        });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  });
}

function initReferralsCta(section, ctx, cleanups) {
  const cta = section.querySelector('.fin-cta');
  if (!cta) return;

  const note = cta.querySelector('.note');

  gsap.set(cta, { opacity: 0, y: 12 });
  const st = ScrollTrigger.create({
    trigger: cta,
    start: triggerStart(ctx),
    once: true,
    onEnter: () => {
      gsap.to(cta, {
        opacity: 1,
        y: 0,
        duration: 0.88,
        ease: 'power2.out',
        boxShadow: `0 0 28px -26px ${scrollPalette.glowGoldSoft}`,
      });
    },
  });
  pushCleanup(cleanups, () => st.kill());

  if (note) {
    pushCleanup(
      cleanups,
      initProgressiveWrite(note, ctx, {
        trigger: cta,
        mode: 'phrases',
        duration: 0.62,
        stagger: 0.08,
      }),
    );
  }

  const btn = cta.querySelector('.btn-primary');
  if (btn) pushCleanup(cleanups, bindGoldSweep(btn));
}

export function initReferralsPage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="referrals"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  const joinBlocks = gsap.utils.toArray(section.querySelectorAll('.join-section-sub'));
  initReferralsJoinBlock(joinBlocks[0], ctx, cleanups);

  initReferralsFeatures(section, ctx, cleanups);

  if (joinBlocks[1]) {
    const eyebrow = joinBlocks[1].querySelector('.join-sub-eyebrow');
    const title = joinBlocks[1].querySelector('.join-h3');
    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 8 });
      const st = ScrollTrigger.create({
        trigger: joinBlocks[1],
        start: triggerStart(ctx),
        once: true,
        onEnter: () => gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }),
      });
      pushCleanup(cleanups, () => st.kill());
    }
    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: joinBlocks[1] }));
    }
    initReferralsExperience(section, ctx, cleanups);
  }

  if (joinBlocks[2]) {
    const eyebrow = joinBlocks[2].querySelector('.join-sub-eyebrow');
    const title = joinBlocks[2].querySelector('.join-h3');
    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 8 });
      const st = ScrollTrigger.create({
        trigger: joinBlocks[2],
        start: triggerStart(ctx),
        once: true,
        onEnter: () => gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }),
      });
      pushCleanup(cleanups, () => st.kill());
    }
    if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: joinBlocks[2] }));
    }
    initReferralsFaq(section, ctx, cleanups);
  }

  initReferralsCta(section, ctx, cleanups);
}
