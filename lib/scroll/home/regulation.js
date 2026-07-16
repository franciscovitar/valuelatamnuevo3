import { gsap, ScrollTrigger } from '../gsap';
import { scrollPalette } from './palette';
import { initFadeReveal, initCharReveal } from '@/lib/motion/textEffects';
import { initClipReveal, initDrawLine } from '@/lib/motion/uiEffects';
import { pushCleanup, setVisible, triggerStart } from './utils';

export function initRegulationSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="regulation"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  const textWrap = section.querySelector('.reg-inner > div:first-child');
  const textBlocks = gsap.utils.toArray(textWrap?.querySelectorAll(':scope > *') || []);
  const eyebrow = textWrap?.querySelector('.eyebrow');
  const panel = section.querySelector('.reg-seal-panel');
  const panelTitle = panel?.querySelector('.reg-seal-kicker, h3, h4');
  const separator = panel?.querySelector('.reg-seal-divider, hr, .reg-sep');
  const seals = gsap.utils.toArray(section.querySelectorAll('.seal'));

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: textWrap || section, y: 8 }));

  gsap.set(textBlocks.filter((el) => !el.matches('.eyebrow')), { opacity: 0, y: 10 });
  const textSt = ScrollTrigger.create({
    trigger: textWrap || section,
    start: triggerStart(ctx),
    once: true,
    onEnter: () => {
      gsap.to(textBlocks.filter((el) => !el.matches('.eyebrow')), {
        opacity: 1,
        y: 0,
        duration: 0.88,
        stagger: 0.12,
        ease: 'power2.out',
      });
    },
  });
  pushCleanup(cleanups, () => textSt.kill());

  if (panel) {
    pushCleanup(
      cleanups,
      initClipReveal(panel, ctx, {
        direction: ctx.mobile ? 'bottom' : 'right',
        trigger: panel,
      }),
    );
  }

  if (panelTitle) {
    pushCleanup(cleanups, initCharReveal(panelTitle, ctx, { maxChars: 24, trigger: panel || section }));
  }

  if (separator) {
    gsap.set(separator, { scaleX: 0, transformOrigin: 'left center' });
    const st = ScrollTrigger.create({
      trigger: panel || section,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(separator, { scaleX: 1, duration: 0.72, ease: 'power2.out', delay: 0.08 });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  } else if (panel) {
    let line = panel.querySelector('.vl-reg-sep');
    if (!line) {
      line = document.createElement('span');
      line.className = 'vl-reg-sep';
      line.setAttribute('aria-hidden', 'true');
      line.style.cssText = 'display:block;height:1px;width:100%;margin:12px 0;background:rgba(246,243,236,0.14);transform-origin:left center;transform:scaleX(0);';
      panel.insertBefore(line, panel.querySelector('.seals') || null);
    }
    pushCleanup(cleanups, initDrawLine(line, ctx, { trigger: panel, axis: 'x' }));
  }

  seals.forEach((seal, index) => {
    gsap.set(seal, { opacity: 0, y: 6 });
    const st = ScrollTrigger.create({
      trigger: panel || section,
      start: triggerStart(ctx),
      once: true,
      onEnter: () => {
        gsap.to(seal, {
          opacity: 1,
          y: 0,
          duration: 0.82,
          delay: 0.1 + index * 0.12,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(seal, {
              boxShadow: `0 0 18px ${scrollPalette.glowIceSoft}`,
              duration: 0.55,
              yoyo: true,
              repeat: 1,
            });
          },
        });
      },
    });
    pushCleanup(cleanups, () => st.kill());
  });
}
