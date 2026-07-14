import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER, MOTION_DISTANCE, MOTION_GROUP_DELAY } from './tokens';

const transition = (duration = MOTION_DURATION.reveal) => ({
  duration,
  ease: MOTION_EASE.out,
});

export const fadeReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition(MOTION_DURATION.reveal),
  },
};

export const yReveal = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition(MOTION_DURATION.reveal),
  },
};

export const xRevealLeft = {
  hidden: { opacity: 0, x: -MOTION_DISTANCE.md },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition(MOTION_DURATION.reveal),
  },
};

export const xRevealRight = {
  hidden: { opacity: 0, x: MOTION_DISTANCE.md },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition(MOTION_DURATION.reveal),
  },
};

export const textReveal = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition(MOTION_DURATION.inner),
  },
};

export const cardReveal = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.lg, scale: 0.992 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transition(MOTION_DURATION.card),
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: MOTION_STAGGER.sm,
      delayChildren: MOTION_GROUP_DELAY.sm,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition(MOTION_DURATION.inner),
  },
};

export const dropdownMenu = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition(MOTION_DURATION.dropdown),
  },
};

export const dropdownItem = {
  hidden: { opacity: 0.88, x: -3 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition(MOTION_DURATION.fast),
  },
};
