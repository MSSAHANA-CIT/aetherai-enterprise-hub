import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { colors } from "../colors";
import { shadows } from "../shadows";

/** Single source of truth for glassmorphism styles */
export const glassStyles = {
  base: "bg-ds-glass backdrop-blur-xl border border-ds-glass-border",
  medium: "bg-ds-glass-medium backdrop-blur-xl border border-ds-glass-border",
  strong: "bg-ds-glass-strong backdrop-blur-2xl border border-ds-glass-border-strong",
  card: "bg-ds-glass backdrop-blur-xl border border-ds-glass-border shadow-ds-glass rounded-2xl",
} as const;

/** Raw CSS values for programmatic use */
export const glassTokens = {
  background: colors.glass.DEFAULT,
  backgroundMedium: colors.glass.medium,
  backgroundStrong: colors.glass.strong,
  border: colors.glass.border,
  borderStrong: colors.glass.borderStrong,
  shadow: shadows.glass,
  backdropBlur: "24px",
  backdropBlurStrong: "40px",
} as const;

export function GlassSurface({
  variant = "base",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof glassStyles }) {
  return (
    <div className={cn(glassStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}
