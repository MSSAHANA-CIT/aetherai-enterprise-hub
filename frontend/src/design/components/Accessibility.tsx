import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Consistent focus ring for keyboard navigation */
export function FocusRing({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-ds-focus ring-offset-2 ring-offset-ds-canvas opacity-0 focus-within:opacity-100",
        className
      )}
      aria-hidden="true"
    />
  );
}

/** Visually hidden but accessible to screen readers */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/** Utility class for focus-visible rings */
export const focusRingClass =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ds-canvas";
