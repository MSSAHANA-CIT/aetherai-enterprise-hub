import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { fadeUp } from "../animations";

export type CardVariant = "default" | "glass" | "gradient" | "floating" | "hover";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-ds-card border border-ds-border",
  glass: "ds-glass",
  gradient: "ds-gradient-border bg-ds-card/80",
  floating: "bg-ds-card border border-ds-border shadow-ds-floating",
  hover: "bg-ds-card border border-ds-border hover:border-ds-border-strong hover:bg-ds-card-hover transition-all duration-300",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", glow = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl shadow-ds-soft",
        variantClasses[variant],
        paddingClasses[padding],
        glow && "shadow-ds-glow-sm hover:shadow-ds-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const GlassCard = forwardRef<HTMLDivElement, Omit<CardProps, "variant">>((props, ref) => (
  <Card ref={ref} variant="glass" {...props} />
));
GlassCard.displayName = "GlassCard";

export interface StatisticCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
}

export function StatisticCard({ label, value, change, trend, icon, className, ...props }: StatisticCardProps) {
  const trendColor =
    trend === "up" ? "text-ds-success" : trend === "down" ? "text-ds-danger" : "text-ds-text-muted";

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <Card className={cn("flex flex-col gap-3", className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-ds-caption text-ds-text-muted uppercase tracking-wide">{label}</span>
          {icon && <div className="text-ds-text-muted">{icon}</div>}
        </div>
        <div className="text-2xl font-semibold text-ds-text-primary">{value}</div>
        {change && <span className={cn("text-xs font-medium", trendColor)}>{change}</span>}
      </Card>
    </motion.div>
  );
}

export interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function FeatureCard({ title, description, icon, className, ...props }: FeatureCardProps) {
  return (
    <HoverCard className={cn("flex flex-col gap-4", className)} {...props}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center text-ds-primary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-ds-subheading text-ds-text-primary mb-1">{title}</h3>
        <p className="text-ds-body text-ds-text-muted">{description}</p>
      </div>
    </HoverCard>
  );
}

export interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  variant?: "info" | "warning" | "success";
}

export function InfoCard({ title, children, variant = "info", className, ...props }: InfoCardProps) {
  const colors = {
    info: "border-ds-info-border bg-ds-info-muted/30",
    warning: "border-ds-warning-border bg-ds-warning-muted/30",
    success: "border-ds-success-border bg-ds-success-muted/30",
  };

  return (
    <Card className={cn("border", colors[variant], className)} {...props}>
      <h4 className="text-sm font-medium text-ds-text-primary mb-2">{title}</h4>
      <div className="text-sm text-ds-text-secondary">{children}</div>
    </Card>
  );
}

export function EmptyCard({ className, children, ...props }: CardProps) {
  return (
    <Card
      className={cn("border-dashed border-ds-border flex items-center justify-center min-h-[200px]", className)}
      {...props}
    >
      {children}
    </Card>
  );
}

export const HoverCard = forwardRef<HTMLDivElement, CardProps>((props, ref) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Card ref={ref} variant="hover" {...props} />
  </motion.div>
));
HoverCard.displayName = "HoverCard";

export const FloatingCard = forwardRef<HTMLDivElement, Omit<CardProps, "variant">>((props, ref) => (
  <Card ref={ref} variant="floating" {...props} />
));
FloatingCard.displayName = "FloatingCard";
