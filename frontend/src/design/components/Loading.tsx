import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { loadingPulse } from "../animations";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Spinner({ size = "md", className, label = "Loading" }: LoaderProps) {
  return (
    <Loader2
      className={cn(sizeClasses[size], "animate-spin text-ds-primary", className)}
      aria-label={label}
      role="status"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      variants={loadingPulse}
      initial="initial"
      animate="animate"
      className={cn("rounded-lg bg-ds-glass-medium", className)}
      aria-hidden="true"
    />
  );
}

export function PageLoader({ message = "Loading workspace..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" role="status">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-ds-primary/20 blur-xl" />
        <div className="relative w-14 h-14 rounded-2xl bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
      <p className="text-sm text-ds-text-muted">{message}</p>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="rounded-2xl border border-ds-border p-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-ds-border overflow-hidden" aria-hidden="true">
      <Skeleton className="h-10 w-full rounded-none" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-none border-t border-ds-border" />
      ))}
    </div>
  );
}

export function ChatLoader() {
  return (
    <div className="space-y-4 p-4" aria-hidden="true">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <Skeleton className="h-16 flex-1 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-12 w-2/3 rounded-2xl rounded-tr-sm" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <Skeleton className="h-20 flex-1 rounded-2xl rounded-tl-sm" />
      </div>
    </div>
  );
}

export function AIThinkingLoader({ message = "AI is thinking..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4" role="status" aria-label={message}>
      <div className="relative w-8 h-8">
        <Sparkles className="w-8 h-8 text-ds-ai animate-pulse" />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ds-ai"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-sm text-ds-text-muted">{message}</span>
    </div>
  );
}
