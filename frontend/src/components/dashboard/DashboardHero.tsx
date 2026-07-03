import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, MessageSquare, CheckSquare, FileText, Sparkles, Video } from "lucide-react";
import { Button } from "../../design/components/Button";
import { GlassCard } from "../../design/components/Card";
import { fadeUp } from "../../design/animations";
import { useAuth } from "../../context/AuthContext";

const quickActions = [
  { id: "ask-ai", label: "Ask AI", icon: Bot, href: "/ai" },
  { id: "start-chat", label: "Start Chat", icon: MessageSquare, href: "/chat" },
  {
    id: "create-task",
    label: "Create Task",
    icon: CheckSquare,
    href: "/tasks",
    state: { openCreate: true },
  },
  {
    id: "upload-doc",
    label: "Upload Document",
    icon: FileText,
    href: "/knowledge",
    state: { openUpload: true },
  },
  { id: "meetings", label: "Meetings", icon: Video, href: "/meetings" },
] as const;

export default function DashboardHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleAction = useCallback(
    (href: string, state?: Record<string, unknown>) => {
      navigate(href, state ? { state } : undefined);
    },
    [navigate]
  );

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <GlassCard padding="lg" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ds-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-ds-primary-300" aria-hidden="true" />
              <span className="text-xs font-medium text-ds-primary-300 uppercase tracking-wider">
                Enterprise Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ds-text-primary mb-2">
              {greeting}, {user?.name ?? "there"}
            </h1>
            <p className="text-ds-text-muted text-lg">
              Quick actions, live activity, and workspace health — all in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  type="button"
                  variant={i === 0 ? "gradient" : "secondary"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => handleAction(action.href, "state" in action ? action.state : undefined)}
                  leftIcon={<Icon className="w-4 h-4" />}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
