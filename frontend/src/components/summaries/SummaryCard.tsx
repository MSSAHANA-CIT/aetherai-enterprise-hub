import { motion } from "framer-motion";
import { Calendar, Hash, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ApiSummary } from "../../lib/api";

interface SummaryCardProps {
  summary: ApiSummary;
  selected?: boolean;
  onClick?: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SummaryCard({ summary, selected = false, onClick }: SummaryCardProps) {
  const preview = summary.summary_text.length > 140
    ? `${summary.summary_text.slice(0, 140)}...`
    : summary.summary_text;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-all duration-200",
        "bg-surface-card/60 backdrop-blur-xl shadow-card",
        selected
          ? "border-aether-500/40 bg-aether-500/[0.08] shadow-glow-sm"
          : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-500/30 to-purple-600/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-aether-300" />
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{summary.title}</h3>
        </div>
        <span className="text-[11px] text-gray-500 flex-shrink-0 inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(summary.created_at)}
        </span>
      </div>

      {summary.channel && (
        <p className="text-xs text-aether-300/80 mb-2 inline-flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {summary.channel.name}
        </p>
      )}

      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{preview}</p>

      <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
        <span>{summary.decisions.length} decisions</span>
        <span>{summary.action_items.length} action items</span>
      </div>
    </motion.button>
  );
}
