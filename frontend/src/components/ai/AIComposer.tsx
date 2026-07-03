import { useCallback, useRef, useState, useEffect, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

const MAX_CHARS = 4000;

interface AIComposerProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  draftMessage?: string;
  onDraftConsumed?: () => void;
}

export default function AIComposer({
  onSend,
  disabled = false,
  loading = false,
  draftMessage = "",
  onDraftConsumed,
}: AIComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!draftMessage) return;
    setContent(draftMessage);
    onDraftConsumed?.();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      textareaRef.current.focus();
    }
  }, [draftMessage, onDraftConsumed]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled || loading) return;

    try {
      await onSend(trimmed);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // Parent handles errors
    }
  }, [content, disabled, loading, onSend]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.02]"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS + 200))}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled || loading}
            placeholder="Ask AetherAI anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600",
              "bg-white/[0.04] border focus:outline-none focus:ring-2 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isOverLimit
                ? "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/20"
                : "border-white/[0.08] focus:border-aether-500/40 focus:ring-aether-500/20"
            )}
          />
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-gray-600">Shift + Enter for new line</p>
            <p className={cn("text-[11px]", isOverLimit ? "text-red-400" : "text-gray-600")}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          onClick={() => void handleSend()}
          disabled={disabled || loading || !content.trim() || isOverLimit}
          size="md"
          className="flex-shrink-0 mb-7"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </motion.div>
  );
}
