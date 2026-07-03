import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Video,
  CheckSquare,
  BookOpen,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const RAIL_ITEMS = [
  { id: "home", label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Chat", href: "/chat", icon: MessageSquare },
  { id: "meetings", label: "Meetings", href: "/meetings", icon: Video },
  { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare },
  { id: "knowledge", label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { id: "ai", label: "AI", href: "/ai", icon: Bot },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, managerOnly: true },
  { id: "settings", label: "Settings", href: "/profile", icon: Settings },
] as const;

export default function WorkspaceRail() {
  const { isManager } = useAuth();

  const items = RAIL_ITEMS.filter((item) => !("managerOnly" in item && item.managerOnly) || isManager);

  return (
    <aside
      className="hidden md:flex w-14 flex-shrink-0 flex-col items-center py-3 gap-1 rounded-2xl border border-ds-border/40 bg-ds-sidebar/80 backdrop-blur-xl shadow-ds-card"
      aria-label="Workspace navigation"
    >
      <div
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-ds-primary-500 to-ds-accent flex items-center justify-center shadow-ds-glow-sm mb-2"
        title="AetherAI"
      >
        <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
      </div>

      <div className="w-8 h-px bg-ds-border/30 my-1" />

      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.href}
          title={item.label}
          className={({ isActive }) =>
            cn(
              "relative group w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
              isActive
                ? "bg-ds-primary/20 text-ds-primary-300 border border-ds-primary/30"
                : "text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover border border-transparent"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="workspace-rail-active"
                  className="absolute inset-0 rounded-xl bg-ds-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] relative z-10" aria-hidden="true" />
              <span className="sr-only">{item.label}</span>
              <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md bg-ds-surface-elevated border border-ds-border/40 text-xs text-ds-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-ds-card">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
