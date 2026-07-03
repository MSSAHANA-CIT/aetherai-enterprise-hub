import { useState, useRef, useCallback, useEffect, type DragEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, Paperclip, Smile, Sparkles, Loader2, FileIcon, Mic, Video, ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import ChatEmojiPicker from "./ChatEmojiPicker";
import { useComingSoon } from "../../context/ComingSoonContext";
import { ApiError, sendAIMessage } from "../../lib/api";
import { cn } from "../../lib/utils";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  onSendFile?: (file: File, caption?: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  token?: string | null;
  channelId?: number;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
}

const TYPING_IDLE_MS = 1000;

const AI_TONE_PROMPTS: Record<string, string> = {
  professional: "Rewrite this message professionally but naturally for internal team chat:",
  friendly: "Rewrite this message in a warm, friendly tone for internal team chat:",
  shorter: "Make this message shorter while keeping the meaning for internal team chat:",
  detailed: "Expand this message with more detail for internal team chat:",
};

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function insertAtCursor(textarea: HTMLTextAreaElement, insertion: string, value: string): string {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  return value.slice(0, start) + insertion + value.slice(end);
}

function stripAiRewriteWrapper(text: string): string {
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^(rewritten message|here(?:'s| is) the rewritten message):\s*/i, "")
    .trim();
}

export default function MessageComposer({
  onSend,
  onSendFile,
  onTyping,
  token,
  channelId,
  disabled = false,
  sending = false,
  placeholder,
}: MessageComposerProps) {
  const navigate = useNavigate();
  const { openComingSoon } = useComingSoon();
  const [content, setContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [aiRewriting, setAiRewriting] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiAnchorRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const stopTyping = useCallback(() => {
    clearTypingTimer();
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }
  }, [clearTypingTimer, onTyping]);

  const scheduleStopTyping = useCallback(() => {
    clearTypingTimer();
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_IDLE_MS);
  }, [clearTypingTimer, stopTyping]);

  const handleTypingActivity = useCallback(() => {
    if (disabled || sending || aiRewriting) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.(true);
    }

    scheduleStopTyping();
  }, [disabled, sending, aiRewriting, onTyping, scheduleStopTyping]);

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!onSendFile || disabled || sending || aiRewriting) return;

      stopTyping();
      setComposerError(null);
      try {
        await onSendFile(file, content.trim() || undefined);
        setContent("");
        setPendingFile(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch {
        // Error handled by parent
      }
    },
    [onSendFile, disabled, sending, aiRewriting, content, stopTyping]
  );

  const handleSend = useCallback(async () => {
    if (pendingFile) {
      await uploadFile(pendingFile);
      return;
    }

    const trimmed = content.trim();
    if (!trimmed || disabled || sending || aiRewriting) return;

    stopTyping();
    setComposerError(null);

    try {
      await onSend(trimmed);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // Error handled by parent
    }
  }, [content, disabled, sending, aiRewriting, onSend, stopTyping, pendingFile, uploadFile]);

  const handleFileSelection = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled || sending || aiRewriting) return;
      setPendingFile(file);
      void uploadFile(file);
    },
    [disabled, sending, aiRewriting, uploadFile]
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setContent((prev) => prev + emoji);
        return;
      }

      const nextValue = insertAtCursor(textarea, emoji, content);
      setContent(nextValue);
      handleTypingActivity();

      requestAnimationFrame(() => {
        const cursor = (textarea.selectionStart ?? content.length) + emoji.length;
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [content, handleTypingActivity]
  );

  const handleAiTone = useCallback(
    async (tone: keyof typeof AI_TONE_PROMPTS) => {
      const draft = content.trim();
      if (!draft || !token) return;

      setAiRewriting(true);
      setComposerError(null);
      setToneOpen(false);
      stopTyping();

      try {
        const prompt = `${AI_TONE_PROMPTS[tone]}\n\n${draft}`;
        const result = await sendAIMessage(token, prompt, "message_rewrite");
        const rewritten = stripAiRewriteWrapper(result.data.response);
        if (rewritten) setContent(rewritten);
      } catch (err) {
        setComposerError(err instanceof ApiError ? err.message : "AI tone adjustment failed.");
      } finally {
        setAiRewriting(false);
      }
    },
    [content, token, stopTyping]
  );

  const handleFilePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAiRewrite = useCallback(async () => {
    const draft = content.trim();
    if (!draft) {
      setComposerError("Type a message first, then use AI to polish it.");
      return;
    }

    if (!token) {
      setComposerError("Sign in to use AI message rewrite.");
      return;
    }

    setAiRewriting(true);
    setComposerError(null);
    stopTyping();

    try {
      const result = await sendAIMessage(token, draft, "message_rewrite");
      const rewritten = stripAiRewriteWrapper(result.data.response);
      if (!rewritten) {
        setComposerError("AI could not rewrite this message. Try again.");
        return;
      }

      setContent(rewritten);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        textareaRef.current.focus();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setComposerError(err.message || "AI rewrite failed. Check your connection and try again.");
      } else {
        setComposerError("AI rewrite failed. Please try again.");
      }
    } finally {
      setAiRewriting(false);
    }
  }, [content, token, stopTyping]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleChange = (value: string) => {
    setContent(value);
    setComposerError(null);
    if (value.trim()) {
      handleTypingActivity();
    } else {
      stopTyping();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !sending && !aiRewriting) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const busy = disabled || sending || aiRewriting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 border-t border-white/[0.06] bg-white/[0.02]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {composerError && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-3 text-xs text-amber-400/90 px-1"
          >
            {composerError}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-3 rounded-xl border border-dashed border-aether-500/40 bg-aether-500/10 px-4 py-3 text-center text-sm text-aether-200"
          >
            Drop any file, image, video, or recording to share instantly
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingFile && sending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"
          >
            <FileIcon className="w-4 h-4 text-aether-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">{pendingFile.name}</p>
              <p className="text-[11px] text-gray-500">{formatFileSize(pendingFile.size)} · Uploading...</p>
            </div>
            <Loader2 className="w-4 h-4 text-aether-400 animate-spin flex-shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiRewriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center gap-2 rounded-xl border border-aether-500/20 bg-aether-500/10 px-3 py-2 text-sm text-aether-200"
          >
            <Loader2 className="w-4 h-4 animate-spin text-aether-400" />
            AetherAI is polishing your message...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1 pb-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="*/*"
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={handleFilePick}
            disabled={busy || !onSendFile}
            className="p-2 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors disabled:opacity-40"
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="relative" ref={emojiAnchorRef}>
            <ChatEmojiPicker
              open={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              onSelect={handleEmojiSelect}
              anchorRef={emojiAnchorRef}
            />
            <button
              type="button"
              onClick={() => setEmojiOpen((open) => !open)}
              disabled={busy}
              className={cn(
                "p-2 rounded-lg transition-colors disabled:opacity-40",
                emojiOpen
                  ? "text-aether-300 bg-aether-500/15"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.06]"
              )}
              title="Add emoji"
              aria-label="Add emoji"
              aria-expanded={emojiOpen}
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setToneOpen((v) => !v)}
              disabled={busy || !content.trim()}
              className="p-2 rounded-lg text-ds-text-muted hover:text-ds-primary hover:bg-ds-surface-hover transition-colors disabled:opacity-40 flex items-center"
              title="AI tone"
            >
              <Sparkles className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
            {toneOpen && (
              <>
                <button type="button" className="fixed inset-0 z-40" onClick={() => setToneOpen(false)} aria-label="Close" />
                <div className="absolute bottom-full left-0 mb-1 z-50 w-40 py-1 rounded-xl border border-ds-border/40 bg-ds-surface-elevated shadow-ds-card">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs text-ds-text-secondary hover:bg-ds-surface-hover"
                    onClick={() => void handleAiRewrite()}
                  >
                    AI Rewrite
                  </button>
                  {Object.keys(AI_TONE_PROMPTS).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-xs text-ds-text-secondary hover:bg-ds-surface-hover capitalize"
                      onClick={() => void handleAiTone(tone)}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              openComingSoon({
                title: "Voice Notes",
                description: "Record and send voice messages in channels.",
                feature: "Team Chat",
              })
            }
            disabled={busy}
            className="p-2 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors disabled:opacity-40"
            title="Voice note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/meetings", { state: { channelId, channelName: undefined } })
            }
            disabled={busy}
            className="p-2 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors disabled:opacity-40"
            title="Meeting notes"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onBlur={stopTyping}
            disabled={busy}
            placeholder={
              placeholder ??
              (disabled
                ? "Select a channel to message"
                : "Type a message, add emojis, or polish with AI...")
            }
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600",
              "bg-white/[0.04] border border-white/[0.08] focus:border-aether-500/40",
              "focus:outline-none focus:ring-2 focus:ring-aether-500/20 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        <Button
          onClick={() => void handleSend()}
          disabled={busy || (!content.trim() && !pendingFile)}
          size="md"
          className="flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </motion.div>
  );
}
