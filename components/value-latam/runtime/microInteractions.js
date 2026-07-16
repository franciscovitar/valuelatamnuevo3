import { animate } from 'motion/react';
import { refreshScrollTriggers } from '@/lib/scroll';
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_GLOW,
  isMotionExcluded,
  prefersReducedMotion,
} from '@/lib/motion/tokens';

const DESKTOP_NAV = '(min-width: 981px)';

const BUTTON_SELECTOR = [
  'header.nav .btn',
  'main .btn',
  'footer .btn',
].join(', ');

const NAV_SELECTOR = [
  'header.nav .nav-links > a',
  'header.nav .nav-dropdown__trigger',
  'header.nav .nav-dropdown__menu a',
].join(', ');

const CARD_SELECTOR = [
  'main .sol-card',
  'main .person',
  'main .jcard',
  'main .gain',
  'main .biz',
  'main .ficha',
  'main .pillar',
  'main .pay-feat',
].join(', ');

function stopAnimation(control) {
  control?.stop?.();
  control?.cancel?.();
}

function bindPress(element, hoverState) {
  const onDown = () => {
    stopAnimation(hoverState.press);
    hoverState.press = animate(
      element,
      { scale: 0.975 },
      { duration: MOTION_DURATION.press, ease: MOTION_EASE.out },
    );
  };

  const onUp = () => {
    stopAnimation(hoverState.press);
    hoverState.press = animate(
      element,
      {
        scale: hoverState.hovered ? 1.012 : 1,
        y: hoverState.hovered ? -2 : 0,
      },
      { duration: MOTION_DURATION.press, ease: MOTION_EASE.out },
    );
  };

  element.addEventListener('pointerdown', onDown);
  element.addEventListener('pointerup', onUp);
  element.addEventListener('pointercancel', onUp);

  return () => {
    element.removeEventListener('pointerdown', onDown);
    element.removeEventListener('pointerup', onUp);
    element.removeEventListener('pointercancel', onUp);
    stopAnimation(hoverState.press);
  };
}

function enhanceButton(element) {
  if (isMotionExcluded(element)) return () => {};
  if (element.closest('[data-vl-home-section="referrals"]')) return () => {};
  if (element.closest('[data-vl-gsap-root="referrals"] .fin-cta .btn-primary')) return () => {};
  if (element.classList.contains('menu-btn') || element.classList.contains('nav-backdrop')) {
    return () => {};
  }

  element.classList.add('vl-micro', 'vl-micro-btn');

  const isPrimary = element.classList.contains('btn-primary');
  const isGhost = element.classList.contains('btn-ghost');
  const hoverState = { hovered: false, hover: null, press: null };
  const restShadow = getComputedStyle(element).boxShadow;
  const hoverShadow = isPrimary
    ? MOTION_GLOW.primaryHover
    : isGhost
      ? MOTION_GLOW.ghostHover
      : MOTION_GLOW.neutralHover;

  const onEnter = () => {
    hoverState.hovered = true;
    stopAnimation(hoverState.hover);
    hoverState.hover = animate(
      element,
      { y: -2, scale: 1.012, boxShadow: hoverShadow },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  const onLeave = () => {
    hoverState.hovered = false;
    stopAnimation(hoverState.hover);
    stopAnimation(hoverState.press);
    hoverState.hover = animate(
      element,
      { y: 0, scale: 1, boxShadow: restShadow },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  element.addEventListener('pointerenter', onEnter);
  element.addEventListener('pointerleave', onLeave);
  const cleanupPress = bindPress(element, hoverState);

  return () => {
    element.removeEventListener('pointerenter', onEnter);
    element.removeEventListener('pointerleave', onLeave);
    cleanupPress();
    stopAnimation(hoverState.hover);
    element.classList.remove('vl-micro', 'vl-micro-btn');
    element.style.removeProperty('transform');
    element.style.removeProperty('box-shadow');
  };
}

function ensureNavIndicator(element) {
  if (element.querySelector('.vl-nav-indicator')) return element.querySelector('.vl-nav-indicator');
  if (element.classList.contains('nav-dropdown__trigger')) return null;

  const indicator = document.createElement('span');
  indicator.className = 'vl-nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  element.classList.add('vl-micro-nav');
  element.appendChild(indicator);
  return indicator;
}

function enhanceNavLink(element) {
  if (isMotionExcluded(element)) return () => {};
  if (!window.matchMedia(DESKTOP_NAV).matches) return () => {};

  element.classList.add('vl-micro', 'vl-micro-nav');
  const indicator = ensureNavIndicator(element);
  const hoverState = { hover: null };

  const onEnter = () => {
    if (!indicator) return;
    stopAnimation(hoverState.hover);
    hoverState.hover = animate(
      indicator,
      { scaleX: 1, opacity: 1 },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  const onLeave = () => {
    if (!indicator || element.classList.contains('is-active')) return;
    stopAnimation(hoverState.hover);
    hoverState.hover = animate(
      indicator,
      { scaleX: 0, opacity: 0 },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  element.addEventListener('pointerenter', onEnter);
  element.addEventListener('pointerleave', onLeave);

  if (element.classList.contains('is-active') && indicator) {
    indicator.style.opacity = '1';
    indicator.style.transform = 'scaleX(1)';
  }

  return () => {
    element.removeEventListener('pointerenter', onEnter);
    element.removeEventListener('pointerleave', onLeave);
    stopAnimation(hoverState.hover);
    element.classList.remove('vl-micro', 'vl-micro-nav');
    indicator?.remove();
  };
}

function enhanceCard(element) {
  if (isMotionExcluded(element)) return () => {};
  if (element.closest('[data-vl-home-section="solutions"]')) return () => {};
  if (element.closest('[data-vl-home-section="team"]')) return () => {};
  if (element.closest('[data-vl-gsap-root="solutions"]')) return () => {};
  if (element.closest('[data-vl-gsap-root="team"]')) return () => {};
  if (element.closest('[data-vl-gsap-tilt]')) return () => {};
  if (element.closest('details:not([open])')) return () => {};

  element.classList.add('vl-micro', 'vl-micro-card');
  const restShadow = getComputedStyle(element).boxShadow;
  const hoverState = { hover: null };

  const onEnter = () => {
    stopAnimation(hoverState.hover);
    hoverState.hover = animate(
      element,
      { y: -3, boxShadow: MOTION_GLOW.cardHover },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  const onLeave = () => {
    stopAnimation(hoverState.hover);
    hoverState.hover = animate(
      element,
      { y: 0, boxShadow: restShadow },
      { duration: MOTION_DURATION.hover, ease: MOTION_EASE.out },
    );
  };

  element.addEventListener('pointerenter', onEnter);
  element.addEventListener('pointerleave', onLeave);

  return () => {
    element.removeEventListener('pointerenter', onEnter);
    element.removeEventListener('pointerleave', onLeave);
    stopAnimation(hoverState.hover);
    element.classList.remove('vl-micro', 'vl-micro-card');
    element.style.removeProperty('transform');
    element.style.removeProperty('box-shadow');
  };
}

function initNavDropdownMotion(desktopQuery) {
  const cleanups = [];

  document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
    const menu = dropdown.querySelector('.nav-dropdown__menu');
    if (!menu) return;

    let menuAnimation = null;

    const playMenuIn = () => {
      if (!desktopQuery.matches) return;

      stopAnimation(menuAnimation);
      menuAnimation = animate(
        menu,
        { y: [5, 0], opacity: [0.94, 1] },
        { duration: MOTION_DURATION.dropdown, ease: MOTION_EASE.out },
      );

      menu.querySelectorAll('a').forEach((link, index) => {
        animate(
          link,
          { opacity: [0.86, 1], x: [-3, 0] },
          {
            duration: MOTION_DURATION.fast,
            delay: index * 0.03,
            ease: MOTION_EASE.out,
          },
        );
      });
    };

    dropdown.addEventListener('mouseenter', playMenuIn);
    dropdown.addEventListener('focusin', playMenuIn);

    cleanups.push(() => {
      dropdown.removeEventListener('mouseenter', playMenuIn);
      dropdown.removeEventListener('focusin', playMenuIn);
      stopAnimation(menuAnimation);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

function initAccordionLayoutRefresh() {
  const onToggle = () => {
    requestAnimationFrame(() => {
      refreshScrollTriggers({ hard: false });
    });
  };

  const details = Array.from(document.querySelectorAll('main details, footer details'));
  details.forEach((detail) => detail.addEventListener('toggle', onToggle));

  return () => {
    details.forEach((detail) => detail.removeEventListener('toggle', onToggle));
  };
}

function collectElements(selector) {
  return Array.from(document.querySelectorAll(selector)).filter(
    (element) => !isMotionExcluded(element),
  );
}

export function initMicroInteractions() {
  const reduceMotion = prefersReducedMotion();
  const desktopQuery = window.matchMedia(DESKTOP_NAV);
  const cleanups = [];

  document.documentElement.classList.add('vl-motion-enabled');

  if (reduceMotion) {
    return () => {
      document.documentElement.classList.remove('vl-motion-enabled');
    };
  }

  collectElements(BUTTON_SELECTOR).forEach((element) => {
    cleanups.push(enhanceButton(element));
  });

  collectElements(NAV_SELECTOR).forEach((element) => {
    cleanups.push(enhanceNavLink(element));
  });

  collectElements(CARD_SELECTOR).forEach((element) => {
    cleanups.push(enhanceCard(element));
  });

  cleanups.push(initNavDropdownMotion(desktopQuery));
  cleanups.push(initAccordionLayoutRefresh());

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    document.documentElement.classList.remove('vl-motion-enabled');
  };
}
