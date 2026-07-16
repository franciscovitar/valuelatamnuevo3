import { gsap, ScrollTrigger } from '../gsap';
import {
  initLineMaskReveal,
  initTextPaint,
} from '@/lib/motion/textEffects';
import {
  bindGoldSweep,
  bindSpotlightCard,
  initClipReveal,
  initDrawLine,
} from '@/lib/motion/uiEffects';
import {
  pushCleanup,
  setInternalVisible,
  triggerStart,
} from './utils';

function initLiquidityBizGrid(section, ctx, cleanups) {
  const bizGrid = section.querySelector('.biz-grid');
  const cards = gsap.utils.toArray(section.querySelectorAll('.biz'));
  if (!cards.length) return;

  cards.forEach((card, index) => {
    const title = card.querySelector('h3');
    const copy = card.querySelector('p');
    const direction = index === 0 ? 'left' : 'right';

    pushCleanup(
      cleanups,
      initClipReveal(card, ctx, { direction, trigger: card, duration: 0.92 }),
    );

    if (index === 0 && title) {
      pushCleanup(
        cleanups,
        initTextPaint(title, ctx, {
          trigger: card,
          goldPhrases: ['liquidez'],
        }),
      );
    } else if (title) {
      pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: card, stagger: 0.08 }));
    }

    if (copy) {
      gsap.set(copy, { opacity: 0, y: 12 });
      const st = ScrollTrigger.create({
        trigger: card,
        start: triggerStart(ctx),
        once: true,
        onEnter: () => {
          gsap.to(copy, { opacity: 1, y: 0, duration: 0.82, ease: 'power2.out', delay: 0.12 });
        },
      });
      pushCleanup(cleanups, () => st.kill());
    }

    if (!ctx.mobile && !ctx.reduced) {
      pushCleanup(cleanups, bindSpotlightCard(card, ctx, { maxTilt: 1.5 }));
    }
  });

  if (!ctx.mobile && cards.length >= 2 && bizGrid) {
    const parallax = gsap.timeline({
      scrollTrigger: {
        trigger: bizGrid,
        start: 'top 78%',
        end: 'bottom 22%',
        scrub: 0.85,
      },
    });
    parallax.to(cards[0], { y: -10, ease: 'none' }, 0);
    parallax.to(cards[1], { y: 10, ease: 'none' }, 0);
    pushCleanup(cleanups, () => parallax.scrollTrigger?.kill());
  }
}

function initLiquidityOperators(section, ctx, cleanups) {
  const block = section.querySelector('.liquidity-operators');
  if (!block) return;

  const items = gsap.utils.toArray(
    block.querySelectorAll('.liquidity-operators__label, .liquidity-operators__logo, .liquidity-operators__more'),
  );

  let line = block.querySelector('.vl-liq-operators-line');
  if (!line) {
    line = document.createElement('span');
    line.className = 'vl-liq-operators-line';
    line.setAttribute('aria-hidden', 'true');
    block.prepend(line);
  }

  pushCleanup(
    cleanups,
    initDrawLine(line, ctx, { trigger: block, axis: 'x', duration: 0.82 }),
  );

  items.forEach((item, index) => {
    gsap.set(item, { opacity: 0, y: 10 });

    const st = ScrollTrigger.create({
      trigger: block,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.78,
          ease: 'power2.out',
          delay: 0.08 + index * 0.1,
        });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  });
}

function initLiquidityCta(section, ctx, cleanups) {
  const cta = section.querySelector('.fin-cta');
  if (!cta) return;

  gsap.set(cta, { opacity: 0, y: 12 });
  const st = ScrollTrigger.create({
    trigger: cta,
    start: triggerStart(ctx),
    once: true,
    onEnter: () => {
      gsap.to(cta, { opacity: 1, y: 0, duration: 0.88, ease: 'power2.out' });
    },
  });
  pushCleanup(cleanups, () => st.kill());

  const btn = cta.querySelector('.btn-primary');
  if (btn) pushCleanup(cleanups, bindGoldSweep(btn));
}

export function initLiquidityPage(root, ctx, cleanups = []) {
  const section = root.querySelector('[data-vl-gsap-root="liquidity"]');
  if (!section) return;

  if (ctx.reduced) {
    setInternalVisible(section);
    return;
  }

  initLiquidityBizGrid(section, ctx, cleanups);
  initLiquidityOperators(section, ctx, cleanups);
  initLiquidityCta(section, ctx, cleanups);
}
