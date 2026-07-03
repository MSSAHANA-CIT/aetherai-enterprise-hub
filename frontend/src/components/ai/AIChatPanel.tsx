import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import type { AIMode } from "../../lib/api";
import AIMessageBubble, { AILoadingBubble, type AIMessage } from "./AIMessageBubble";
import AIPromptCards from "./AIPromptCards";
import AIComposer from "./AIComposer";
import { AI_MODES } from "./AIModeSelector";

interface AIChatPanelProps {
  messages: AIMessage[];
  mode: AIMode;
  loading: boolean;
  error: string | null;
  onSend: (message: string) => Promise<void>;
  onSelectPrompt: (prompt: string) => void;
  promptDraft: string;
  onPromptDraftConsumed: () => void;
  userName?: string;
  userInitials?: string;
}

export default function AIChatPanel({
  messages,
  mode,
  loading,
  error,
  onSend,
  onSelectPrompt,
  promptDraft,
  onPromptDraftConsumed,
  userName,
  userInitials,
}: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeMode = AI_MODES.find((item) => item.id === mode);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const showPromptCards = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-surface-card/60 backdrop-blur-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{activeMode?.label ?? "AI Assistant"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{activeMode?.description}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {showPromptCards ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="glass rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-aether-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    I&apos;m your enterprise copilot. Choose a prompt below or type your own question to get
                    started.
                  </p>
                </div>
              </div>
            </div>
            <AIPromptCards onSelectPrompt={onSelectPrompt} disabled={loading} />
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <AIMessageBubble
                key={message.id}
                message={message}
                userName={userName}
                userInitials={userInitials}
              />
            ))}
          </AnimatePresence>
        )}

        {loading && <AILoadingBubble />}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </motion.div>
      )}

      <AIComposer
        onSend={onSend}
        disabled={loading}
        loading={loading}
        draftMessage={promptDraft}
        onDraftConsumed={onPromptDraftConsumed}
      />
    </div>
  );
}
