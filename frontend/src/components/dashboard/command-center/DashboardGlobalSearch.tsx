import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  CheckSquare,
  FileText,
  MessageSquare,
  Search,
  Settings,
  UserCircle,
  Video,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { modal, modalBackdrop } from "../../../design/animations";
import { cn } from "../../../lib/utils";

interface DashboardGlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type SearchCategory =
  | "employees"
  | "documents"
  | "meetings"
  | "tasks"
  | "ai"
  | "knowledge"
  | "channels"
  | "settings";

interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  href: string;
  icon: typeof Search;
}

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  employees: "Employees",
  documents: "Documents",
  meetings: "Meetings",
  tasks: "Tasks",
  ai: "AI Chats",
  knowledge: "Knowledge Base",
  channels: "Channels",
  settings: "Settings",
};

export default function DashboardGlobalSearch({ open, onClose }: DashboardGlobalSearchProps) {
  const navigate = useNavigate();
  const { users, documents, meetings, tasks, summaries } = useDashboardData();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResult[] = [];

    users.forEach((u) => {
      if (u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        items.push({
          id: `user-${u.id}`,
          category: "employees",
          title: u.full_name,
          subtitle: u.email,
          href: "/chat",
          icon: UserCircle,
        });
      }
    });

    documents.forEach((d) => {
      if (d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) {
        items.push({
          id: `doc-${d.id}`,
          category: "documents",
          title: d.title,
          subtitle: d.file_type,
          href: "/knowledge",
          icon: FileText,
        });
      }
    });

    meetings.forEach((m) => {
      if (m.title.toLowerCase().includes(q)) {
        items.push({
          id: `meeting-${m.id}`,
          category: "meetings",
          title: m.title,
          subtitle: m.status,
          href: "/meetings",
          icon: Video,
        });
      }
    });

    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        items.push({
          id: `task-${t.id}`,
          category: "tasks",
          title: t.title,
          subtitle: t.status,
          href: "/tasks",
          icon: CheckSquare,
        });
      }
    });

    summaries.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.summary_text.toLowerCase().includes(q)) {
        items.push({
          id: `summary-${s.id}`,
          category: "ai",
          title: s.title,
          subtitle: "AI Summary",
          href: "/ai",
          icon: Bot,
        });
      }
    });

    if ("knowledge".includes(q) || "documents".includes(q)) {
      items.push({
        id: "kb",
        category: "knowledge",
        title: "Knowledge Base",
        subtitle: "Browse all documents",
        href: "/knowledge",
        icon: BookOpen,
      });
    }

    if ("chat".includes(q) || "channel".includes(q)) {
      items.push({
        id: "chat",
        category: "channels",
        title: "Team Chat",
        subtitle: "Open channels",
        href: "/chat",
        icon: MessageSquare,
      });
    }

    if ("settings".includes(q) || "profile".includes(q)) {
      items.push({
        id: "profile",
        category: "settings",
        title: "Profile Settings",
        subtitle: "Account preferences",
        href: "/profile",
        icon: Settings,
      });
    }

    return items.slice(0, 12);
  }, [query, users, documents, meetings, tasks, summaries]);

  const handleSelect = (href: string) => {
    onClose();
    setQuery("");
    navigate(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            variants={modal}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 w-full max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Enterprise search"
          >
            <div className="rounded-2xl ds-glass-strong border border-ds-border shadow-ds-floating overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-ds-border">
                <Search className="w-5 h-5 text-ds-text-muted shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search employees, documents, meetings, tasks, AI chats..."
                  className="flex-1 bg-transparent text-ds-text-primary placeholder:text-ds-text-muted outline-none text-sm"
                  autoFocus
                  aria-label="Search query"
                />
                <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-ds-text-muted">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {query.trim() === "" ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-ds-text-muted mb-4">Search across your entire workspace</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {Object.values(CATEGORY_LABELS).map((label) => (
                        <span
                          key={label}
                          className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-ds-text-muted"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-sm text-ds-text-muted text-center py-8">No results for &ldquo;{query}&rdquo;</p>
                ) : (
                  <ul role="listbox">
                    {results.map((result, i) => {
                      const Icon = result.icon;
                      return (
                        <li key={result.id} role="option">
                          <button
                            type="button"
                            onClick={() => handleSelect(result.href)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left",
                              "hover:bg-white/[0.06] transition-colors",
                              i === 0 && "bg-white/[0.03]"
                            )}
                          >
                            <Icon className="w-4 h-4 text-ds-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ds-text-primary truncate">{result.title}</p>
                              <p className="text-xs text-ds-text-muted truncate">{result.subtitle}</p>
                            </div>
                            <span className="text-[10px] text-ds-text-muted uppercase tracking-wide shrink-0">
                              {CATEGORY_LABELS[result.category]}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
