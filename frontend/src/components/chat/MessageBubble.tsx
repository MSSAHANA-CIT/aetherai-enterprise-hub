import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reply, Pin, MoreHorizontal } from "lucide-react";
import Avatar from "../ui/Avatar";
import ChatAttachmentContent from "./ChatAttachmentContent";
import type { ApiMessage } from "../../lib/api";
import { getAvatarGradient, getInitials, formatMessageTime } from "../../lib/chatUtils";
import { cn } from "../../lib/utils";

const REACTION_EMOJIS = ["👍", "❤️", "✅", "🔥", "👀", "🎉"] as const;

interface MessageBubbleProps {
  message: ApiMessage;
  isOwn: boolean;
  token?: string | null;
  compact?: boolean;
  searchQuery?: string;
  senderOnline?: boolean;
  onToggleReaction?: (messageId: number, emoji: string) => void;
  onPinMessage?: (messageId: number) => void;
  onOpenThread?: (message: ApiMessage) => void;
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-500/30 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function MessageBubble({
  message,
  isOwn,
  token = null,
  compact = false,
  searchQuery = "",
  senderOnline,
  onToggleReaction,
  onPinMessage,
  onOpenThread,
}: MessageBubbleProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const initials = getInitials(message.sender.full_name);
  const gradient = getAvatarGradient(message.sender.id);
  const time = formatMessageTime(message.created_at);
  const hasAttachment = Boolean(message.attachment);
  const reactions = message.reactions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("flex gap-3 group", isOwn ? "flex-row-reverse" : "flex-row", compact && "gap-2")}
    >
      {!compact && (
        <Avatar initials={initials} gradient={gradient} size="sm" online={senderOnline} />
      )}

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        <div className={cn("flex items-baseline gap-2 mb-1", isOwn && "flex-row-reverse")}>
          <span className="text-sm font-medium text-ds-text-primary">{message.sender.full_name}</span>
          <span className="text-[10px] text-ds-text-muted capitalize px-1.5 py-0.5 rounded bg-ds-surface-hover">
            {message.sender.role}
          </span>
          <span className="text-[10px] text-ds-text-muted">{time}</span>
          {message.is_pinned && <Pin className="w-3 h-3 text-amber-400" />}
        </div>

        <div
          className={cn(
            "rounded-2xl text-sm leading-relaxed transition-colors relative",
            hasAttachment ? "p-2" : "px-4 py-2.5",
            isOwn
              ? "bg-gradient-to-br from-ds-primary/80 to-ds-accent/50 text-white rounded-tr-md border border-ds-primary/20"
              : "bg-ds-surface-hover text-ds-text-secondary rounded-tl-md border border-ds-border/30 group-hover:bg-ds-surface-hover/80",
            message.id < 0 && "opacity-80"
          )}
        >
          {hasAttachment ? (
            <ChatAttachmentContent message={message} token={token} isOwn={isOwn} />
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {highlightText(message.content, searchQuery)}
            </p>
          )}
        </div>

        {reactions.length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1.5", isOwn && "justify-end")}>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => onToggleReaction?.(message.id, reaction.emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  reaction.reacted_by_me
                    ? "bg-ds-primary/20 border-ds-primary/30"
                    : "bg-ds-surface-hover border-ds-border/30 hover:bg-ds-surface-hover/80"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-ds-text-muted">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {(message.reply_count ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => onOpenThread?.(message)}
            className="text-[11px] text-ds-primary mt-1 hover:underline"
          >
            {message.reply_count} {message.reply_count === 1 ? "reply" : "replies"}
          </button>
        )}

        <div
          className={cn(
            "flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn && "flex-row-reverse",
            moreOpen && "opacity-100"
          )}
        >
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggleReaction?.(message.id, emoji)}
              className="p-1 rounded-md text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors text-sm"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onOpenThread?.(message)}
            className="p-1 rounded-md text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors"
            title="Reply in thread"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="p-1 rounded-md text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close"
                />
                <div className="absolute z-50 bottom-full mb-1 right-0 w-36 py-1 rounded-lg border border-ds-border/40 bg-ds-surface-elevated shadow-ds-card">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs text-ds-text-secondary hover:bg-ds-surface-hover"
                    onClick={() => {
                      onPinMessage?.(message.id);
                      setMoreOpen(false);
                    }}
                  >
                    {message.is_pinned ? "Unpin" : "Pin message"}
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs text-ds-text-secondary hover:bg-ds-surface-hover"
                    onClick={() => {
                      onOpenThread?.(message);
                      setMoreOpen(false);
                    }}
                  >
                    Reply in thread
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
