import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  KeyRound,
  LogOut,
  Plus,
  Search,
  Shield,
  UserCircle,
  Bot,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLiveClock } from "../../../hooks/useLiveClock";
import RoleBadge from "../../admin/RoleBadge";
import Avatar from "../../ui/Avatar";
import { Button } from "../../../design/components/Button";
import NotificationCenter from "../../notifications/NotificationCenter";
import DashboardGlobalSearch from "./DashboardGlobalSearch";
import { dropdown } from "../../../design/animations";
import { cn } from "../../../lib/utils";

export default function CommandCenterHeader() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { greeting, date, time } = useLiveClock();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayUser = user ?? {
    name: "Guest",
    email: "",
    company: "AetherAI",
    role: "employee",
    initials: "G",
    avatarColor: "from-ds-text-muted to-ds-text-secondary",
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-2xl ds-gradient-border p-[1px] overflow-hidden"
        role="banner"
        aria-label="Command center header"
      >
        <div className="relative rounded-2xl bg-ds-surface/80 backdrop-blur-2xl px-5 py-5 lg:px-6 lg:py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-ds-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium text-ds-primary"
              >
                {greeting}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap items-center gap-3"
              >
                <h1 className="text-2xl lg:text-3xl font-bold text-ds-text-primary tracking-tight">
                  {displayUser.name}
                </h1>
                <RoleBadge role={displayUser.role} size="sm" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ds-text-muted"
              >
                <span>{displayUser.company}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={new Date().toISOString()}>{date}</time>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-ds-text-secondary">{time}</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-ds-text-muted hover:text-ds-text-primary hover:bg-white/[0.06] transition-colors min-w-[200px] lg:min-w-[240px]"
                aria-label="Open search"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">Quick search...</span>
                <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                  ⌘K
                </kbd>
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/ai")}
                className="gap-2"
                aria-label="Open AI assistant"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/tasks", { state: { openCreate: true } })}
                className="gap-2"
                aria-label="Create new item"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>

              <NotificationCenter />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/[0.06] transition-colors"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Profile menu"
                >
                  <Avatar
                    initials={displayUser.initials}
                    gradient={displayUser.avatarColor}
                    size="sm"
                  />
                  <ChevronDown
                    className={cn("w-4 h-4 text-ds-text-muted transition-transform", menuOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                      />
                      <motion.div
                        variants={dropdown}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl ds-glass border border-ds-border shadow-ds-floating py-1"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-ds-border">
                          <p className="text-sm font-medium text-ds-text-primary truncate">{displayUser.name}</p>
                          <p className="text-xs text-ds-text-muted truncate">{displayUser.email}</p>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ds-text-secondary hover:bg-white/[0.04]"
                        >
                          <UserCircle className="w-4 h-4" /> Profile
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => { setMenuOpen(false); navigate("/change-password"); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ds-text-secondary hover:bg-white/[0.04]"
                        >
                          <KeyRound className="w-4 h-4" /> Change Password
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setMenuOpen(false); navigate("/admin/users"); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ds-text-secondary hover:bg-white/[0.04]"
                          >
                            <Shield className="w-4 h-4" /> Admin
                          </button>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <DashboardGlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
