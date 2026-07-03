/**
 * Aether Design System — Framer Motion Animation Presets
 * Single animation library: Framer Motion
 */

import type { Transition, Variants } from "framer-motion";

export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
} as const;

export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 260, damping: 26 },
  springBouncy: { type: "spring" as const, stiffness: 500, damping: 25 },
};

export const transition: Record<string, Transition> = {
  default: { duration: duration.normal, ease: easing.default },
  fast: { duration: duration.fast, ease: easing.out },
  slow: { duration: duration.slow, ease: easing.inOut },
  spring: easing.spring,
  springGentle: easing.springGentle,
};

/** Check reduced motion preference */
export function getReducedMotionVariants(variants: Variants): Variants {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
    };
  }
  return variants;
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.out } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: easing.in } },
};

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transition.default },
  exit: { opacity: 0, transition: transition.fast },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transition.default },
  exit: { opacity: 0, y: 8, transition: transition.fast },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: transition.default },
  exit: { opacity: 0, y: -8, transition: transition.fast },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.out } },
  exit: { opacity: 0, y: 16, transition: transition.fast },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.out } },
  exit: { opacity: 0, y: -16, transition: transition.fast },
};

export const scale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: transition.springGentle },
  exit: { opacity: 0, scale: 0.97, transition: transition.fast },
};

export const cardHover = {
  rest: { y: 0 },
  hover: { y: -2, transition: transition.fast },
};

export const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transition.fast,
};

export const buttonPress = {
  whileTap: { scale: 0.97 },
  transition: { duration: duration.instant },
};

export const modal: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: transition.springGentle },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: transition.fast },
};

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transition.fast },
  exit: { opacity: 0, transition: transition.fast },
};

export const dropdown: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: easing.out } },
  exit: { opacity: 0, scale: 0.97, y: -2, transition: transition.fast },
};

export const sidebar: Variants = {
  expanded: { width: 260, transition: transition.springGentle },
  collapsed: { width: 72, transition: transition.springGentle },
};

export const sidebarItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: transition.default },
};

export const toast: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: transition.springGentle },
  exit: { opacity: 0, y: 8, scale: 0.97, transition: transition.fast },
};

export const loading: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transition.default },
};

export const loadingPulse: Variants = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 0.8, 0.4], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
};

export const success: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: transition.springBouncy },
};

export const errorShake = {
  animate: { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } },
};

export const otpSuccess: Variants = {
  initial: { scale: 0.5, opacity: 0, rotate: -10 },
  animate: { scale: 1, opacity: 1, rotate: 0, transition: transition.springBouncy },
};

/** Stagger container for list animations */
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: transition.default },
};

/** Page transition modes */
export const pageTransitionModes = {
  fade: fade,
  slide: slideUp,
  scale: scale,
} as const;
