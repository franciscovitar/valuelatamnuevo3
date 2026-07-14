import { gsap, ScrollTrigger } from '../gsap';
import { refreshScrollTriggers } from '../routeScroll';
import { initContactSection } from './contact';
import { initFooterSection } from './footer';
import { initMetricsSection } from './metrics';
import { initPartnersSection } from './partners';
import { initProcessSection } from './process';
import { initReferralsSection } from './referrals';
import { initRegulationSection } from './regulation';
import { initSolutionsSection } from './solutions';
import { initTeamSection } from './team';
import { initWhyUsSection } from './whyUs';
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
    return () => {};
  }

  const run = () => {
    initMetricsSection(root, ctx, cleanups);
    initPartnersSection(root, ctx);
    initSolutionsSection(root, ctx, cleanups);
    initProcessSection(root, ctx, cleanups);
    initWhyUsSection(root, ctx, cleanups);
    initRegulationSection(root, ctx, cleanups);
    initTeamSection(root, ctx, cleanups);
    initReferralsSection(root, ctx, cleanups);
    initContactSection(root, ctx, cleanups);
    initFooterSection(ctx, cleanups);
    refreshScrollTriggers({ hard: true });
  };

  run();

  const onResize = () => ScrollTrigger.refresh();
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

export { scrollPalette } from './palette';
