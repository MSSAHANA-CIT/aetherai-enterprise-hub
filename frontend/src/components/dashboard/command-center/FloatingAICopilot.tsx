import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, ClipboardList, Mail, Send, Sparkles, X } from "lucide-react";
import { cn } from "../../../lib/utils";

const QUICK_COMMANDS = [
  { label: "Summarize meeting", prompt: "Summarize my latest meeting", icon: Sparkles },
  { label: "Generate tasks", prompt: "Generate tasks from my priorities", icon: ClipboardList },
  { label: "Write email", prompt: "Draft a professional email", icon: Mail },
];

export default function FloatingAICopilot() {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const goToAI = (message?: string) => {
    navigate("/ai", message ? { state: { initialPrompt: message } } : undefined);
    setExpanded(false);
    setPrompt("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3" aria-label="AI copilot">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
            className="w-72 rounded-2xl ds-glass-strong border border-ds-border shadow-ds-floating p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-ds-primary" />
                <span className="text-sm font-semibold text-ds-text-primary">AI Copilot</span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-ds-text-muted"
                aria-label="Close copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {QUICK_COMMANDS.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.label}
                    type="button"
                    onClick={() => goToAI(cmd.prompt)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ds-text-secondary hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-ds-primary" />
                    {cmd.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && prompt.trim() && goToAI(prompt.trim())}
                placeholder="Quick command..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-ds-text-primary placeholder:text-ds-text-muted outline-none"
                aria-label="Quick AI command"
              />
              <button
                type="button"
                onClick={() => prompt.trim() && goToAI(prompt.trim())}
                disabled={!prompt.trim()}
                className="p-2 rounded-lg bg-ds-primary text-white disabled:opacity-40"
                aria-label="Send command"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        className={cn(
          "w-14 h-14 rounded-full shadow-ds-floating flex items-center justify-center",
          "bg-gradient-to-br from-ds-primary to-purple-600 text-white",
          "border border-white/10 hover:shadow-ds-glow transition-shadow"
        )}
        aria-expanded={expanded}
        aria-label={expanded ? "Close AI copilot" : "Open AI copilot"}
      >
        {expanded ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
