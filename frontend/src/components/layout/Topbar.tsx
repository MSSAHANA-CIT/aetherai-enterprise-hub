import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Command, LogOut, UserCircle, KeyRound, Shield, Bot } from "lucide-react";
import { dropdown } from "../../design/animations";
import { layout } from "../../design/layout";
import { Badge } from "../../design/components/Badge";
import { Button } from "../../design/components/Button";
import { SearchInput } from "../../design/components/Input";
import Avatar from "../ui/Avatar";
import NotificationCenter from "../notifications/NotificationCenter";
import CommandPalette from "./CommandPalette";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type SystemStatus = "operational" | "degraded" | "offline" | "checking";

export default function Topbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("checking");

  const displayUser = user ?? {
    name: "Guest",
    initials: "G",
    avatarColor: "from-ds-text-muted to-ds-text-secondary",
  };

  const checkHealth = useCallback(async () => {
    setSystemStatus("checking");
    try {
      const response = await api.health();
      setSystemStatus(response.status === "success" ? "operational" : "degraded");
    } catch {
      setSystemStatus("offline");
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => void checkHealth(), 120000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const statusConfig = {
    operational: { label: "All systems operational", variant: "success" as const },
    degraded: { label: "Partial degradation", variant: "warning" as const },
    offline: { label: "Backend unreachable", variant: "warning" as const },
    checking: { label: "Checking status...", variant: "default" as const },
  };

  const status = statusConfig[systemStatus];

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-6 border-b border-ds-border bg-ds-surface/80 backdrop-blur-xl shrink-0"
        style={{ height: layout.topbar.height }}
        role="banner"
      >
        <div className="flex-1 max-w-xl">
          <SearchInput
            placeholder="Search workspace..."
            className="cursor-pointer"
            readOnly
            onClick={() => setCommandOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setCommandOpen(true);
            }}
            aria-label="Open workspace search"
          />
        </div>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg ds-glass border border-ds-border text-xs text-ds-text-muted hover:text-ds-text-secondary hover:bg-ds-hover transition-colors"
          aria-label="Open command palette"
        >
          <Command className="w-3 h-3" aria-hidden="true" />
          <span>K</span>
        </button>

        <Button
          type="button"
          variant="gradient"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => navigate("/ai")}
          leftIcon={<Bot className="w-4 h-4" />}
        >
          Quick AI
        </Button>

        <button
          type="button"
          onClick={() => void checkHealth()}
          title="Click to refresh system status"
          aria-label={`System status: ${status.label}`}
        >
          <Badge variant={status.variant} className="hidden sm:inline-flex cursor-pointer hover:opacity-90 transition-opacity">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                systemStatus === "operational"
                  ? "bg-ds-success animate-pulse"
                  : systemStatus === "checking"
                    ? "bg-ds-text-muted animate-pulse"
                    : "bg-ds-warning"
              }`}
              aria-hidden="true"
            />
            {status.label}
          </Badge>
        </button>

        <NotificationCenter />

        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-ds-hover transition-colors"
            aria-expanded={showMenu}
            aria-haspopup="menu"
            aria-label="Profile menu"
          >
            <Avatar
              initials={displayUser.initials}
              gradient={displayUser.avatarColor}
              size="sm"
              online
            />
            <span className="hidden md:block text-sm font-medium text-ds-text-secondary">
              {displayUser.name}
            </span>
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <motion.div
                  variants={dropdown}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-xl bg-ds-card border border-ds-border shadow-ds-floating z-50"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-ds-border">
                    <p className="text-sm font-medium text-ds-text-primary truncate">{displayUser.name}</p>
                    {user?.email && (
                      <p className="text-xs text-ds-text-muted truncate">{user.email}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        navigate("/admin/audit-logs");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors"
                    >
                      <Shield className="w-4 h-4 text-ds-primary-300" />
                      Audit Logs
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
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
                      setShowMenu(false);
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
                      setShowMenu(false);
                      navigate("/change-password");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-hover transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-ds-primary-300" />
                    Change Password
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
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
