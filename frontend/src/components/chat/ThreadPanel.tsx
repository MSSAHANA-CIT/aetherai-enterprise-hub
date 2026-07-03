import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Send } from "lucide-react";
import { ApiError, api, type ApiMessage } from "../../lib/api";
import MessageBubble from "./MessageBubble";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { getAvatarGradient, getInitials, formatMessageTime } from "../../lib/chatUtils";
import { cn } from "../../lib/utils";

interface ThreadPanelProps {
  parentMessage: ApiMessage;
  channelId: number;
  currentUserId: string;
  token: string | null;
  onClose: () => void;
  onSendReply: (content: string, parentMessageId: number) => Promise<void>;
  sending?: boolean;
}

export default function ThreadPanel({
  parentMessage,
  currentUserId,
  token,
  onClose,
  onSendReply,
  sending = false,
}: ThreadPanelProps) {
  const [replies, setReplies] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadReplies = async () => {
      setLoading(true);
      try {
        const data = await api.getMessageReplies(token, parentMessage.id);
        setReplies(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load replies");
      } finally {
        setLoading(false);
      }
    };

    void loadReplies();
  }, [token, parentMessage.id]);

  const handleSend = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;

    setError(null);
    try {
      await onSendReply(trimmed, parentMessage.id);
      setReplyText("");
      if (token) {
        const data = await api.getMessageReplies(token, parentMessage.id);
        setReplies(data);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send reply");
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="absolute inset-y-0 right-0 z-20 w-full sm:w-96 flex flex-col border-l border-ds-border/40 bg-ds-surface/95 backdrop-blur-xl shadow-ds-card"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-ds-border/30">
        <h3 className="text-sm font-semibold text-ds-text-primary">Thread</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors"
          aria-label="Close thread"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-ds-border/20 bg-ds-surface-hover/30">
        <div className="flex gap-3">
          <Avatar
            initials={getInitials(parentMessage.sender.full_name)}
            gradient={getAvatarGradient(parentMessage.sender.id)}
            size="sm"
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-ds-text-primary">{parentMessage.sender.full_name}</span>
              <span className="text-[10px] text-ds-text-muted">{formatMessageTime(parentMessage.created_at)}</span>
            </div>
            <p className="text-sm text-ds-text-secondary mt-1 whitespace-pre-wrap break-words">{parentMessage.content}</p>
          </div>
        </div>
        <p className="text-[11px] text-ds-text-muted mt-2">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 ds-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-ds-primary animate-spin" />
          </div>
        ) : replies.length === 0 ? (
          <p className="text-xs text-ds-text-muted text-center py-6">No replies yet. Start the thread.</p>
        ) : (
          replies.map((reply) => (
            <MessageBubble
              key={reply.id}
              message={reply}
              isOwn={String(reply.sender.id) === currentUserId}
              token={token}
              compact
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-ds-border/30">
        {error && <p className="text-xs text-amber-400 mb-2">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            disabled={sending}
            placeholder="Reply in thread..."
            rows={2}
            className={cn(
              "flex-1 resize-none rounded-xl px-3 py-2 text-sm text-ds-text-primary placeholder:text-ds-text-muted",
              "bg-ds-surface-hover border border-ds-border/40 focus:border-ds-primary/40 focus:outline-none focus:ring-1 focus:ring-ds-primary/20"
            )}
          />
          <Button onClick={() => void handleSend()} disabled={sending || !replyText.trim()} size="sm">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
