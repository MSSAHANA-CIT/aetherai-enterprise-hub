/**
 * Aether Design System — Layout Tokens
 */

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

export const contentWidth = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
  full: "100%",
} as const;

export const layout = {
  sidebar: {
    expanded: 260,
    collapsed: 72,
  },
  topbar: {
    height: 64,
  },
  container: {
    maxWidth: contentWidth["2xl"],
    paddingX: {
      mobile: "1rem",
      tablet: "1.5rem",
      desktop: "2rem",
    },
  },
  section: {
    gap: "1.5rem",
    gapLg: "2rem",
  },
  grid: {
    gap: "1rem",
    gapMd: "1.5rem",
    gapLg: "2rem",
  },
  page: {
    padding: "1.5rem",
    paddingLg: "2rem",
  },
} as const;

/** Tailwind responsive class helpers */
export const layoutClasses = {
  container: "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8",
  section: "space-y-6",
  sectionLg: "space-y-8",
  grid: "grid gap-4",
  gridMd: "grid gap-6",
  gridLg: "grid gap-8",
  page: "p-6 lg:p-8",
} as const;

/** Media query helpers for programmatic use */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.laptop - 1}px)`,
  laptop: `(min-width: ${breakpoints.laptop}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
} as const;

export type Breakpoint = keyof typeof breakpoints;
