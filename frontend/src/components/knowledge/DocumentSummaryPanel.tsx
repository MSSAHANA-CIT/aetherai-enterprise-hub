import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import ExportMenu from "../export/ExportMenu";

interface DocumentSummaryPanelProps {
  summary?: string | null;
  title?: string;
  onGenerate: () => void;
  generating?: boolean;
}

export default function DocumentSummaryPanel({
  summary,
  title = "Document Summary",
  onGenerate,
  generating = false,
}: DocumentSummaryPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          AI Summary
        </h3>
        <div className="flex items-center gap-2">
          {summary && (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500/80 to-purple-600/80 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {generating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                {summary ? "Regenerate Summary" : "Generate Summary"}
              </>
            )}
          </button>
        </div>
      </div>

      {summary ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
          <ExportMenu content={summary} title={title} />
        </motion.div>
      ) : (
        <p className="text-sm text-gray-500">
          No summary generated yet. Click Generate Summary to create an AI overview of this document.
        </p>
      )}
    </div>
  );
}
