import { type ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { fadeUp } from "../animations";

export type AlertVariant = "success" | "error" | "info" | "warning";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const config: Record<AlertVariant, { icon: typeof Info; classes: string }> = {
  success: {
    icon: CheckCircle2,
    classes: "border-ds-success-border bg-ds-success-muted/30 text-ds-success",
  },
  error: {
    icon: AlertCircle,
    classes: "border-ds-danger-border bg-ds-danger-muted/30 text-ds-danger",
  },
  info: {
    icon: Info,
    classes: "border-ds-info-border bg-ds-info-muted/30 text-ds-info",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-ds-warning-border bg-ds-warning-muted/30 text-ds-warning",
  },
};

export function Alert({ variant = "info", title, children, className, onDismiss }: AlertProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <motion.div
      role="alert"
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn("flex gap-3 p-4 rounded-xl border", classes, className)}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-ds-text-primary mb-0.5">{title}</p>}
        <div className="text-sm text-ds-text-secondary">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-ds-text-muted hover:text-ds-text-primary shrink-0"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
