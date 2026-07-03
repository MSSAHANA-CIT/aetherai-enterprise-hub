import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelRight, X } from "lucide-react";
import WorkspaceRail from "./WorkspaceRail";
import ChannelSidebar from "./ChannelSidebar";
import ChatDetailsPanel from "./ChatDetailsPanel";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import ThreadPanel from "./ThreadPanel";
import { ChatLoader } from "../../design/components/Loading";
import type { ApiChannel, ApiMessage, PresenceUser } from "../../lib/api";
import type { ConnectionStatus, OnlineUser, TypingUser } from "../../hooks/useChatSocket";
import { cn } from "../../lib/utils";

interface ChatLayoutProps {
  channels: ApiChannel[];
  dmChannels: ApiChannel[];
  selectedChannel: ApiChannel | null;
  messages: ApiMessage[];
  filteredMessages: ApiMessage[];
  searchQuery: string;
  currentUserId: string;
  currentUserName?: string;
  loading: boolean;
  sending: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  onlineUsers: OnlineUser[];
  presenceUsers?: PresenceUser[];
  workspaceOnlineCount?: number;
  typingUsers: TypingUser[];
  socketError: string | null;
  messagingUserId?: number | null;
  token?: string | null;
  pinnedMessages: ApiMessage[];
  loadingPinned?: boolean;
  activeThread: ApiMessage | null;
  aiInsights?: {
    health: string;
    actionItems: string[];
    decisions: string[];
    loading?: boolean;
  };
  onSelectChannel: (channel: ApiChannel) => void;
  onMessageUser: (userId: number) => void;
  onSendMessage: (content: string) => Promise<void>;
  onSendReply: (content: string, parentMessageId: number) => Promise<void>;
  onSendFile?: (file: File, caption?: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onSummarize?: () => void;
  onCreateTasks?: () => void;
  onSearchChange: (query: string) => void;
  onToggleReaction: (messageId: number, emoji: string) => void;
  onPinMessage: (messageId: number) => void;
  onOpenThread: (message: ApiMessage) => void;
  onCloseThread: () => void;
  summarizing?: boolean;
  senderOnlineMap?: Record<number, boolean>;
}

export default function ChatLayout({
  channels,
  dmChannels,
  selectedChannel,
  messages,
  filteredMessages,
  searchQuery,
  currentUserId,
  currentUserName,
  loading,
  sending,
  error,
  connectionStatus,
  onlineUsers,
  presenceUsers = [],
  workspaceOnlineCount,
  typingUsers,
  socketError,
  messagingUserId = null,
  token = null,
  pinnedMessages,
  loadingPinned = false,
  activeThread,
  aiInsights,
  onSelectChannel,
  onMessageUser,
  onSendMessage,
  onSendReply,
  onSendFile,
  onTyping,
  onSummarize,
  onCreateTasks,
  onSearchChange,
  onToggleReaction,
  onPinMessage,
  onOpenThread,
  onCloseThread,
  summarizing = false,
  senderOnlineMap = {},
}: ChatLayoutProps) {
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isDm = selectedChannel?.channel_type === "dm";
  const peerIsOnline =
    isDm && selectedChannel?.peer
      ? presenceUsers.find((user) => user.id === selectedChannel.peer?.id)?.is_online
      : undefined;

  const chatTitle = isDm
    ? selectedChannel?.peer?.full_name ?? "Direct Message"
    : selectedChannel?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-[calc(100vh-7.5rem)] max-w-[1800px] mx-auto"
    >
      <div className="flex h-full gap-2 lg:gap-3">
        <WorkspaceRail />

        {/* Mobile channel drawer toggle */}
        <button
          type="button"
          className="md:hidden fixed bottom-24 left-4 z-30 p-3 rounded-full bg-ds-primary text-white shadow-ds-glow-sm"
          onClick={() => setChannelsOpen(true)}
          aria-label="Open channels"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Panel 2 — Channels */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300",
            "fixed md:relative inset-y-0 left-0 z-40 md:z-auto",
            "md:block w-72",
            channelsOpen ? "block" : "hidden md:block"
          )}
        >
          {channelsOpen && (
            <button
              type="button"
              className="md:hidden fixed inset-0 bg-black/50 z-[-1]"
              onClick={() => setChannelsOpen(false)}
              aria-label="Close channels"
            />
          )}
          <ChannelSidebar
            channels={channels}
            dmChannels={dmChannels}
            presenceUsers={presenceUsers}
            selectedChannelId={selectedChannel?.id ?? null}
            onSelectChannel={(ch) => {
              onSelectChannel(ch);
              setChannelsOpen(false);
            }}
            onStartDm={() => setDetailsOpen(true)}
          />
        </div>

        {/* Panel 3 — Main conversation */}
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-ds-border/40 bg-ds-surface/50 backdrop-blur-xl overflow-hidden shadow-ds-card relative">
          {connectionStatus === "live" && (
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none z-10" />
          )}

          <div className="flex items-center gap-2 px-2 pt-2 lg:hidden">
            <button
              type="button"
              onClick={() => setChannelsOpen(true)}
              className="p-2 rounded-lg text-ds-text-muted hover:bg-ds-surface-hover"
              aria-label="Channels"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="p-2 rounded-lg text-ds-text-muted hover:bg-ds-surface-hover ml-auto"
              aria-label="Details"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>

          <ChatHeader
            channel={selectedChannel}
            onlineUsers={onlineUsers}
            workspaceOnlineCount={workspaceOnlineCount}
            peerIsOnline={peerIsOnline}
            connectionStatus={connectionStatus}
            socketError={socketError}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchResultCount={searchQuery.trim() ? filteredMessages.length : undefined}
            onSummarize={onSummarize}
            summarizing={summarizing}
            onShowPinned={() => setDetailsOpen(true)}
          />

          <MessageList
            messages={filteredMessages}
            allMessages={messages}
            searchQuery={searchQuery}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            token={token}
            loading={loading}
            error={error}
            channelName={chatTitle}
            typingUsers={typingUsers}
            senderOnlineMap={senderOnlineMap}
            onToggleReaction={onToggleReaction}
            onPinMessage={onPinMessage}
            onOpenThread={onOpenThread}
          />

          <MessageComposer
            onSend={onSendMessage}
            onSendFile={onSendFile}
            onTyping={onTyping}
            token={token}
            channelId={selectedChannel?.id}
            disabled={!selectedChannel || sending}
            sending={sending}
            placeholder={
              isDm
                ? `Message ${selectedChannel?.peer?.full_name ?? "user"}...`
                : undefined
            }
          />

          <AnimatePresence>
            {activeThread && selectedChannel && (
              <ThreadPanel
                parentMessage={activeThread}
                channelId={selectedChannel.id}
                currentUserId={currentUserId}
                token={token}
                onClose={onCloseThread}
                onSendReply={onSendReply}
                sending={sending}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Panel 4 — Details */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300",
            "fixed lg:relative inset-y-0 right-0 z-40 lg:z-auto",
            "w-72 xl:w-80",
            detailsOpen ? "block" : "hidden lg:block"
          )}
        >
          {detailsOpen && (
            <button
              type="button"
              className="lg:hidden fixed inset-0 bg-black/50 z-[-1]"
              onClick={() => setDetailsOpen(false)}
              aria-label="Close details"
            />
          )}
          <div className="h-full relative">
            <button
              type="button"
              className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-ds-surface-elevated text-ds-text-muted"
              onClick={() => setDetailsOpen(false)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <ChatDetailsPanel
              className="h-full"
              selectedChannel={selectedChannel}
              presenceUsers={presenceUsers}
              onlineUsers={onlineUsers}
              currentUserId={currentUserId}
              pinnedMessages={pinnedMessages}
              loadingPinned={loadingPinned}
              token={token}
              messagingUserId={messagingUserId}
              aiInsights={aiInsights}
              onMessageUser={onMessageUser}
              onSummarize={onSummarize}
              onCreateTasks={onCreateTasks}
              summarizing={summarizing}
              onClose={() => setDetailsOpen(false)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ChatLayoutSkeleton() {
  return (
    <div className="h-[calc(100vh-7.5rem)] flex items-center justify-center">
      <ChatLoader />
    </div>
  );
}
