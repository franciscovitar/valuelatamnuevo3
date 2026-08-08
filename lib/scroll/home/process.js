import { SECTION_MOTION } from '../../motion/tokens';
import { gsap } from '../gsap';
import {
  fitPinnedStoryStage,
  pinnedStoryConfig,
  pushCleanup,
  setVisible,
  triggerStart,
} from './utils';
import { initLineMaskReveal, initFadeReveal, initTextPaint } from '@/lib/motion/textEffects';
import {
  STORY_EASE,
  STORY_EASE_OUT,
  STORY_SCRUB,
  prepareStoryMotion,
  smoothStoryProps,
  storyActiveIndex,
  storyCrossfade,
  storyScrollDistance,
  storySegmentTimes,
} from './story';

const PROCESS_STEP_ACTIVE = {
  opacity: 1,
  y: 0,
  scale: 1,
  zIndex: 4,
};

const PROCESS_STEP_PAST = {
  opacity: 0.4,
  y: 8,
  scale: 0.97,
  zIndex: 1,
};

/*
 * Revelado acumulativo: el paso que todavia no le toca no esta atenuado, no
 * esta. Aparece con el scroll y a partir de ahi se queda.
 *
 * Con los futuros a 0.84-0.92 las tres tarjetas se leian desde el primer frame,
 * asi que el pin frenaba el scroll sin que pasara nada a cambio. La escala se
 * queda en 1: los tres pasos estan uno al lado del otro y encogerlos
 * desalineaba la fila respecto del activo.
 */
const PROCESS_STEP_NEXT = {
  opacity: 0,
  y: 14,
  scale: 1,
  zIndex: 2,
};

const PROCESS_STEP_FUTURE = {
  opacity: 0,
  y: 14,
  scale: 1,
  zIndex: 0,
};

const PROCESS_STEP_RESOLVED = {
  opacity: 1,
  y: 0,
  scale: 1,
  zIndex: 2,
};

const PROCESS_STEP_STATES = {
  active: PROCESS_STEP_ACTIVE,
  resolved: PROCESS_STEP_RESOLVED,
  past: PROCESS_STEP_RESOLVED,
  next: PROCESS_STEP_NEXT,
  future: PROCESS_STEP_FUTURE,
};

const PROCESS_INNER_STATES = {
  active: {
    number: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
  },
  resolved: {
    number: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
  },
  past: {
    number: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
  },
  /*
   * El contenedor del paso ya controla la aparicion. Si el contenido tambien
   * bajara su opacidad, las dos se multiplicarian y la tarjeta entraria con
   * el texto todavia a medio encender.
   */
  next: {
    number: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
  },
  future: {
    number: { opacity: 1, y: 0 },
    title: { opacity: 1, y: 0 },
    copy: { opacity: 1, y: 0 },
  },
};

function getStoryPosition(index, activeIndex) {
  if (index < activeIndex) return 'resolved';
  if (index === activeIndex) return 'active';
  if (index === activeIndex + 1) return 'next';
  return 'future';
}

function persistSeenProcessSteps(steps, maxSeenIndex, activeIndex) {
  const innerResolved = PROCESS_INNER_STATES.resolved;

  steps.forEach((step, stepIndex) => {
    if (stepIndex > maxSeenIndex || stepIndex === activeIndex) return;

    gsap.set(step, PROCESS_STEP_RESOLVED);
    const parts = processParts(step);
    if (parts.number) gsap.set(parts.number, innerResolved.number);
    if (parts.title) gsap.set(parts.title, innerResolved.title);
    if (parts.copy) gsap.set(parts.copy, innerResolved.copy);
  });
}

function processParts(step) {
  return {
    number: step.querySelector('.n'),
    title: step.querySelector('h4'),
    copy: step.querySelector('p'),
  };
}

function setProcessFocus(steps, activeIndex) {
  steps.forEach((step, stepIndex) => {
    const stateName = getStoryPosition(stepIndex, activeIndex);
    const stepState = PROCESS_STEP_STATES[stateName];
    const innerState = PROCESS_INNER_STATES[stateName];
    const parts = processParts(step);

    gsap.set(step, stepState);
    if (parts.number) gsap.set(parts.number, innerState.number);
    if (parts.title) gsap.set(parts.title, innerState.title);
    if (parts.copy) gsap.set(parts.copy, innerState.copy);
  });
}

function applyProcessFocus(tl, steps, activeIndex, position, duration) {
  steps.forEach((step, stepIndex) => {
    const stateName = getStoryPosition(stepIndex, activeIndex);
    const stepState = PROCESS_STEP_STATES[stateName];
    const innerState = PROCESS_INNER_STATES[stateName];
    const parts = processParts(step);

    tl.to(step, smoothStoryProps({ ...stepState, duration }), position);

    if (parts.number) {
      tl.to(parts.number, smoothStoryProps({ ...innerState.number, duration }), position);
    }
    if (parts.title) {
      tl.to(parts.title, smoothStoryProps({ ...innerState.title, duration }), position);
    }
    if (parts.copy) {
      tl.to(parts.copy, smoothStoryProps({ ...innerState.copy, duration }), position);
    }
  });
}

function applyProcessFocusResolved(tl, steps, position, duration) {
  const innerActive = PROCESS_INNER_STATES.active;

  steps.forEach((step) => {
    const parts = processParts(step);

    tl.to(step, smoothStoryProps({ ...PROCESS_STEP_RESOLVED, duration }), position);

    if (parts.number) {
      tl.to(parts.number, smoothStoryProps({ ...innerActive.number, duration }), position);
    }
    if (parts.title) {
      tl.to(parts.title, smoothStoryProps({ ...innerActive.title, duration }), position);
    }
    if (parts.copy) {
      tl.to(parts.copy, smoothStoryProps({ ...innerActive.copy, duration }), position);
    }
  });
}

/*
 * En mobile la seccion se lee como cualquier otra del documento: sin pin, sin
 * scrub y sin coreografia propia.
 *
 * Antes cada paso traia su propio revelado por lineas y su copy se escribia
 * progresivamente, de modo que avanzar por la seccion obligaba a atravesar una
 * animacion antes de poder leer. Queda solo lo que usa el resto del sitio: el
 * fade del eyebrow, el revelado del titulo de seccion y una entrada simple de
 * las tres tarjetas.
 */
function initProcessMobile(section, ctx, cleanups) {
  const secHead = section.querySelector('.sec-head');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const steps = gsap.utils.toArray(section.querySelectorAll('.step'));
  const stepsWrap = section.querySelector('.steps');

  pushCleanup(cleanups, initFadeReveal(eyebrow, ctx, { trigger: secHead || section, y: 8 }));
  pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: secHead || section }));

  gsap.from(steps, {
    opacity: 0,
    y: 17,
    stagger: 0.12,
    duration: SECTION_MOTION.duration,
    delay: 0.04,
    ease: SECTION_MOTION.ease,
    scrollTrigger: {
      trigger: stepsWrap || section,
      start: triggerStart(ctx),
      once: true,
    },
  });
}

function initProcessDesktop(section, ctx, cleanups) {
  const pin = section.querySelector('.process-pin');
  const stage = section.querySelector('.process-pin .wrap');
  const steps = gsap.utils.toArray(section.querySelectorAll('.step'));
  const closerEl = section.querySelector('.closer');
  const closerText = section.querySelector('.closer p') || closerEl;
  const progress = section.querySelector('.process-story-progress__fill');
  const eyebrow = section.querySelector('.sec-head > .eyebrow');
  const title = section.querySelector('.sec-head h2');
  const connectors = gsap.utils.toArray(section.querySelectorAll('.step-connector'));

  if (!pin || !stage || !steps.length) {
    initProcessMobile(section, ctx, cleanups);
    return;
  }

  const { intro, body, segment, total } = storySegmentTimes(steps.length);
  const crossfade = storyCrossfade(segment);
  const resolveDuration = Math.min(crossfade * 1.4, segment * 0.85);
  const resolveStart = intro + body - resolveDuration;
  const closerStart = intro + body + 0.04;
  const fitStage = fitPinnedStoryStage(stage, cleanups);

  prepareStoryMotion([
    ...steps,
    eyebrow,
    progress,
    closerEl,
    ...connectors,
    ...steps.flatMap((step) => Object.values(processParts(step)).filter(Boolean)),
  ].filter(Boolean));

  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 8 });
  pushCleanup(cleanups, initLineMaskReveal(title, ctx, { trigger: section.querySelector('.sec-head') || section }));
  setProcessFocus(steps, 0);
  gsap.set(connectors, { opacity: 0, scaleX: 0, scaleY: 0 });
  section.querySelectorAll('.step-connector--horizontal').forEach((el) => {
    gsap.set(el, { transformOrigin: 'left center' });
  });
  section.querySelectorAll('.step-connector--vertical').forEach((el) => {
    gsap.set(el, { transformOrigin: 'top center' });
  });
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  if (closerText) {
    pushCleanup(
      cleanups,
      initTextPaint(closerText, ctx, {
        trigger: closerText.closest('.closer') || closerText,
        goldPhrases: ['toda tu operación'],
      }),
    );
  }

  const pinConfig = pinnedStoryConfig(section, pin, {
    end: storyScrollDistance(steps.length, { closer: Boolean(closerEl) }),
    scrub: STORY_SCRUB,
    onRefresh: fitStage,
  });

  let maxSeenIndex = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      ...pinConfig,
      onUpdate(self) {
        const activeIndex = storyActiveIndex(self.progress, steps.length);
        maxSeenIndex = Math.max(maxSeenIndex, activeIndex);
        persistSeenProcessSteps(steps, maxSeenIndex, activeIndex);
      },
    },
  });

  if (eyebrow) {
    tl.to(eyebrow, smoothStoryProps({ opacity: 1, y: 0, duration: intro, ease: STORY_EASE_OUT }), 0);
  }

  if (progress) {
    tl.to(progress, { scaleX: 1, ease: 'none', duration: body, overwrite: 'auto' }, intro);
  }

  for (let index = 1; index < steps.length; index += 1) {
    const at = intro + index * segment;
    const fadeStart = at - crossfade;
    const connector = steps[index].querySelector('.step-connector--vertical')
      || steps[index].querySelector('.step-connector--horizontal');

    applyProcessFocus(tl, steps, index, fadeStart, crossfade);

    if (connector) {
      tl.fromTo(connector, {
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
      }, smoothStoryProps({
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        duration: crossfade,
        ease: STORY_EASE,
      }), fadeStart + crossfade * 0.12);
    }
  }

  if (steps.length > 1) {
    applyProcessFocusResolved(tl, steps, resolveStart, resolveDuration);
  }

  tl.to({}, { duration: closerStart + 0.28 - total }, total);

  fitStage();
}

/**
 * La historia pinneada da foco a un paso por vez y asume que los pasos estan
 * en UNA fila: es lo que hace legible que el activo destaque sobre los otros.
 *
 * `.steps` pasa a dos columnas bajo 980px, pero el motion avanzado arranca en
 * 761px, asi que entre medio la secuencia corria sobre una grilla de 2 + 1
 * huerfano y el foco saltaba de renglon. En vez de repetir el breakpoint aca
 * —y que se despareje la proxima vez que cambie el CSS— se mira el layout ya
 * resuelto: si los pasos no comparten renglon, va la version simple.
 */
function stepsShareOneRow(section) {
  const steps = [...section.querySelectorAll('.step')];

  if (steps.length < 2) return true;

  const firstTop = steps[0].offsetTop;

  return steps.every((step) => Math.abs(step.offsetTop - firstTop) < 2);
}

export function initProcessSection(root, ctx, cleanups) {
  const section = root.querySelector('[data-vl-gsap-root="process"]');
  if (!section) return;

  if (ctx.reduced) {
    setVisible(section.querySelectorAll('*'));
    return;
  }

  if (ctx.advanced && stepsShareOneRow(section)) {
    initProcessDesktop(section, ctx, cleanups);
    return;
  }

  initProcessMobile(section, ctx, cleanups);
}
