import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  BookOpen,
  Video,
  FileText,
  BarChart3,
  UserCircle,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Bot;
  href: string;
  state?: Record<string, unknown>;
  managerOnly?: boolean;
  adminOnly?: boolean;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Workspace overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "ai", label: "AI Assistant", description: "Ask AetherAI anything", icon: Bot, href: "/ai" },
  { id: "chat", label: "Team Chat", description: "Open team channels", icon: MessageSquare, href: "/chat" },
  { id: "tasks", label: "Tasks", description: "View task board", icon: CheckSquare, href: "/tasks" },
  { id: "create-task", label: "Create Task", description: "Add a new task", icon: CheckSquare, href: "/tasks", state: { openCreate: true } },
  { id: "knowledge", label: "Knowledge Base", description: "Browse documents", icon: BookOpen, href: "/knowledge" },
  { id: "upload", label: "Upload Document", description: "Add to knowledge base", icon: BookOpen, href: "/knowledge", state: { openUpload: true } },
  { id: "meetings", label: "Meetings", description: "Meeting intelligence", icon: Video, href: "/meetings" },
  { id: "summaries", label: "Summaries", description: "Channel summaries", icon: FileText, href: "/summaries", managerOnly: true },
  { id: "analytics", label: "Analytics", description: "Team metrics", icon: BarChart3, href: "/analytics", managerOnly: true },
  { id: "profile", label: "My Profile", description: "Account settings", icon: UserCircle, href: "/profile" },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const available = COMMANDS.filter((cmd) => {
      if (cmd.adminOnly && !isAdmin) return false;
      if (cmd.managerOnly && !isManager) return false;
      return true;
    });

    const q = query.trim().toLowerCase();
    if (!q) return available;

    return available.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q)
    );
  }, [query, isAdmin, isManager]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === "Enter" && filtered[activeIndex]) {
        event.preventDefault();
        const cmd = filtered[activeIndex];
        navigate(cmd.href, cmd.state ? { state: cmd.state } : undefined);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, activeIndex, navigate, onClose]);

  const runCommand = (cmd: CommandItem) => {
    navigate(cmd.href, cmd.state ? { state: cmd.state } : undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            className="fixed left-1/2 top-[18%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-2xl border border-white/10 bg-surface-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline text-[10px] text-gray-500 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-sm text-gray-500 text-center">No results found</p>
              ) : (
                filtered.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => runCommand(cmd)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                        index === activeIndex
                          ? "bg-aether-500/15 text-white"
                          : "text-gray-300 hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-aether-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{cmd.label}</p>
                        <p className="text-xs text-gray-500 truncate">{cmd.description}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
