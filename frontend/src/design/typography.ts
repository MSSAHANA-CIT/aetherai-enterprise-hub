/**
 * Aether Design System — Typography Tokens
 */

export const fontFamily = {
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI Historic",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ].join(", "),
  mono: [
    "JetBrains Mono",
    "SF Mono",
    "Fira Code",
    "Consolas",
    "Liberation Mono",
    "monospace",
  ].join(", "),
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const letterSpacing = {
  tighter: "-0.03em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.08em",
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const typography = {
  displayXl: {
    fontSize: "3.5rem",
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tighter,
  },
  display: {
    fontSize: "2.75rem",
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tighter,
  },
  headingXl: {
    fontSize: "2rem",
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  heading: {
    fontSize: "1.5rem",
    lineHeight: lineHeight.snug,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  subheading: {
    fontSize: "1.125rem",
    lineHeight: lineHeight.snug,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: "1rem",
    lineHeight: lineHeight.relaxed,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: "0.875rem",
    lineHeight: lineHeight.relaxed,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontSize: "0.8125rem",
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: "0.875rem",
    lineHeight: lineHeight.none,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontSize: "0.8125rem",
    lineHeight: lineHeight.none,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  mono: {
    fontSize: "0.8125rem",
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.mono,
  },
} as const;

/** Tailwind class mappings for typography variants */
export const typographyClasses = {
  displayXl: "text-[3.5rem] font-bold tracking-tighter leading-tight",
  display: "text-[2.75rem] font-bold tracking-tighter leading-tight",
  headingXl: "text-[2rem] font-semibold tracking-tight leading-tight",
  heading: "text-2xl font-semibold tracking-tight leading-snug",
  subheading: "text-lg font-medium leading-snug",
  bodyLarge: "text-base leading-relaxed",
  body: "text-sm leading-relaxed",
  small: "text-[0.8125rem] leading-normal",
  caption: "text-xs font-medium tracking-wide",
  button: "text-sm font-medium",
  label: "text-[0.8125rem] font-medium tracking-wide",
  mono: "text-[0.8125rem] font-mono leading-normal",
} as const;

export type TypographyVariant = keyof typeof typography;
