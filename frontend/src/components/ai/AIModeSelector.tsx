import { motion } from "framer-motion";
import {
  Bot,
  CalendarCheck,
  FileText,
  FileWarning,
  Mail,
  MessageSquareText,
  Scale,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import type { AIMode } from "../../lib/api";
import { cn } from "../../lib/utils";

export interface AIModeOption {
  id: AIMode;
  label: string;
  description: string;
  icon: typeof Bot;
}

export const AI_MODES: AIModeOption[] = [
  { id: "general", label: "General Assistant", description: "Everyday workplace questions and planning", icon: Bot },
  { id: "meeting_summary", label: "Meeting Summary", description: "Key points, decisions, and action items", icon: CalendarCheck },
  { id: "email_writer", label: "Email Writer", description: "Professional business email drafts", icon: Mail },
  { id: "task_planner", label: "Task Planner", description: "Goals into structured tasks and priorities", icon: MessageSquareText },
  { id: "error_explainer", label: "Error Explainer", description: "Logs and errors in plain language", icon: FileWarning },
  { id: "policy_helper", label: "Policy Helper", description: "Company policy guidance and clarity", icon: Scale },
  { id: "document_summary", label: "Document Summary", description: "Summarize policies, reports, and docs", icon: FileText },
  { id: "video_meeting_summary", label: "Video Meeting Summary", description: "Transcripts and multilingual meeting intel", icon: Video },
  { id: "manager_briefing", label: "Manager Briefing", description: "Leadership updates, risks, and team status", icon: Users },
  { id: "chat_summary", label: "Chat Summary", description: "Summarize team chat threads and extract follow-ups", icon: MessageSquareText },
];

interface AIModeSelectorProps {
  selectedMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  disabled?: boolean;
}

export default function AIModeSelector({ selectedMode, onModeChange, disabled }: AIModeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 mb-4">
        <Sparkles className="w-4 h-4 text-aether-400" />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Assistant Modes (10)</p>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {AI_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onModeChange(mode.id)}
              whileHover={disabled ? undefined : { scale: 1.01 }}
              whileTap={disabled ? undefined : { scale: 0.99 }}
              className={cn(
                "w-full text-left rounded-xl p-3.5 border transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-white/[0.08] border-aether-500/40 shadow-glow-sm"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive
                      ? "bg-gradient-to-br from-aether-500 to-purple-600 text-white"
                      : "bg-white/[0.06] text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-gray-300")}>
                    {mode.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{mode.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
