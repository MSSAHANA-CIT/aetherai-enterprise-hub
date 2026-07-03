import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonHover, buttonPress } from "../animations";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success"
  | "gradient";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ds-primary text-white border border-ds-primary-400/30 shadow-ds-glow-sm hover:bg-ds-primary-500",
  secondary: "ds-glass text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover",
  ghost: "text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-hover",
  outline:
    "border border-ds-border-strong text-ds-text-secondary hover:bg-ds-hover hover:text-ds-text-primary",
  danger: "bg-ds-danger-muted text-ds-danger border border-ds-danger-border hover:bg-ds-danger/20",
  success: "bg-ds-success-muted text-ds-success border border-ds-success-border hover:bg-ds-success/20",
  gradient:
    "bg-gradient-to-r from-ds-primary-600 to-ds-accent text-white border border-ds-primary-400/30 shadow-ds-glow-sm hover:from-ds-primary-500 hover:to-ds-accent-light",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-7 text-base gap-2.5 rounded-xl",
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ds-canvas disabled:opacity-50 disabled:pointer-events-none";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => (
    <motion.button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...buttonHover}
      {...buttonPress}
      {...(props as object)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  )
);

Button.displayName = "Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "secondary";
  size?: ButtonSize;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", children, ...props }, ref) => {
    const iconSizes: Record<ButtonSize, string> = {
      sm: "h-8 w-8 rounded-lg",
      md: "h-10 w-10 rounded-xl",
      lg: "h-12 w-12 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          iconSizes[size],
          "p-0",
          className
        )}
        {...buttonHover}
        {...buttonPress}
        {...(props as object)}
      >
        {children}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";

export const LoadingButton = Button;
