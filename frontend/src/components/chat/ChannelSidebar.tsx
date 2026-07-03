import { motion } from "framer-motion";
import { Hash, MessageCircle, Plus, UserPlus } from "lucide-react";
import { cn } from "../../lib/utils";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import type { ApiChannel, PresenceUser } from "../../lib/api";
import { getAvatarGradient, getInitials } from "../../lib/chatUtils";
import { staggerContainer, staggerItem } from "../../lib/animations";
import { useComingSoon } from "../../context/ComingSoonContext";

interface ChannelSidebarProps {
  channels: ApiChannel[];
  dmChannels: ApiChannel[];
  presenceUsers?: PresenceUser[];
  selectedChannelId: number | null;
  onSelectChannel: (channel: ApiChannel) => void;
  onStartDm?: () => void;
}

function getDmDisplayName(channel: ApiChannel): string {
  return channel.peer?.full_name ?? "Direct Message";
}

function getPeerOnline(channel: ApiChannel, presenceUsers: PresenceUser[]): boolean | undefined {
  if (!channel.peer) return undefined;
  return presenceUsers.find((u) => u.id === channel.peer?.id)?.is_online;
}

export default function ChannelSidebar({
  channels,
  dmChannels,
  presenceUsers = [],
  selectedChannelId,
  onSelectChannel,
  onStartDm,
}: ChannelSidebarProps) {
  const { openComingSoon } = useComingSoon();

  return (
    <aside className="w-72 h-full flex-shrink-0 flex flex-col rounded-2xl border border-ds-border/40 bg-ds-surface/60 backdrop-blur-xl overflow-hidden shadow-ds-card">
      <div className="px-4 py-4 border-b border-ds-border/30">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ds-text-primary tracking-wide">Workspace</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onStartDm}
              className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors"
              aria-label="Start direct message"
              title="Start DM"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                openComingSoon({
                  title: "Create Channel",
                  description: "Custom channel creation with permissions and retention policies is coming soon.",
                  feature: "Team Chat",
                })
              }
              className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover transition-colors"
              aria-label="Create channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-ds-text-muted mt-1">Channels & direct messages</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-2 space-y-3 ds-scrollbar"
      >
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-ds-text-muted">Channels</p>
          {channels.map((channel) => {
            const isActive = channel.id === selectedChannelId;

            return (
              <motion.button
                key={channel.id}
                type="button"
                variants={staggerItem}
                onClick={() => onSelectChannel(channel)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-ds-primary/15 border border-ds-primary/25"
                    : "hover:bg-ds-surface-hover border border-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Hash className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-ds-primary" : "text-ds-text-muted")} />
                      <span className={cn("text-sm font-medium truncate", isActive ? "text-ds-text-primary" : "text-ds-text-secondary")}>
                        {channel.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-ds-text-muted line-clamp-1 pl-5">{channel.description}</p>
                    {channel.last_message_preview && (
                      <p className="text-[10px] text-ds-text-muted truncate mt-1 pl-5">{channel.last_message_preview}</p>
                    )}
                  </div>
                  {channel.unread_count > 0 && (
                    <Badge variant="info" className="flex-shrink-0 text-[10px] px-1.5 py-0.5 min-w-[20px] justify-center">
                      {channel.unread_count}
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-ds-primary/80">Direct Messages</p>
          {dmChannels.length > 0 ? (
            dmChannels.map((channel) => {
              const isActive = channel.id === selectedChannelId;
              const displayName = getDmDisplayName(channel);
              const initials = getInitials(displayName);
              const gradient = getAvatarGradient(channel.peer?.id ?? channel.id);
              const peerOnline = getPeerOnline(channel, presenceUsers);

              return (
                <motion.button
                  key={channel.id}
                  type="button"
                  variants={staggerItem}
                  onClick={() => onSelectChannel(channel)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-ds-primary/15 border border-ds-primary/25"
                      : "hover:bg-ds-surface-hover border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={initials} gradient={gradient} size="sm" online={peerOnline} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-medium truncate", isActive ? "text-ds-text-primary" : "text-ds-text-secondary")}>
                          {displayName}
                        </span>
                        {channel.last_activity && (
                          <span className="text-[10px] text-ds-text-muted flex-shrink-0">{channel.last_activity}</span>
                        )}
                      </div>
                      {channel.last_message_preview && (
                        <p className="text-xs text-ds-text-muted truncate mt-0.5">{channel.last_message_preview}</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="mx-2 px-3 py-4 rounded-xl border border-dashed border-ds-border/40 bg-ds-surface-hover/30">
              <div className="flex items-center gap-2 text-ds-text-muted mb-1">
                <MessageCircle className="w-4 h-4 text-ds-primary" />
                <span className="text-xs font-medium">No direct messages yet</span>
              </div>
              <p className="text-[11px] text-ds-text-muted leading-relaxed">
                Tap a team member in the details panel to start chatting.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </aside>
  );
}
