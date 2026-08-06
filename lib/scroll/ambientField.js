import { prefersReducedMotion } from '@/lib/motion/tokens';
import { subscribeReducedMotion } from './config';
import { getActiveLenis } from './routeScroll';

const FIELD_CLASS = 'vl-ambient-field';
const LAYER_INNER_CLASS = 'vl-ambient-field__layer-inner';

/** @type {(() => void) | null} */
let cleanup = null;

const LAYERS = [
  {
    depth: 'far',
    depthX: 0.004,
    depthY: 0.018,
    particles: [
      { x: 16, y: 11, size: 14, alpha: 0.055 },
      { x: 71, y: 17, size: 12, alpha: 0.048, mobileHide: true },
      { x: 41, y: 76, size: 16, alpha: 0.04 },
      { x: 90, y: 58, size: 11, alpha: 0.045, mobileHide: true },
    ],
  },
  {
    depth: 'mid',
    depthX: -0.012,
    depthY: 0.055,
    particles: [
      { x: 8, y: 26, size: 5, alpha: 0.135 },
      { x: 31, y: 7, size: 4, alpha: 0.12 },
      { x: 76, y: 40, size: 6, alpha: 0.14, mobileHide: true },
      { x: 19, y: 70, size: 5, alpha: 0.125 },
      { x: 54, y: 86, size: 4, alpha: 0.115, mobileHide: true },
    ],
  },
  {
    depth: 'near',
    depthX: 0.016,
    depthY: 0.095,
    particles: [
      { x: 13, y: 46, size: 7, alpha: 0.175 },
      { x: 47, y: 12, size: 6, alpha: 0.155 },
      { x: 81, y: 25, size: 8, alpha: 0.168, mobileHide: true },
      { x: 66, y: 71, size: 7, alpha: 0.148, mobileHide: true },
    ],
  },
];

function getScrollY() {
  const lenis = getActiveLenis();
  if (lenis) return lenis.scroll;
  return window.scrollY ?? window.pageYOffset ?? 0;
}

function createParticle(particle) {
  const node = document.createElement('span');
  node.className = 'vl-ambient-field__particle';
  node.style.setProperty('--x', `${particle.x}%`);
  node.style.setProperty('--y', `${particle.y}%`);
  node.style.setProperty('--size', `${particle.size}px`);
  node.style.setProperty('--alpha', String(particle.alpha));

  if (particle.mobileHide) {
    node.setAttribute('data-mobile-hide', 'true');
  }

  return node;
}

function buildField() {
  const field = document.createElement('div');
  field.className = FIELD_CLASS;
  field.setAttribute('aria-hidden', 'true');

  LAYERS.forEach((layer) => {
    const layerNode = document.createElement('div');
    layerNode.className = `vl-ambient-field__layer vl-ambient-field__layer--${layer.depth}`;
    layerNode.dataset.depthX = String(layer.depthX);
    layerNode.dataset.depthY = String(layer.depthY);

    const inner = document.createElement('div');
    inner.className = LAYER_INNER_CLASS;

    layer.particles.forEach((particle) => {
      inner.appendChild(createParticle(particle));
    });

    layerNode.appendChild(inner);
    field.appendChild(layerNode);
  });

  return field;
}

export function initAmbientField() {
  if (typeof window === 'undefined' || cleanup) {
    return cleanup ?? (() => {});
  }

  const existing = document.querySelector(`.${FIELD_CLASS}`);
  existing?.remove();

  const field = buildField();
  document.body.prepend(field);

  const layers = Array.from(field.querySelectorAll('.vl-ambient-field__layer'));
  let reduced = prefersReducedMotion();
  let frame = 0;

  const applyParallax = () => {
    frame = 0;
    const scrollY = getScrollY();

    layers.forEach((layer) => {
      if (reduced) {
        layer.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      const depthX = Number(layer.dataset.depthX ?? 0);
      const depthY = Number(layer.dataset.depthY ?? 0);

      layer.style.transform = `translate3d(${scrollY * depthX}px, ${scrollY * depthY}px, 0)`;
    });
  };

  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(applyParallax);
  };

  const syncMotionPreference = () => {
    reduced = prefersReducedMotion();
    field.classList.toggle('is-reduced-motion', reduced);
    applyParallax();
  };

  syncMotionPreference();
  window.addEventListener('scroll', onScroll, { passive: true });
  const unsubscribeReducedMotion = subscribeReducedMotion(syncMotionPreference);

  cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    unsubscribeReducedMotion();

    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    field.remove();
    cleanup = null;
  };

  return cleanup;
}
