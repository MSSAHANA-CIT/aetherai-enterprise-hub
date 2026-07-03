/**
 * Aether Design System — Theme Configuration
 * Aggregates tokens into a cohesive theme object.
 */

import { colors } from "./colors";
import { typography, typographyClasses, fontFamily, fontWeight } from "./typography";
import { spacing, spacingPx } from "./spacing";
import { radius, radiusSemantic, radiusClasses } from "./radius";
import { shadows, shadowClasses } from "./shadows";
import { layout, layoutClasses, breakpoints } from "./layout";

export const theme = {
  colors,
  typography,
  typographyClasses,
  fontFamily,
  fontWeight,
  spacing,
  spacingPx,
  radius,
  radiusSemantic,
  radiusClasses,
  shadows,
  shadowClasses,
  layout,
  layoutClasses,
  breakpoints,
} as const;

export type AetherTheme = typeof theme;

/** CSS custom property names for runtime theming */
export const cssVarNames = {
  colorPrimary: "--ds-color-primary",
  colorBackground: "--ds-color-background",
  colorSurface: "--ds-color-surface",
  colorTextPrimary: "--ds-color-text-primary",
  colorTextSecondary: "--ds-color-text-secondary",
  colorBorder: "--ds-color-border",
  radiusMd: "--ds-radius-md",
  shadowSoft: "--ds-shadow-soft",
} as const;
