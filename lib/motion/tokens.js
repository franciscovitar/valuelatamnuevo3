/*
 * La copia local de la paleta que vivia aca se elimino: no tenia ningun
 * consumidor y sus nombres venian de una identidad azul anterior
 * (`iceBlue` valia #CCB487, un dorado). El color para JS sale ahora de
 * lib/scroll/home/palette.js, que lee app/styles/1-settings/_palette.scss.
 */

/*
 * Canonical motion language used by the home and every internal route.
 * Scroll narrative is the only motion allowed to use scrub.
 *
 * Amplitudes are deliberately generous: a reveal under ~20px reads as a
 * flicker, not as an event. Depth comes from `filter: blur()` resolving to
 * zero, which behaves like a focus pull — the single cue that separates an
 * editorial reveal from a plain fade.
 */
export const MOTION_SYSTEM = {
  reveal: 0.86,
  title: 1.02,
  card: 0.9,
  intro: 0.92,
  hover: 0.22,
  press: 0.14,
  scrub: 0.52,
  stagger: 0.085,
  wordStagger: 0.1,
  distance: 32,
  minorDistance: 18,
  blur: 9,
  easeOut: 'power3.out',
  easeLead: 'expo.out',
  easeInOut: 'power2.inOut',
};

/*
 * Calibracion previa a la recalibracion premium, todavia vigente en los
 * modulos de lib/scroll que animan seccion por seccion.
 *
 * Estos valores estaban repetidos a mano: 0.68 aparecia 54 veces y
 * 'power2.out' 44. Se centralizan aca SIN cambiarlos, porque tocarlos
 * alteraria las animaciones.
 *
 * Conviven dos calibraciones: MOTION_SYSTEM (0.86 / power3.out) para lo que ya
 * lee tokens, y estas para el resto. Unificarlas es un cambio deliberado de
 * diseno, no una refactorizacion, y requiere revisar el movimiento en un
 * navegador real.
 */
export const SECTION_MOTION = {
  duration: 0.68,
  ease: 'power2.out',
};

/*
 * Three volumes of motion. Premium pacing comes from the contrast between
 * them: one `lead` element per section, everything else `base` or `quiet`.
 * Using `lead` everywhere flattens the hierarchy back to noise.
 */
export const MOTION_TIER = {
  lead: {
    distance: 46,
    blur: 14,
    duration: 1.1,
    stagger: 0.1,
    ease: MOTION_SYSTEM.easeLead,
  },
  base: {
    distance: 32,
    blur: 9,
    duration: 0.86,
    stagger: 0.085,
    ease: MOTION_SYSTEM.easeOut,
  },
  quiet: {
    distance: 16,
    blur: 0,
    duration: 0.62,
    stagger: 0.06,
    ease: 'power2.out',
  },
};

/* Mobile pays the compositing cost of blur on weaker GPUs — scale it back. */
const MOBILE_TIER_SCALE = {
  distance: 0.6,
  blur: 0.55,
  duration: 0.9,
};

/**
 * Resolve a named tier into concrete values, damped on mobile.
 * @param {'lead'|'base'|'quiet'} name
 * @param {{ mobile?: boolean }} [ctx]
 */
export function motionTier(name = 'base', ctx = {}) {
  const tier = MOTION_TIER[name] ?? MOTION_TIER.base;

  if (!ctx.mobile) return { ...tier };

  return {
    ...tier,
    distance: Math.round(tier.distance * MOBILE_TIER_SCALE.distance),
    blur: Math.round(tier.blur * MOBILE_TIER_SCALE.blur),
    duration: tier.duration * MOBILE_TIER_SCALE.duration,
  };
}

/**
 * `from` vars for a blur-assisted reveal. Pair with BLUR_CLEAR_PROPS so the
 * filter is dropped once the tween lands — a lingering blur filter keeps the
 * layer on the compositor for the rest of the session.
 */
export function revealFrom(name = 'base', ctx = {}, overrides = {}) {
  const tier = motionTier(name, ctx);
  const { axis = 'y', blur = tier.blur, distance = tier.distance } = overrides;

  const vars = { opacity: 0 };

  if (axis === 'y') vars.y = distance;
  if (axis === 'x') vars.x = distance;

  if (blur > 0) vars.filter = `blur(${blur}px)`;

  return vars;
}

export const BLUR_CLEAR_PROPS = 'transform,opacity,filter';

/* [0.16, 1, 0.3, 1] is the expo-out curve: fast commit, long settle. */
export const MOTION_EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
};

export const MOTION_DURATION = {
  fast: MOTION_SYSTEM.hover,
  hover: MOTION_SYSTEM.hover,
  press: MOTION_SYSTEM.press,
  inner: MOTION_SYSTEM.reveal,
  reveal: MOTION_SYSTEM.reveal,
  title: MOTION_SYSTEM.title,
  card: MOTION_SYSTEM.card,
  base: MOTION_SYSTEM.reveal,
  slow: MOTION_SYSTEM.title,
  dropdown: MOTION_SYSTEM.hover,
};

export const MOTION_DELAY = {
  sm: 0.04,
  md: 0.07,
  lg: 0.1,
};

export const MOTION_STAGGER = {
  sm: 0.05,
  md: MOTION_SYSTEM.stagger,
  lg: 0.09,
};

export const MOTION_GROUP_DELAY = {
  sm: 0.05,
  md: 0.08,
  lg: 0.11,
};

export const MOTION_DISTANCE = {
  sm: MOTION_TIER.quiet.distance,
  md: 24,
  lg: MOTION_SYSTEM.distance,
};

export const MOTION_BLUR = {
  sm: 0,
  md: MOTION_TIER.base.blur,
  lg: MOTION_TIER.lead.blur,
};

export const VIEWPORT_OPTIONS = {
  once: true,
  margin: '0px 0px -8% 0px',
  amount: 0.28,
};

export const VIEWPORT_OPTIONS_MOBILE = {
  once: true,
  margin: '0px 0px -6% 0px',
  amount: 0.18,
};

export const MOBILE_VIEWPORT_QUERY = '(max-width: 760px)';

/*
 * DEUDA REGISTRADA (pasada de seguridad): `primaryHover` es un dorado calido
 * hardcodeado (rgba(191, 160, 90)) que no deriva de la paleta y no coincide
 * con ningun rol de app/styles/1-settings/_palette.scss — residuo de la
 * identidad previa a la conversion a paleta monocroma.
 *
 * No se corrige en esta pasada: `primaryHover` es el hover de TODO boton
 * `.btn-primary` del sitio (via components/value-latam/runtime/
 * microInteractions.js), un estado que la paridad exige preservar
 * exactamente. Derivarlo de --p-accent cambiaria ese hover en cada CTA del
 * sitio de un brillo dorado a uno casi blanco — un cambio de diseño real, no
 * una correccion de bug, y requiere decision explicita + verificacion visual
 * de hover en un navegador real (el entorno de este agente no puede probar
 * estados de hover de forma fiable).
 *
 * ghostHover/neutralHover (gris, ~196,194,190) y cardHover (casi negro,
 * ~1,4,10) ya estan razonablemente cerca de --p-slate-rgb (201 201 199) y
 * --p-ink-rgb (5 5 5) respectivamente; se dejan igual por la misma razon.
 */
export const MOTION_GLOW = {
  primaryHover:
    '0 10px 26px -16px rgba(191, 160, 90, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
  ghostHover:
    '0 9px 22px -17px rgba(196, 194, 190, 0.2)',
  neutralHover:
    '0 8px 20px -16px rgba(196, 194, 190, 0.18)',
  cardHover:
    '0 18px 44px -30px rgba(1, 4, 10, 0.62)',
};

/*
 * Selectores de raiz cuyos descendientes no deben recibir micro-interacciones
 * genericas (hover glow, tilt). Vivia con seis entradas heredadas de
 * CoverStory (`.cover*`) e Intro (`.hero-title`), los dos heroes legacy
 * eliminados en la pasada de seguridad; ninguna coincidia ya con nada del
 * arbol activo. Se deja vacio, no se borra el mecanismo: microInteractions.js
 * lo sigue llamando y puede volver a necesitar exclusiones con un futuro
 * hero.
 */
const EXCLUDED_ANCESTORS = [];

export function isMotionExcluded(element) {
  if (!element) return true;
  return EXCLUDED_ANCESTORS.some(
    (selector) => element.closest(selector)
  );
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
}

export function getProcessCloserDelay(stepCount) {
  return (
    MOTION_GROUP_DELAY.md
    + Math.max(0, stepCount - 1) * MOTION_STAGGER.md
    + MOTION_DELAY.sm
  );
}
