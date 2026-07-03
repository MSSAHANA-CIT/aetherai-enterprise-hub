/**
 * Aether Design System — Shadow Tokens
 */

export const shadows = {
  none: "none",
  soft: "0 2px 8px -2px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)",
  medium: "0 4px 16px -4px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)",
  strong: "0 8px 32px -8px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
  glass: "0 4px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  hover: "0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
  floating: "0 12px 40px -10px rgba(0, 0, 0, 0.55), 0 0 20px -5px rgba(99, 102,241, 0.15)",
  modal: "0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)",
  glow: "0 0 40px -10px rgba(99, 102, 241, 0.35)",
  glowSm: "0 0 20px -5px rgba(99, 102, 241, 0.25)",
} as const;

/** Tailwind class mappings */
export const shadowClasses = {
  soft: "shadow-ds-soft",
  medium: "shadow-ds-medium",
  strong: "shadow-ds-strong",
  glass: "shadow-ds-glass",
  hover: "shadow-ds-hover",
  floating: "shadow-ds-floating",
  modal: "shadow-ds-modal",
} as const;

export type ShadowKey = keyof typeof shadows;
