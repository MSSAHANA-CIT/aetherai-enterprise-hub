import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "info"
  | "warning"
  | "ai"
  | "security"
  | "task"
  | "employee"
  | "manager"
  | "admin"
  | "online"
  | "offline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-ds-glass-medium text-ds-text-secondary border-ds-border",
  success: "bg-ds-success-muted text-ds-success border-ds-success-border",
  danger: "bg-ds-danger-muted text-ds-danger border-ds-danger-border",
  info: "bg-ds-info-muted text-ds-info border-ds-info-border",
  warning: "bg-ds-warning-muted text-ds-warning border-ds-warning-border",
  ai: "bg-ds-ai-muted text-ds-ai border-ds-ai/30",
  security: "bg-ds-security-muted text-ds-security border-ds-security/30",
  task: "bg-ds-task-muted text-ds-task border-ds-task/30",
  employee: "bg-ds-glass-medium text-ds-text-secondary border-ds-border",
  manager: "bg-ds-info-muted text-ds-info border-ds-info-border",
  admin: "bg-ds-primary/15 text-ds-primary-300 border-ds-primary/25",
  online: "bg-ds-success-muted text-ds-success border-ds-success-border",
  offline: "bg-ds-glass-medium text-ds-text-muted border-ds-border",
};

export function Badge({ variant = "default", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "online" ? "bg-ds-success" : "bg-ds-text-muted"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
