/**
 * Calm Operations - Motion Token System
 * Deliberate, subtle physics that explain state changes rather than decorating.
 */

export const transitions = {
  fast: { duration: 0.15, ease: [0.2, 0, 0, 1] },
  base: { duration: 0.24, ease: [0.2, 0, 0, 1] },
  slow: { duration: 0.42, ease: [0.2, 0, 0, 1] },
  spring: { type: 'spring', stiffness: 320, damping: 32 },
  springGentle: { type: 'spring', stiffness: 220, damping: 28 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -6, transition: transitions.fast },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const modalMotion = {
  initial: { opacity: 0, scale: 0.98, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: transitions.fast },
};

export const drawerMotion = {
  initial: { x: '100%', opacity: 0.5 },
  animate: { x: 0, opacity: 1, transition: transitions.spring },
  exit: { x: '100%', opacity: 0, transition: transitions.fast },
};
