import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ClipboardList,
  Code,
  FileText,
  Mail,
  Megaphone,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { getRecentAIChats } from "../../../lib/aiChatHistory";
import { DashboardCard } from "./shared/DashboardCard";
import { Badge } from "../../../design/components/Badge";
import { TextInput } from "../../../design/components/Input";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";
import { cn } from "../../../lib/utils";

const QUICK_ACTIONS = [
  { id: "meeting", label: "Summarize Meeting", icon: Video, mode: "video_meeting_summary", prompt: "Summarize my latest meeting recording and extract action items." },
  { id: "tasks", label: "Generate Tasks", icon: ClipboardList, mode: "task_planner", prompt: "Generate actionable tasks from my current project priorities." },
  { id: "email", label: "Write Email", icon: Mail, mode: "email_writer", prompt: "Draft a professional follow-up email to my team." },
  { id: "code", label: "Explain Code", icon: Code, mode: "error_explainer", prompt: "Explain this code snippet and suggest improvements." },
  { id: "doc", label: "Summarize Document", icon: FileText, mode: "document_summary", prompt: "Summarize the key points from my latest uploaded document." },
  { id: "announce", label: "Create Announcement", icon: Megaphone, mode: "general", prompt: "Write a company-wide announcement about our latest product update." },
];

const SUGGESTED_PROMPTS = [
  "What should I focus on today?",
  "Summarize my team's recent activity",
  "Draft a status update for leadership",
  "Identify overdue tasks and priorities",
];

export default function MainAIWorkspace() {
  const navigate = useNavigate();
  const { loading, summaries, aiUsage } = useDashboardData();
  const [prompt, setPrompt] = useState("");

  const goToAI = (message?: string, mode?: string) => {
    navigate("/ai", {
      state: { initialPrompt: message, mode },
    });
  };

  const recentSummaries = summaries.slice(0, 3);
  const recentChats = useMemo(() => getRecentAIChats(3), [loading]);

  if (loading) {
    return <Skeleton className="h-[520px] rounded-2xl" aria-busy="true" />;
  }

  return (
    <section aria-label="AI command center">
      <DashboardCard variant="gradient" padding="lg" hover={false} className="h-full min-h-[520px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ds-primary to-purple-600 flex items-center justify-center shadow-ds-glow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ds-text-primary">AI Command Center</h2>
              <p className="text-xs text-ds-text-muted">Intelligent workspace · Powered by AetherAI</p>
            </div>
          </div>
          <Badge variant="success">
            {aiUsage?.ai_queries_today ?? 0} queries today
          </Badge>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-ds-primary mt-0.5 shrink-0" />
            <p className="text-sm text-ds-text-secondary leading-relaxed">
              Your AI workspace is ready. Ask questions, generate tasks, summarize meetings, or draft communications — all from one intelligent hub.
            </p>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-3">Ask AI</p>
          <div className="flex gap-2">
            <TextInput
              placeholder="Ask AetherAI anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) goToAI(prompt.trim());
              }}
              className="flex-1"
              aria-label="AI prompt input"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => prompt.trim() && goToAI(prompt.trim())}
              disabled={!prompt.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-ds-primary to-purple-600 text-white disabled:opacity-40"
              aria-label="Send to AI"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-3">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToAI(p)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-ds-text-muted hover:text-ds-text-primary hover:bg-white/[0.08] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-3">Quick Actions</p>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  variants={staggerItem}
                  onClick={() => goToAI(action.prompt, action.mode)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left hover:bg-white/[0.06] hover:border-ds-primary/30 transition-all group"
                >
                  <Icon className="w-4 h-4 text-ds-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-ds-text-secondary group-hover:text-ds-text-primary">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-2">Recent summaries</p>
            <div className="space-y-2">
              {recentSummaries.length === 0 ? (
                <p className="text-xs text-ds-text-muted">No summaries yet — generate one from chat.</p>
              ) : (
                recentSummaries.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate("/summaries")}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                  >
                    <p className="text-xs font-medium text-ds-text-primary truncate">{s.title}</p>
                    <p className="text-[10px] text-ds-text-muted truncate">{s.summary_text}</p>
                  </button>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-2">Recent AI chats</p>
            <div className="space-y-2">
              {recentChats.length === 0 ? (
                <p className="text-xs text-ds-text-muted">Start a conversation to see history.</p>
              ) : (
                recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => navigate("/ai", { state: { resumeSessionId: chat.id } })}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                  >
                    <p className="text-xs font-medium text-ds-text-primary truncate">{chat.title}</p>
                    <p className="text-[10px] text-ds-text-muted truncate">{chat.preview}</p>
                  </button>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-ds-text-muted uppercase tracking-wider font-medium mb-2">AI mode usage</p>
            <div className="space-y-2">
              {(aiUsage?.ai_modes_used ?? []).slice(0, 3).map((mode) => (
                <button
                  key={mode.mode}
                  type="button"
                  onClick={() => goToAI(`Continue with ${mode.label}`)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                    "bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                  )}
                >
                  <span className="text-xs text-ds-text-secondary">{mode.label}</span>
                  <span className="text-[10px] text-ds-primary font-medium">{mode.count}×</span>
                </button>
              ))}
              {(aiUsage?.ai_modes_used ?? []).length === 0 && (
                <p className="text-xs text-ds-text-muted">Start a conversation to see activity.</p>
              )}
            </div>
          </div>
        </div>
      </DashboardCard>
    </section>
  );
}
