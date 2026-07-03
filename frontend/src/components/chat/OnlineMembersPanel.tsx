import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Avatar from "../ui/Avatar";
import type { OnlineUser } from "../../hooks/useChatSocket";
import type { PresenceUser } from "../../lib/api";
import { getAvatarGradient, getInitials } from "../../lib/chatUtils";
import { cn } from "../../lib/utils";

interface OnlineMembersPanelProps {
  onlineUsers: OnlineUser[];
  presenceUsers?: PresenceUser[];
  currentUserId?: string;
  onMessageUser?: (userId: number) => void;
  messagingUserId?: number | null;
}

function formatPresenceLabel(user: PresenceUser): string {
  if (user.is_online) {
    if (user.active_channel?.startsWith("channel-")) {
      return "Online";
    }
    return "Online";
  }
  return user.last_seen ?? "Offline";
}

export default function OnlineMembersPanel({
  onlineUsers,
  presenceUsers = [],
  currentUserId,
  onMessageUser,
  messagingUserId = null,
}: OnlineMembersPanelProps) {
  const displayUsers: Array<{
    id: number;
    full_name: string;
    is_online: boolean;
    statusLabel: string;
  }> =
    presenceUsers.length > 0
      ? presenceUsers.map((user) => ({
          id: user.id,
          full_name: user.full_name,
          is_online: user.is_online,
          statusLabel: formatPresenceLabel(user),
        }))
      : onlineUsers.map((user) => ({
          id: user.id,
          full_name: user.full_name,
          is_online: true,
          statusLabel: "Online",
        }));

  const onlineCount = displayUsers.filter((user) => user.is_online).length;
  const onlineMembers = displayUsers.filter((user) => user.is_online);
  const offlineMembers = displayUsers.filter((user) => !user.is_online);

  return (
    <aside className="hidden xl:flex w-64 flex-shrink-0 flex-col rounded-2xl border border-white/[0.08] bg-surface-card/60 backdrop-blur-xl overflow-hidden shadow-card">
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">Team Members</h2>
        <p className="text-xs text-gray-500 mt-1">
          {onlineCount} online · {displayUsers.length} total
        </p>
        <p className="text-[11px] text-aether-400/80 mt-2 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          Tap anyone to message
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {displayUsers.length === 0 ? (
          <p className="text-xs text-gray-500 px-2 py-4">No team members found.</p>
        ) : (
          <>
            {onlineMembers.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 px-2 mb-2">
                  Online — {onlineMembers.length}
                </p>
                <div className="space-y-1">
                  {onlineMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isSelf={String(member.id) === currentUserId}
                      isLoading={messagingUserId === member.id}
                      onMessageUser={onMessageUser}
                    />
                  ))}
                </div>
              </div>
            )}

            {offlineMembers.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-2 mb-2">
                  Offline — {offlineMembers.length}
                </p>
                <div className="space-y-1">
                  {offlineMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isSelf={String(member.id) === currentUserId}
                      isLoading={messagingUserId === member.id}
                      onMessageUser={onMessageUser}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function MemberRow({
  member,
  isSelf,
  isLoading,
  onMessageUser,
}: {
  member: { id: number; full_name: string; is_online: boolean; statusLabel: string };
  isSelf: boolean;
  isLoading: boolean;
  onMessageUser?: (userId: number) => void;
}) {
  const initials = getInitials(member.full_name);
  const gradient = getAvatarGradient(member.id);
  const canMessage = !isSelf && onMessageUser;

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      disabled={!canMessage || isLoading}
      onClick={() => canMessage && onMessageUser(member.id)}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors",
        canMessage
          ? "hover:bg-aether-500/10 hover:border-aether-500/20 border border-transparent cursor-pointer group"
          : "hover:bg-white/[0.04] border border-transparent cursor-default",
        isLoading && "opacity-60"
      )}
    >
      <Avatar
        initials={initials}
        gradient={gradient}
        size="sm"
        online={member.is_online}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate">{member.full_name}</p>
        <p
          className={cn(
            "text-[11px] truncate",
            member.is_online ? "text-emerald-400" : "text-gray-500"
          )}
        >
          {isSelf ? "You" : member.statusLabel}
        </p>
      </div>
      {canMessage && (
        <MessageCircle
          className={cn(
            "w-4 h-4 flex-shrink-0 text-gray-600 transition-colors",
            "group-hover:text-aether-400"
          )}
        />
      )}
    </motion.button>
  );
}
