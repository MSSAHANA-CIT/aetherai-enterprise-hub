import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, Copy, Hash, Sparkles, User } from "lucide-react";
import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";
import DecisionsList from "./DecisionsList";
import ActionItemsList from "./ActionItemsList";
import type { ApiSummary } from "../../lib/api";

interface SummaryDetailPanelProps {
  summary: ApiSummary | null;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildCopyText(summary: ApiSummary): string {
  const lines = [
    summary.title,
    "",
    "SUMMARY",
    summary.summary_text,
    "",
    "DECISIONS",
    ...(summary.decisions.length > 0 ? summary.decisions.map((d) => `- ${d}`) : ["- None"]),
    "",
    "ACTION ITEMS",
    ...(summary.action_items.length > 0
      ? summary.action_items.map(
          (item) => `- ${item.task} | Owner: ${item.owner || "Unassigned"} | Deadline: ${item.deadline || "TBD"}`
        )
      : ["- None"]),
  ];
  return lines.join("\n");
}

export default function SummaryDetailPanel({ summary }: SummaryDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!summary) {
    return (
      <Card variant="glass" className="h-full flex items-center justify-center border border-white/[0.08] bg-surface-card/40">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-aether-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a summary</h3>
          <p className="text-sm text-gray-500">
            Choose a summary from the history panel or generate a new one from team chat.
          </p>
        </div>
      </Card>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(summary));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      key={summary.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto"
    >
      <Card variant="glass" className="border border-white/[0.08] bg-surface-card/60 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-aether-400" />
              <h2 className="text-xl font-semibold text-white">{summary.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              {summary.channel && (
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-aether-300" />
                  #{summary.channel.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(summary.created_at)}
              </span>
              {summary.creator && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {summary.creator.full_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy summary"}
            </button>
            <ExportMenu content={buildCopyText(summary)} title={summary.title} />
          </div>
        </div>

        <section className="mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{summary.summary_text}</p>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Decisions</h3>
          <DecisionsList decisions={summary.decisions} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white mb-3">Action Items</h3>
          <ActionItemsList actionItems={summary.action_items} />
        </section>
      </Card>
    </motion.div>
  );
}
