import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, LogOut, KeyRound, UserCircle, Shield } from "lucide-react";
import { sidebar as sidebarVariants, dropdown } from "../../design/animations";
import { SidebarSection } from "../../design/components/Sidebar";
import RoleBadge from "../admin/RoleBadge";
import { cn } from "../../lib/utils";
import { navItems } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const NAV_END_IDS = new Set([
  "dashboard", "ai", "summaries", "knowledge", "analytics", "tasks", "chat", "admin", "audit-logs", "meetings",
]);

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const displayUser = user ?? {
    name: "Guest",
    role: "Not signed in",
    initials: "G",
    avatarColor: "from-ds-text-muted to-ds-text-secondary",
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOnly && !isManager) return false;
    return true;
  });

  const mainNav = filteredNav.filter((item) => !item.adminOnly);
  const adminNav = filteredNav.filter((item) => item.adminOnly);

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-ds-sidebar border-r border-ds-sidebar-border overflow-hidden"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-ds-sidebar-border shrink-0",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ds-primary-500 to-ds-accent flex items-center justify-center shadow-ds-glow-sm flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-ds-text-primary text-lg tracking-tight truncate"
            >
              AetherAI
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto ds-scrollbar py-3">
        <SidebarSection title={collapsed ? undefined : "Workspace"}>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredId === item.id;

            return (
              <NavLink
                key={item.id}
                to={item.href}
                end={NAV_END_IDS.has(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "text-ds-text-primary bg-ds-sidebar-active"
                      : "text-ds-text-muted hover:text-ds-text-secondary hover:bg-ds-sidebar-hover"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ds-primary rounded-full"
                        aria-hidden="true"
                      />
                    )}
                    <motion.div
                      animate={{ scale: isHovered ? 1.08 : 1 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-ds-primary-300")} />
                    </motion.div>
                    {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </SidebarSection>

        {adminNav.length > 0 && (
          <SidebarSection title={collapsed ? undefined : "Administration"}>
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  end={NAV_END_IDS.has(item.id)}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "text-ds-text-primary bg-ds-sidebar-active"
                        : "text-ds-text-muted hover:text-ds-text-secondary hover:bg-ds-sidebar-hover"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ds-primary rounded-full"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className={cn("w-5 h-5", isActive && "text-ds-primary-300")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </SidebarSection>
        )}
      </div>

      {/* User profile */}
      <div className={cn("p-3 border-t border-ds-sidebar-border shrink-0", collapsed && "px-2")}>
        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogout((prev) => !prev)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl ds-glass cursor-pointer hover:bg-ds-sidebar-hover transition-colors text-left",
              collapsed && "justify-center p-2"
            )}
            aria-expanded={showLogout}
            aria-haspopup="menu"
          >
            <Avatar
              initials={displayUser.initials}
              gradient={displayUser.avatarColor}
              size="md"
              online
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">{displayUser.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  {user?.role ? (
                    <RoleBadge role={user.role} size="sm" />
                  ) : (
                    <p className="text-xs text-ds-text-muted truncate">{displayUser.role}</p>
                  )}
                </div>
              </div>
            )}
          </motion.button>

          <AnimatePresence>
            {showLogout && !collapsed && (
              <motion.div
                variants={dropdown}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-ds-card border border-ds-border shadow-ds-floating overflow-hidden"
                role="menu"
              >
                {isAdmin && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowLogout(false);
                      navigate("/admin/users");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors"
                  >
                    <Shield className="w-4 h-4 text-ds-primary-300" />
                    User Management
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowLogout(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-ds-primary-300" />
                  My Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowLogout(false);
                    navigate("/change-password");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-ds-primary-300" />
                  Change password
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors border-t border-ds-border"
                >
                  <LogOut className="w-4 h-4 text-ds-danger" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-ds-card border border-ds-border flex items-center justify-center text-ds-text-muted hover:text-ds-text-primary hover:border-ds-border-strong transition-colors shadow-ds-soft"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      )}
    </motion.aside>
  );
}
