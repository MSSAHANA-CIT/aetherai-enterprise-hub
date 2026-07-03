/**
 * Aether Design System — Spacing Tokens
 * Base unit: 4px. All spacing derives from this scale.
 */

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

/** Numeric pixel values for programmatic use (Framer Motion, etc.) */
export const spacingPx = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
  80: 80,
  96: 96,
} as const;

/** Tailwind spacing key mapping */
export const spacingKeys = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  "2xl": spacing[12],
  "3xl": spacing[16],
} as const;

export type SpacingKey = keyof typeof spacing;
