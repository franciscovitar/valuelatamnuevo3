import {
  MOTION_DELAY,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_GROUP_DELAY,
  MOTION_STAGGER,
  MOTION_DISTANCE,
} from './tokens';

const ease = MOTION_EASE.out;
const D = MOTION_DURATION;

const t = (duration, delay = 0) => ({
  duration,
  ease,
  delay,
});

const group = (
  stagger = MOTION_STAGGER.md,
  delayChildren = MOTION_GROUP_DELAY.md,
) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Resultados — entrada precisa y progresiva */
export const metricsSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  grid: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.md),
  metric: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: D.card,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  num: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner) },
  },
  suffix: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  cap: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.md) },
  },
};

/** Empresas y aliados — reveal institucional con variación */
export const partnersSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  grid: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.sm),
  logoA: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.md, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: t(D.card) },
  },
  logoB: {
    hidden: { opacity: 0, scale: 0.968 },
    visible: { opacity: 1, scale: 1, transition: t(D.card) },
  },
  logoC: {
    hidden: { opacity: 0, x: MOTION_DISTANCE.md, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: t(D.card) },
  },
};

export const partnerLogoVariantCycle = [
  partnersSectionVariants.logoA,
  partnersSectionVariants.logoB,
  partnersSectionVariants.logoC,
  partnersSectionVariants.logoA,
  partnersSectionVariants.logoB,
];

export const partnerLogoHover = {
  y: -2,
  scale: 1.012,
  transition: { duration: MOTION_DURATION.hover, ease },
};

/** Cuatro unidades — cards como sistema */
export const solutionsSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  grid: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.sm),
  cardRowA: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md, scale: 0.992 },
    visible: { opacity: 1, y: 0, scale: 1, transition: t(D.card) },
  },
  cardRowB: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.lg, scale: 0.99 },
    visible: { opacity: 1, y: 0, scale: 1, transition: t(D.card + 0.04) },
  },
  cardInner: group(MOTION_STAGGER.sm, MOTION_DELAY.sm),
  idx: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner) },
  },
  cardTitle: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  cardBody: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  cardLink: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.sm },
    visible: { opacity: 1, x: 0, transition: t(D.inner, MOTION_DELAY.md) },
  },
};

export const solutionCardHover = {
  y: -3,
  boxShadow: '0 18px 40px -22px rgba(11, 33, 41, 0.35)',
  borderColor: 'rgba(196, 154, 58, 0.55)',
  transition: { duration: MOTION_DURATION.hover, ease },
};

export const solutionCardRest = {
  y: 0,
  boxShadow: '0 20px 54px -30px rgba(0, 0, 0, 0.6)',
  borderColor: 'rgba(246, 243, 236, 0.12)',
};

export const solutionLinkHover = {
  x: 3,
  color: 'rgba(210, 178, 117, 1)',
  transition: { duration: MOTION_DURATION.hover, ease },
};

export const METRICS_COUNT_DURATION = 960;

/** Cómo empezamos — avance y acompañamiento */
export const processSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  steps: group(MOTION_STAGGER.lg, MOTION_GROUP_DELAY.md),
  step: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.lg },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: D.card,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  connector: {
    hidden: { scaleY: 0, opacity: 0 },
    visible: { scaleY: 1, opacity: 1, transition: t(D.reveal) },
  },
  connectorHorizontal: {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: t(D.reveal) },
  },
  stepNum: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner) },
  },
  stepTitle: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  stepBody: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  closer: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  closerText: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal) },
  },
  closerActions: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.md) },
  },
};

/** Por qué Value Latam — columnas complementarias */
export const whyUsSectionVariants = {
  content: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.lg },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: D.reveal,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  body: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.md) },
  },
  bullets: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.sm),
  bullet: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.sm },
    visible: { opacity: 1, x: 0, transition: t(D.reveal) },
  },
  quote: {
    hidden: { opacity: 0, x: MOTION_DISTANCE.lg, clipPath: 'inset(0 0 0 100%)' },
    visible: {
      opacity: 1,
      x: 0,
      clipPath: 'inset(0 0 0 0)',
      transition: {
        duration: D.title,
        ease,
        delay: MOTION_DELAY.md,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_GROUP_DELAY.sm,
      },
    },
  },
  quoteText: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal) },
  },
  quoteBy: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  goldAccent: {
    hidden: { opacity: 0.72 },
    visible: {
      opacity: 1,
      transition: { duration: D.reveal, ease, delay: MOTION_DELAY.lg },
    },
  },
};

/** Mención regulatoria — institucional y estable */
export const regulationSectionVariants = {
  inner: group(MOTION_STAGGER.md, MOTION_DELAY.sm),
  text: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: D.reveal,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  paragraph: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal) },
  },
  badge: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  panel: {
    hidden: { opacity: 0, scale: 0.985 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: D.card,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_GROUP_DELAY.sm,
      },
    },
  },
  panelKicker: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner) },
  },
  seals: group(MOTION_STAGGER.md, MOTION_DELAY.sm),
  seal: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: t(D.card) },
  },
  panelShine: {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.35, 0],
      transition: { duration: 1, ease: 'easeOut', delay: MOTION_DELAY.lg },
    },
  },
};

/** Nuestro equipo — cards con entrada escalonada */
export const teamSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  grid: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.md),
  card: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md, scale: 0.992 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: D.card,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  role: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner) },
  },
  name: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  bio: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.inner, MOTION_DELAY.sm) },
  },
  link: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.sm },
    visible: { opacity: 1, x: 0, transition: t(D.inner, MOTION_DELAY.md) },
  },
};

export const teamPersonHover = {
  y: -3,
  boxShadow: '0 22px 56px -28px rgba(1, 4, 10, 0.72), 0 0 0 1px rgba(143, 178, 214, 0.22)',
  borderColor: 'rgba(196, 154, 58, 0.38)',
  transition: { duration: MOTION_DURATION.hover, ease },
};

export const teamLinkedInHover = {
  x: 3,
  color: 'rgba(210, 178, 117, 1)',
  transition: { duration: MOTION_DURATION.hover, ease },
};

/** Referí operaciones — conexión horizontal contenida */
export const referralSectionVariants = {
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  body: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.lg, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, x: 0, y: 0, transition: t(D.reveal, MOTION_GROUP_DELAY.sm) },
  },
  ctaWrap: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.md },
    visible: { opacity: 1, x: 0, transition: t(D.reveal, MOTION_GROUP_DELAY.md) },
  },
};

export const referralCtaHover = {
  y: -3,
  scale: 1.018,
  boxShadow:
    '0 16px 40px -12px rgba(191, 160, 90, 0.42), 0 0 0 1px rgba(210, 183, 117, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
  transition: { duration: MOTION_DURATION.hover, ease },
};

/** Contacto — texto primero, formulario después */
export const contactSectionVariants = {
  textCol: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: D.reveal,
        ease,
        staggerChildren: MOTION_STAGGER.sm,
        delayChildren: MOTION_DELAY.sm,
      },
    },
  },
  eyebrow: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.sm) },
  },
  title: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, transition: t(D.title, MOTION_DELAY.md) },
  },
  sub: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
    visible: { opacity: 1, y: 0, transition: t(D.reveal, MOTION_DELAY.md) },
  },
  benefits: group(MOTION_STAGGER.md, MOTION_GROUP_DELAY.sm),
  benefit: {
    hidden: { opacity: 0, x: -MOTION_DISTANCE.sm },
    visible: { opacity: 1, x: 0, transition: t(D.reveal) },
  },
  form: {
    hidden: { opacity: 0, y: MOTION_DISTANCE.lg, x: MOTION_DISTANCE.md },
    visible: { opacity: 1, y: 0, x: 0, transition: t(D.card, MOTION_GROUP_DELAY.lg) },
  },
};
