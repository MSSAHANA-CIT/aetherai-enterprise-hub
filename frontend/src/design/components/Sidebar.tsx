import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { sidebar as sidebarVariants } from "../animations";
import { layout } from "../layout";

export interface SidebarProps {
  collapsed?: boolean;
  children: ReactNode;
  className?: string;
}

export function Sidebar({ collapsed = false, children, className }: SidebarProps) {
  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "flex flex-col h-full bg-ds-sidebar border-r border-ds-sidebar-border shrink-0 overflow-hidden",
        className
      )}
      aria-label="Main navigation"
    >
      {children}
    </motion.aside>
  );
}

export function SidebarSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="px-3 py-2">
      {title && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ds-text-muted">
          {title}
        </p>
      )}
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );
}

export interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

export function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  const content = (
    <>
      {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      {!collapsed && <span className="truncate text-sm">{label}</span>}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ds-primary rounded-full"
          aria-hidden="true"
        />
      )}
    </>
  );

  const classes = cn(
    "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus",
    active
      ? "bg-ds-sidebar-active text-ds-text-primary"
      : "text-ds-text-muted hover:text-ds-text-secondary hover:bg-ds-sidebar-hover"
  );

  return (
    <button type="button" onClick={onClick} className={classes} aria-current={active ? "page" : undefined}>
      {content}
    </button>
  );
}

export { layout as sidebarLayout };
