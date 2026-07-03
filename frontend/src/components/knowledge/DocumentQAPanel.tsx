import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Check, Copy, Loader2, Send } from "lucide-react";
import ExportMenu from "../export/ExportMenu";

interface DocumentQAPanelProps {
  onAsk: (question: string) => Promise<string>;
  asking?: boolean;
  documentTitle?: string;
}

export default function DocumentQAPanel({ onAsk, asking = false, documentTitle = "Document" }: DocumentQAPanelProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed || asking) return;

    setLastQuestion(trimmed);
    const result = await onAsk(trimmed);
    setAnswer(result);
    setQuestion("");
  };

  const handleCopy = async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3 inline-flex items-center gap-1.5">
        <Bot className="w-3.5 h-3.5 text-aether-400" />
        Ask AI About This Document
      </h3>

      <div className="flex items-end gap-2">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder="What are the main points of this document?"
          rows={2}
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-aether-500/40 resize-none"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={asking || !question.trim()}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-aether-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
        >
          {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-xl border border-aether-500/20 bg-aether-500/[0.06] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">
                Q: <span className="text-gray-300">{lastQuestion}</span>
              </p>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-gray-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Answer
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{answer}</p>
            <div className="mt-3">
              <ExportMenu content={`Q: ${lastQuestion}\n\nA: ${answer}`} title={`${documentTitle} — Q&A`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
