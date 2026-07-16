import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { bindGoldSweep } from '@/lib/motion/uiEffects';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const SCRUB = 0.55;
const SCROLL_VH = { desktop: 200, tablet: 185, mobile: 150 };

function setScrollHeight(scrollEl, vh) {
  scrollEl.style.height = `${vh}vh`;
}

function collectTargets(root) {
  return {
    root,
    scrollEl: root.querySelector('[data-image-hero-scroll]'),
    stageEl: root.querySelector('[data-image-hero-stage]'),
    media: root.querySelector('[data-image-hero-media]'),
    ambient: root.querySelector('[data-image-hero-ambient]'),
    intro: root.querySelector('[data-image-hero-intro]'),
    eyebrow: root.querySelector('[data-image-hero-eyebrow]'),
    title: root.querySelector('[data-image-hero-title]'),
    lead: root.querySelector('[data-image-hero-lead]'),
    cta: root.querySelector('[data-image-hero-cta]'),
    identity: root.querySelector('[data-image-hero-identity]'),
    logo: root.querySelector('[data-image-hero-identity-logo]'),
    closer: root.querySelector('[data-image-hero-identity-closer]'),
    transition: root.querySelector('[data-image-hero-transition]'),
  };
}

function buildTimeline(targets) {
  const { eyebrow, title, lead, cta, identity, logo, closer, transition } = targets;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Scene 1 — intro (0 → ~0.52)
  tl.to(cta, { opacity: 0, y: 10, duration: 0.08 }, 0.30);
  tl.to(lead, { opacity: 0, duration: 0.08 }, 0.34);
  tl.to(eyebrow, { opacity: 0, duration: 0.06 }, 0.38);
  tl.to(title, { y: -24, opacity: 0, duration: 0.12, ease: 'power2.inOut' }, 0.40);

  // Scene 2 — identity (0.48 → ~0.88)
  tl.to(identity, { autoAlpha: 1, duration: 0.06 }, 0.48);
  tl.fromTo(
    logo,
    { autoAlpha: 0, y: 16, scale: 0.97 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.10, ease: 'power2.out' },
    0.52,
  );
  tl.fromTo(
    closer,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' },
    0.62,
  );

  // Final transition (0.84 → 1.00)
  tl.to(transition, { opacity: 1, duration: 0.10, ease: 'power1.in' }, 0.84);
  tl.to(logo, { opacity: 0.68, duration: 0.08, ease: 'power1.in' }, 0.86);
  tl.to(closer, { autoAlpha: 0, duration: 0.06, ease: 'power1.in' }, 0.88);

  return tl;
}

function initReduced(root, targets) {
  const { scrollEl, stageEl, identity, transition } = targets;

  scrollEl.style.height = 'auto';
  stageEl.style.minHeight = '100svh';
  gsap.set([identity, transition], { autoAlpha: 0, opacity: 0 });
  root.classList.add('is-image-hero-mounted', 'is-image-hero-reduced');

  return () => {
    scrollEl.style.height = '';
    stageEl.style.minHeight = '';
    root.classList.remove('is-image-hero-mounted', 'is-image-hero-reduced', 'is-image-hero-active');
  };
}

export function initImageHeroAnimation() {
  const root = document.querySelector('[data-vl-image-hero-root]');
  if (!root) return () => {};

  const targets = collectTargets(root);
  const { scrollEl, stageEl, media, ambient, cta } = targets;

  if (!scrollEl || !stageEl || !media) return () => {};

  if (prefersReducedMotion()) {
    return initReduced(root, targets);
  }

  let disposed = false;
  let ctx = null;
  let mm = null;
  let mainTrigger = null;
  let uiTimeline = null;
  let goldSweepCleanup = () => {};

  const boot = () => {
    if (disposed) return;

    gsap.set(media, {
      scale: 1.04,
      xPercent: 0,
      yPercent: 0,
      transformOrigin: 'center center',
      force3D: true,
    });

    gsap.set(ambient, { opacity: 0.22, xPercent: 8, yPercent: -4 });
    gsap.set(targets.identity, { autoAlpha: 0 });
    gsap.set(targets.transition, { opacity: 0 });

    if (cta) goldSweepCleanup = bindGoldSweep(cta);

    mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        mobile: '(max-width: 767px)',
      },
      (context) => {
        const { desktop, tablet } = context.conditions;
        const scrollVh = desktop ? SCROLL_VH.desktop : tablet ? SCROLL_VH.tablet : SCROLL_VH.mobile;

        setScrollHeight(scrollEl, scrollVh);

        ctx = gsap.context(() => {
          uiTimeline = buildTimeline(targets);

          const cameraTl = gsap.timeline();
          cameraTl.to(
            media,
            {
              scale: 1.12,
              xPercent: -1.5,
              yPercent: -2,
              ease: 'none',
              duration: 1,
            },
            0,
          );
          cameraTl.to(
            ambient,
            {
              opacity: 0.34,
              xPercent: -2,
              yPercent: 1,
              ease: 'none',
              duration: 1,
            },
            0,
          );

          const master = gsap.timeline();
          master.add(cameraTl, 0);
          master.add(uiTimeline, 0);

          mainTrigger = ScrollTrigger.create({
            animation: master,
            trigger: scrollEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: SCRUB,
            pin: stageEl,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });

          root.classList.add('is-image-hero-active');
        }, root);

        root.classList.add('is-image-hero-mounted');
        ScrollTrigger.refresh();

        return () => {
          mainTrigger?.kill();
          mainTrigger = null;
          uiTimeline = null;
          root.classList.remove('is-image-hero-active');
        };
      },
    );
  };

  if (media.complete) {
    boot();
  } else {
    media.addEventListener('load', boot, { once: true });
    media.addEventListener('error', boot, { once: true });
  }

  return () => {
    disposed = true;
    goldSweepCleanup();

    media?.removeEventListener('load', boot);
    media?.removeEventListener('error', boot);

    mainTrigger?.kill();
    mainTrigger = null;
    uiTimeline = null;

    ctx?.revert();
    ctx = null;
    mm?.revert();
    mm = null;

    scrollEl.style.height = '';
    stageEl.style.removeProperty('min-height');
    media?.style.removeProperty('transform');
    ambient?.style.removeProperty('transform');
    ambient?.style.removeProperty('opacity');

    root.classList.remove('is-image-hero-mounted', 'is-image-hero-active', 'is-image-hero-reduced');
  };
}
