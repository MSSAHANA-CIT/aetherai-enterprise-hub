/**
 * Aether Design System — Icon System Tokens
 * Icon library: Lucide React (see components/Icon.tsx for wrapper)
 */

export type { LucideIcon, LucideProps } from "lucide-react";

/** Consistent icon sizes in pixels */
export const iconSize = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
} as const;

export type IconSize = keyof typeof iconSize;

/** Tailwind class mappings for icon sizes */
export const iconSizeClasses: Record<IconSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-[18px] h-[18px]",
  lg: "w-[22px] h-[22px]",
  xl: "w-7 h-7",
};

/** Icon container sizes for feature cards, empty states, etc. */
export const iconContainerClasses = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-12 h-12 rounded-xl",
  xl: "w-14 h-14 rounded-2xl",
} as const;

export type IconContainerSize = keyof typeof iconContainerClasses;
