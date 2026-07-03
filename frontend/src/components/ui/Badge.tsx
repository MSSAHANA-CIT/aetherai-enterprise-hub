import { type HTMLAttributes } from "react";
import { Badge as DSBadge } from "../../design/components/Badge";
import type { BadgeVariant as DSBadgeVariant } from "../../design/components/Badge";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "info" | "purple";
}

const variantMap: Record<NonNullable<BadgeProps["variant"]>, DSBadgeVariant> = {
  default: "default",
  success: "success",
  warning: "warning",
  info: "info",
  purple: "admin",
};

export default function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <DSBadge variant={variantMap[variant]} className={className} {...props}>
      {children}
    </DSBadge>
  );
}
