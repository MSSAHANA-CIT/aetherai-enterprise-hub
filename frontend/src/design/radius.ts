/**
 * Aether Design System — Border Radius Tokens
 */

export const radius = {
  none: "0",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

/** Semantic radius aliases */
export const radiusSemantic = {
  small: radius.sm,
  medium: radius.lg,
  large: radius.xl,
  xl: radius["2xl"],
  "2xl": radius["3xl"],
  circular: radius.full,
} as const;

/** Tailwind class mappings */
export const radiusClasses = {
  small: "rounded-md",
  medium: "rounded-lg",
  large: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
  circular: "rounded-full",
} as const;

export type RadiusSemantic = keyof typeof radiusSemantic;
