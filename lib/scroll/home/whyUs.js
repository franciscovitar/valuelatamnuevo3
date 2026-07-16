import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { scrollPalette } from './palette';
import {
  initTextPaint,
  initFadeReveal,
  initLineMaskReveal,
  initProgressiveWrite,
  restoreTextSplit,
} from '@/lib/motion/textEffects';
import { initClipReveal } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

export function initWhyUsSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="why-us"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    section.querySelectorAll('.vl-text-paint, .vl-line-mask, .vl-progressive-write').forEach(restoreTextSplit);
    return;
  }

  const edgeGrid = section.querySelector('.edge-grid');
  const content = section.querySelector('.edge-grid > div:first-child');
  const eyebrow = content?.querySelector('.eyebrow');
  const title = content?.querySelector('h2');
  const lead = content?.querySelector('.lead, p');
  const quote = section.querySelector('.pullquote');
  const quoteText = quote?.querySelector('.q');
  const bulletsWrap = section.querySelector('.edge ul');
  const bullets = gsap.utils.toArray(section.querySelectorAll('.edge li'));
  const signature = quote?.querySelector('.q cite, .q + *, .pullquote cite');

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: content || section, y: 8 }));
  pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: content || section }));
  if (lead) {
    pushCleanup(cleanups, initProgressiveWrite(lead, ctx, { trigger: content || section, mode: 'phrases' }));
  }

  bullets.forEach((bullet, index) => {
    bullet.querySelector('.vl-bullet-line')?.remove();
    gsap.set(bullet, { opacity: 0, x: -6 });

    const st = ScrollTrigger.create({
      trigger: bullet,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(bullet, {
          opacity: 1,
          x: 0,
          duration: 0.72,
          ease: 'power2.out',
          delay: index * 0.06,
        });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  });

  if (quote) {
    pushCleanup(
      cleanups,
      initClipReveal(quote, ctx, {
        direction: ctx.mobile ? 'bottom' : 'right',
        trigger: quote,
      }),
    );

    if (quoteText) {
      pushCleanup(
        cleanups,
        initTextPaint(quoteText, ctx, {
          trigger: quote,
          goldPhrases: ['financieros'],
        }),
      );
    }

    if (signature) {
      gsap.set(signature, { opacity: 0, y: 8 });
      const st = ScrollTrigger.create({
        trigger: quote,
        start: 'top 58%',
        once: true,
        onEnter: () => {
          gsap.to(signature, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out', delay: 0.12 });
        },
      });
      pushCleanup(cleanups, () => st.kill());
    }

    gsap.to(quote, {
      boxShadow: `0 24px 70px -42px rgba(0, 0, 0, 0.65), 0 0 28px ${scrollPalette.glowGoldSoft}`,
      scrollTrigger: {
        trigger: quote,
        start: 'top 68%',
        end: 'center center',
        scrub: 0.85,
      },
    });
  }
}
