import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';
import { smoothstep } from '@/components/value-latam/runtime/background-lines/backgroundLinesGeometry';
import { createBackgroundLinesScene } from '@/components/value-latam/runtime/background-lines/backgroundLinesScene';

const START_SELECTOR = '[data-vl-home-section="metrics"]';
const END_SELECTOR = '[data-vl-home-section="contact"]';

/**
 * Owns exactly one ScrollTrigger for the whole home run — start at Metrics,
 * end at Contact. All geometry/camera/render logic lives in the WebGL scene.
 */
export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');
  const layer = main?.querySelector('[data-vl-bg-lines-root]');
  const canvas = layer?.querySelector('[data-vl-bg-lines-canvas]');
  if (!main || !layer || !canvas) return;

  if (ctx?.reduced) {
    layer.classList.add('is-reduced');
    pushCleanup(cleanups, () => layer.classList.remove('is-reduced'));
    return;
  }

  const startEl = main.querySelector(START_SELECTOR);
  const endEl = main.querySelector(END_SELECTOR);
  if (!startEl || !endEl) return;

  const scene = createBackgroundLinesScene({ canvas, root: layer, reducedMotion: false });
  if (!scene) return;

  const trigger = ScrollTrigger.create({
    trigger: startEl,
    start: 'top bottom',
    endTrigger: endEl,
    end: 'bottom top',
    invalidateOnRefresh: true,
    onToggle: (self) => scene.setActive(self.isActive),
    onUpdate: (self) => {
      const progress = self.progress;
      scene.setTargetProgress(progress);

      const fadeIn = smoothstep(0, 0.08, progress);
      const fadeOut = 1 - smoothstep(0.88, 1, progress);
      scene.setVisibility(fadeIn * fadeOut);
    },
    onRefresh: () => scene.resize(),
  });

  scene.resize();
  scene.setActive(trigger.isActive);
  scene.setTargetProgress(trigger.progress);

  const onWindowResize = () => scene.resize();
  window.addEventListener('resize', onWindowResize);

  pushCleanup(cleanups, () => {
    window.removeEventListener('resize', onWindowResize);
    trigger.kill();
    scene.destroy();
  });
}
