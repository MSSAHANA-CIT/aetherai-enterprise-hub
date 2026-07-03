import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import EmptyChatState from "./EmptyChatState";
import type { ApiMessage } from "../../lib/api";
import type { TypingUser } from "../../hooks/useChatSocket";
import { staggerContainer } from "../../lib/animations";

interface MessageListProps {
  messages: ApiMessage[];
  allMessages?: ApiMessage[];
  searchQuery?: string;
  currentUserId: string;
  currentUserName?: string;
  token?: string | null;
  loading: boolean;
  error: string | null;
  channelName?: string;
  typingUsers?: TypingUser[];
  senderOnlineMap?: Record<number, boolean>;
  onToggleReaction?: (messageId: number, emoji: string) => void;
  onPinMessage?: (messageId: number) => void;
  onOpenThread?: (message: ApiMessage) => void;
}

function formatTypingIndicator(users: TypingUser[], currentUserId: string, currentUserName?: string): string | null {
  const others = users.filter(
    (user) => String(user.id) !== currentUserId && user.full_name !== currentUserName
  );

  if (others.length === 0) return null;
  if (others.length === 1) return `${others[0].full_name} is typing...`;
  if (others.length === 2) return `${others[0].full_name} and ${others[1].full_name} are typing...`;
  return `${others.length} people are typing...`;
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function groupMessagesByDate(messages: ApiMessage[]): { label: string; messages: ApiMessage[] }[] {
  const groups: { label: string; messages: ApiMessage[] }[] = [];
  let currentLabel = "";

  for (const message of messages) {
    const label = formatDateLabel(message.created_at);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [message] });
    } else {
      groups[groups.length - 1].messages.push(message);
    }
  }

  return groups;
}

export default function MessageList({
  messages,
  allMessages = [],
  searchQuery = "",
  currentUserId,
  currentUserName,
  token = null,
  loading,
  error,
  channelName,
  typingUsers = [],
  senderOnlineMap = {},
  onToggleReaction,
  onPinMessage,
  onOpenThread,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingText = formatTypingIndicator(typingUsers, currentUserId, currentUserName);
  const prevMessageCountRef = useRef(0);
  const lastSeenCountRef = useRef(allMessages.length);

  const dateGroups = groupMessagesByDate(messages);
  const newMessageSeparatorIndex =
    allMessages.length > lastSeenCountRef.current && !searchQuery.trim()
      ? Math.max(0, messages.length - (allMessages.length - lastSeenCountRef.current))
      : -1;

  useEffect(() => {
    if (!loading && allMessages.length > 0) {
      const timer = setTimeout(() => {
        lastSeenCountRef.current = allMessages.length;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, allMessages.length]);

  useEffect(() => {
    if (loading) return;

    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (!isNewMessage) return;

    const container = containerRef.current;
    const nearBottom =
      !container ||
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading, typingText]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-ds-primary animate-spin" />
          <p className="text-sm text-ds-text-muted">Loading messages...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 text-center max-w-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-ds-text-secondary">{error}</p>
          <p className="text-xs text-ds-text-muted">Check that the backend is running on port 8000</p>
        </motion.div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col ds-scrollbar">
        {searchQuery.trim() ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-ds-text-muted">No messages match your search.</p>
          </div>
        ) : (
          <EmptyChatState channelName={channelName} />
        )}
        <AnimatePresence>
          {typingText && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="px-6 pb-4">
              <TypingIndicator text={typingText} />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    );
  }

  let messageIndex = 0;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 scroll-smooth ds-scrollbar">
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
        {dateGroups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-ds-border/30" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-ds-text-muted px-2">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-ds-border/30" />
            </div>
            <div className="space-y-4">
              {group.messages.map((message) => {
                const idx = messageIndex++;
                const showNewSeparator = idx === newMessageSeparatorIndex;
                return (
                  <div key={message.id}>
                    {showNewSeparator && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-ds-primary/40" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ds-primary px-2">
                          New messages
                        </span>
                        <div className="flex-1 h-px bg-ds-primary/40" />
                      </div>
                    )}
                    <MessageBubble
                      message={message}
                      isOwn={String(message.sender.id) === currentUserId}
                      token={token}
                      searchQuery={searchQuery}
                      senderOnline={senderOnlineMap[message.sender.id]}
                      onToggleReaction={onToggleReaction}
                      onPinMessage={onPinMessage}
                      onOpenThread={onOpenThread}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <AnimatePresence>
          {typingText && (
            <motion.div key="typing-indicator" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
              <TypingIndicator text={typingText} />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </motion.div>
    </div>
  );
}

function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-ds-surface-hover border border-ds-border/30 w-fit">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-ds-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-ds-primary animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-ds-primary animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-ds-text-muted italic">{text}</span>
    </div>
  );
}
