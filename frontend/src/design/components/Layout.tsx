import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { layoutClasses } from "../layout";

export function Container({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(layoutClasses.container, className)} {...props}>
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  spacing = "default",
  ...props
}: HTMLAttributes<HTMLElement> & { spacing?: "default" | "lg" }) {
  return (
    <section
      className={cn(spacing === "lg" ? layoutClasses.sectionLg : layoutClasses.section, className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Grid({
  className,
  children,
  cols = 1,
  gap = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4;
  gap?: "default" | "md" | "lg";
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    default: layoutClasses.grid,
    md: layoutClasses.gridMd,
    lg: layoutClasses.gridLg,
  };

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)} {...props}>
      {children}
    </div>
  );
}

export function ContentArea({ className, children }: { className?: string; children: ReactNode }) {
  return <main className={cn(layoutClasses.page, "flex-1 min-w-0", className)}>{children}</main>;
}
