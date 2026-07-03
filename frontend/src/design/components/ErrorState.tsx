import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { fadeUp } from "../animations";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this section. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center py-14 px-6 text-center rounded-2xl border border-ds-danger-border bg-ds-danger-muted/20",
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-xl bg-ds-danger-muted border border-ds-danger-border flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-ds-danger" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ds-text-primary mb-1">{title}</h3>
      <p className="text-sm text-ds-text-secondary max-w-md">{message}</p>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </motion.div>
  );
}
