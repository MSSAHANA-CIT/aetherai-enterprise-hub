import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";
import { fadeUp } from "../animations";
import { getIconContainerClass } from "./Icon";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn("flex flex-col items-center justify-center py-14 px-6 text-center", className)}
      role="status"
    >
      <div className={cn(getIconContainerClass("lg"), "mb-4")}>
        <Icon className="w-7 h-7 text-ds-text-muted" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ds-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-ds-text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
