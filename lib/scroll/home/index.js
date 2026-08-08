import { gsap, ScrollTrigger } from '../gsap';
import { refreshScrollTriggers } from '../routeScroll';
import { initContactSection } from './contact';
import { initBackgroundLines } from './backgroundLines';
import { initFooterSection } from './footer';
import { initMetricsSection } from './metrics';
import { initPartnersSection } from './partners';
import { initProcessSection } from './process';
import { initReferralsSection } from './referrals';
import { initRegulationSection } from './regulation';
import { initSolutionsSection } from './solutions';
import { initTeamSection } from './team';
import { initWhyUsSection } from './whyUs';
import { initHomeTextReveals } from '@/lib/motion/textReveal';
import {
  createHomeScrollContext,
  pushCleanup,
  setAllHomeVisible,
} from './utils';

export function initHomeScrollExperience(root) {
  if (!root) return () => {};

  const ctx = createHomeScrollContext();
  const cleanups = [];

  if (ctx.reduced) {
    setAllHomeVisible(root);
    return () => {
      cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch {
          /* noop */
        }
      });
    };
  }

  const run = () => {
    initMetricsSection(root, ctx, cleanups);
    initPartnersSection(root, ctx, cleanups);
    initSolutionsSection(root, ctx, cleanups);
    initProcessSection(root, ctx, cleanups);
    initWhyUsSection(root, ctx, cleanups);
    initRegulationSection(root, ctx, cleanups);
    initTeamSection(root, ctx, cleanups);
    initReferralsSection(root, ctx, cleanups);
    initContactSection(root, ctx, cleanups);
    initFooterSection(ctx, cleanups);
    initBackgroundLines(ctx, cleanups, root);
    initHomeTextReveals(root, ctx, cleanups);
    refreshScrollTriggers({ hard: true });
  };

  run();

  /*
   * En mobile la barra de direcciones se contrae y se expande mientras se
   * scrollea, y cada cambio dispara un `resize` de solo alto. Refrescar ahi
   * recalcula start/end de todos los triggers y reposiciona el pin del hero en
   * pleno gesto: el viewport se va hacia atras y se siente como un temblor.
   *
   * `ScrollTrigger.config({ ignoreMobileResize: true })` no cubre este caso,
   * porque solo desactiva el refresh AUTOMATICO del plugin — esta llamada es
   * explicita y se ejecuta igual.
   *
   * Solo se ignora cuando el ancho no cambio y el alto se movio menos que la
   * barra: rotacion, teclado y cambios de layout siguen refrescando.
   */
  const ADDRESS_BAR_MAX = 160;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const onlyHeight = width === lastWidth
      && Math.abs(height - lastHeight) <= ADDRESS_BAR_MAX;

    lastWidth = width;
    lastHeight = height;

    if (onlyHeight) return;

    ScrollTrigger.refresh();
  };

  window.addEventListener('resize', onResize);
  pushCleanup(cleanups, () => window.removeEventListener('resize', onResize));

  return () => {
    cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch {
        /* noop */
      }
    });
  };
}
