import { forwardRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { fadeUp } from "../../../../design/animations";

export interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "glass" | "gradient" | "default";
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  delay?: number;
  className?: string;
  children?: ReactNode;
}

const paddingMap = { sm: "p-4", md: "p-5", lg: "p-6" };

const variantMap = {
  default: "bg-ds-card/60 border border-ds-border backdrop-blur-xl",
  glass: "ds-glass",
  gradient: "ds-gradient-border bg-ds-card/80 backdrop-blur-xl",
};

export const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  (
    {
      title,
      subtitle,
      icon,
      action,
      variant = "glass",
      hover = true,
      padding = "md",
      delay = 0,
      className,
      children,
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion();

    return (
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: reducedMotion ? 0 : delay }}
        whileHover={hover && !reducedMotion ? { y: -2, transition: { duration: 0.2 } } : undefined}
      >
        <div
          ref={ref}
          className={cn(
            "rounded-2xl shadow-ds-soft relative overflow-hidden",
            variantMap[variant],
            paddingMap[padding],
            hover && "transition-shadow duration-300 hover:shadow-ds-glow-sm",
            className
          )}
        >
          {(title || icon || action) && (
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 border border-white/[0.06]">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <h3 className="text-sm font-semibold text-ds-text-primary truncate">{title}</h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-ds-text-muted truncate">{subtitle}</p>
                  )}
                </div>
              </div>
              {action}
            </div>
          )}
          {children}
        </div>
      </motion.div>
    );
  }
);
DashboardCard.displayName = "DashboardCard";
