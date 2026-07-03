import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  Search,
  Sparkles,
  WifiOff,
  Loader2,
  Pin,
  Video,
  MoreHorizontal,
  X,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { useComingSoon } from "../../context/ComingSoonContext";
import type { ApiChannel } from "../../lib/api";
import type { ConnectionStatus, OnlineUser } from "../../hooks/useChatSocket";
import { getAvatarGradient, getInitials } from "../../lib/chatUtils";
import { cn } from "../../lib/utils";

interface ChatHeaderProps {
  channel: ApiChannel | null;
  onlineUsers?: OnlineUser[];
  workspaceOnlineCount?: number;
  peerIsOnline?: boolean;
  connectionStatus?: ConnectionStatus;
  socketError?: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchResultCount?: number;
  onSummarize?: () => void;
  summarizing?: boolean;
  onShowPinned?: () => void;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  live: {
    label: "Live",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pulse: true,
  },
  connecting: {
    label: "Connecting",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  offline: {
    label: "Offline",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  },
};

export default function ChatHeader({
  channel,
  onlineUsers = [],
  workspaceOnlineCount,
  peerIsOnline,
  connectionStatus = "offline",
  socketError,
  searchQuery = "",
  onSearchChange,
  searchResultCount,
  onSummarize,
  summarizing = false,
  onShowPinned,
}: ChatHeaderProps) {
  const { openComingSoon } = useComingSoon();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  if (!channel) {
    return (
      <div className="px-4 lg:px-6 py-4 border-b border-ds-border/30 bg-ds-surface-hover/20">
        <p className="text-sm text-ds-text-muted">Select a channel or tap someone to message</p>
      </div>
    );
  }

  const status = STATUS_CONFIG[connectionStatus];
  const isDm = channel.channel_type === "dm";
  const peerName = channel.peer?.full_name ?? "Direct Message";
  const onlineCount = workspaceOnlineCount ?? onlineUsers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 lg:px-6 py-3 border-b border-ds-border/30 bg-ds-surface-hover/20"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {isDm ? (
              <>
                <Avatar
                  initials={getInitials(peerName)}
                  gradient={getAvatarGradient(channel.peer?.id ?? channel.id)}
                  size="sm"
                  online={peerIsOnline}
                />
                <h1 className="text-base font-semibold text-ds-text-primary truncate">{peerName}</h1>
                {peerIsOnline !== undefined && (
                  <Badge variant="info" className="text-[10px]">
                    {peerIsOnline ? "Online" : "Offline"}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <Hash className="w-4 h-4 text-ds-primary flex-shrink-0" />
                <h1 className="text-base font-semibold text-ds-text-primary truncate">{channel.name}</h1>
                <Badge variant="info" className="text-[10px]">
                  {onlineCount} online
                </Badge>
              </>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                status.className
              )}
              title={socketError ?? `Connection: ${status.label}`}
            >
              {connectionStatus === "connecting" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : connectionStatus === "live" ? (
                <span className="relative flex h-1.5 w-1.5">
                  {status.pulse && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {status.label}
            </span>
          </div>
          <p className="text-xs text-ds-text-muted truncate">
            {isDm ? "Private conversation" : channel.description}
          </p>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen((v) => !v)}
            title="Search messages (⌘K)"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onShowPinned} title="Pinned messages">
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meetings", { state: { channelId: channel.id, channelName: channel.name } })}
            title="Start meeting"
          >
            <Video className="w-4 h-4" />
          </Button>
          {!isDm && (
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={onSummarize}
              disabled={summarizing || !onSummarize}
            >
              {summarizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="text-xs hidden md:inline">{summarizing ? "..." : "AI"}</span>
            </Button>
          )}
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setMoreOpen((v) => !v)}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {moreOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreOpen(false)}
                    aria-label="Close menu"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-1 z-50 w-48 py-1 rounded-xl border border-ds-border/40 bg-ds-surface-elevated shadow-ds-card"
                  >
                    <MenuItem
                      label="Channel settings"
                      onClick={() => {
                        setMoreOpen(false);
                        openComingSoon({
                          title: "Channel Settings",
                          description: "Manage permissions, retention, and notifications.",
                          feature: "Team Chat",
                        });
                      }}
                    />
                    <MenuItem
                      label="Mute channel"
                      onClick={() => {
                        setMoreOpen(false);
                        openComingSoon({
                          title: "Mute Channel",
                          description: "Silence notifications for this channel.",
                          feature: "Team Chat",
                        });
                      }}
                    />
                    <MenuItem
                      label="Export history"
                      onClick={() => {
                        setMoreOpen(false);
                        openComingSoon({
                          title: "Export Chat History",
                          description: "Download channel messages as PDF or CSV.",
                          feature: "Team Chat",
                        });
                      }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ds-text-muted" />
              <input
                id="chat-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search messages, names, roles... (⌘K)"
                className="w-full pl-9 pr-9 py-2 rounded-xl text-sm bg-ds-surface-hover border border-ds-border/40 text-ds-text-primary placeholder:text-ds-text-muted focus:outline-none focus:border-ds-primary/40 focus:ring-1 focus:ring-ds-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-text-muted hover:text-ds-text-primary"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery.trim() && searchResultCount !== undefined && (
              <p className="text-[11px] text-ds-text-muted mt-1.5 px-1">
                {searchResultCount} {searchResultCount === 1 ? "result" : "results"} found
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-sm text-ds-text-secondary hover:bg-ds-surface-hover hover:text-ds-text-primary transition-colors"
    >
      {label}
    </button>
  );
}
