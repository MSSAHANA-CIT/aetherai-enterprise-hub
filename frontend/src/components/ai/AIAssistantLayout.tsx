import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import type { AIMode } from "../../lib/api";
import AIModeSelector from "./AIModeSelector";
import AIChatPanel from "./AIChatPanel";
import type { AIMessage } from "./AIMessageBubble";
import { pageFade } from "../../lib/animations";

interface AIAssistantLayoutProps {
  mode: AIMode;
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
  onModeChange: (mode: AIMode) => void;
  onSend: (message: string) => Promise<void>;
  onSelectPrompt: (prompt: string) => void;
  promptDraft: string;
  onPromptDraftConsumed: () => void;
  userName?: string;
  userInitials?: string;
}

export default function AIAssistantLayout({
  mode,
  messages,
  loading,
  error,
  onModeChange,
  onSend,
  onSelectPrompt,
  promptDraft,
  onPromptDraftConsumed,
  userName,
  userInitials,
}: AIAssistantLayoutProps) {
  return (
    <motion.div {...pageFade} className="max-w-[1600px] mx-auto h-[calc(100vh-7.5rem)] flex flex-col">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">AetherAI Assistant</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Ask questions, summarize work, draft documents, and solve problems.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <aside className="rounded-2xl border border-white/[0.08] bg-surface-card/50 backdrop-blur-xl p-4 overflow-y-auto">
          <AIModeSelector selectedMode={mode} onModeChange={onModeChange} disabled={loading} />
        </aside>

        <main className="min-h-0">
          <AIChatPanel
            messages={messages}
            mode={mode}
            loading={loading}
            error={error}
            onSend={onSend}
            onSelectPrompt={onSelectPrompt}
            promptDraft={promptDraft}
            onPromptDraftConsumed={onPromptDraftConsumed}
            userName={userName}
            userInitials={userInitials}
          />
        </main>
      </div>
    </motion.div>
  );
}
