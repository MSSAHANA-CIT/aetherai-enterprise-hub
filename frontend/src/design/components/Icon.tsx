import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "../../lib/utils";
import { iconSizeClasses, iconContainerClasses, type IconSize, type IconContainerSize } from "../icons";

export interface IconWrapperProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconWrapperProps>(
  ({ icon: IconComponent, size = "md", className, label, ...props }, ref) => (
    <IconComponent
      ref={ref}
      className={cn("shrink-0", iconSizeClasses[size], className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      {...props}
    />
  )
);

Icon.displayName = "Icon";

export function getIconContainerClass(size: IconContainerSize = "md") {
  return cn(
    iconContainerClasses[size],
    "flex items-center justify-center",
    "bg-ds-glass border border-ds-border"
  );
}
