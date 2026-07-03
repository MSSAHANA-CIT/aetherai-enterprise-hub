import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Pin,
  Sparkles,
  MessageCircle,
  Upload,
  Loader2,
  CheckSquare,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useComingSoon } from "../../context/ComingSoonContext";
import type { ApiChannel, ApiMessage, PresenceUser } from "../../lib/api";
import type { OnlineUser } from "../../hooks/useChatSocket";
import { getAvatarGradient, getInitials } from "../../lib/chatUtils";
import { cn } from "../../lib/utils";

type DetailsTab = "members" | "files" | "pinned" | "ai";

interface ChatDetailsPanelProps {
  selectedChannel: ApiChannel | null;
  presenceUsers: PresenceUser[];
  onlineUsers: OnlineUser[];
  currentUserId: string;
  pinnedMessages: ApiMessage[];
  loadingPinned?: boolean;
  token?: string | null;
  messagingUserId?: number | null;
  aiInsights?: {
    health: string;
    actionItems: string[];
    decisions: string[];
    loading?: boolean;
  };
  onMessageUser?: (userId: number) => void;
  onSummarize?: () => void;
  onCreateTasks?: () => void;
  onClose?: () => void;
  summarizing?: boolean;
  className?: string;
}

const TABS: { id: DetailsTab; label: string; icon: typeof Users }[] = [
  { id: "members", label: "Members", icon: Users },
  { id: "files", label: "Files", icon: FileText },
  { id: "pinned", label: "Pinned", icon: Pin },
  { id: "ai", label: "AI Insights", icon: Sparkles },
];

export default function ChatDetailsPanel({
  selectedChannel,
  presenceUsers,
  onlineUsers,
  currentUserId,
  pinnedMessages,
  loadingPinned = false,
  messagingUserId = null,
  aiInsights,
  onMessageUser,
  onSummarize,
  onCreateTasks,
  onClose,
  summarizing = false,
  className,
}: ChatDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>("members");
  const { openComingSoon } = useComingSoon();

  useEffect(() => {
    setActiveTab("members");
  }, [selectedChannel?.id]);

  const displayUsers =
    presenceUsers.length > 0
      ? presenceUsers
      : onlineUsers.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email ?? "",
          role: u.role ?? "employee",
          is_online: true,
          active_channel: null,
          last_seen: null,
          department: undefined,
        }));

  const onlineMembers = displayUsers.filter((u) => u.is_online);
  const offlineMembers = displayUsers.filter((u) => !u.is_online);

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl border border-ds-border/40 bg-ds-surface/60 backdrop-blur-xl overflow-hidden shadow-ds-card",
        className
      )}
    >
      <div className="px-3 py-3 border-b border-ds-border/30">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-ds-primary/15 text-ds-primary-300"
                  : "text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-surface-hover"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ds-scrollbar">
        {activeTab === "members" && (
          <MembersTab
            onlineMembers={onlineMembers}
            offlineMembers={offlineMembers}
            currentUserId={currentUserId}
            messagingUserId={messagingUserId}
            onMessageUser={onMessageUser}
          />
        )}

        {activeTab === "files" && (
          <FilesTab
            onUpload={() =>
              openComingSoon({
                title: "Upload to Channel",
                description: "Use the paperclip in the message composer to share files in this channel.",
                feature: "Team Chat",
              })
            }
          />
        )}

        {activeTab === "pinned" && (
          <PinnedTab messages={pinnedMessages} loading={loadingPinned} channelName={selectedChannel?.name} />
        )}

        {activeTab === "ai" && (
          <AIInsightsTab
            insights={aiInsights}
            onSummarize={onSummarize}
            onCreateTasks={onCreateTasks}
            summarizing={summarizing}
            isDm={selectedChannel?.channel_type === "dm"}
          />
        )}
      </div>

      {onClose && (
        <div className="p-2 border-t border-ds-border/30 lg:hidden">
          <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
            Close panel
          </Button>
        </div>
      )}
    </aside>
  );
}

function MembersTab({
  onlineMembers,
  offlineMembers,
  currentUserId,
  messagingUserId,
  onMessageUser,
}: {
  onlineMembers: PresenceUser[];
  offlineMembers: PresenceUser[];
  currentUserId: string;
  messagingUserId: number | null;
  onMessageUser?: (userId: number) => void;
}) {
  return (
    <div className="p-3 space-y-3">
      <p className="text-[11px] text-ds-text-muted flex items-center gap-1.5 px-1">
        <MessageCircle className="w-3.5 h-3.5 text-ds-primary" />
        Tap anyone to message
      </p>

      {onlineMembers.length > 0 && (
        <section>
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
        </section>
      )}

      {offlineMembers.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ds-text-muted px-2 mb-2">
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
        </section>
      )}
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  isLoading,
  onMessageUser,
}: {
  member: PresenceUser;
  isSelf: boolean;
  isLoading: boolean;
  onMessageUser?: (userId: number) => void;
}) {
  const canMessage = !isSelf && onMessageUser;

  return (
    <motion.button
      type="button"
      layout
      disabled={!canMessage || isLoading}
      onClick={() => canMessage && onMessageUser(member.id)}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors",
        canMessage ? "hover:bg-ds-primary/10 cursor-pointer group" : "cursor-default",
        isLoading && "opacity-60"
      )}
    >
      <Avatar
        initials={getInitials(member.full_name)}
        gradient={getAvatarGradient(member.id)}
        size="sm"
        online={member.is_online}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ds-text-primary truncate">{member.full_name}</p>
        <p className="text-[11px] text-ds-text-muted truncate capitalize">
          {member.role}
          {member.department ? ` · ${member.department}` : ""}
        </p>
        <p className={cn("text-[10px] truncate", member.is_online ? "text-emerald-400" : "text-ds-text-muted")}>
          {isSelf ? "You" : member.is_online ? "Online" : member.last_seen ?? "Offline"}
        </p>
      </div>
    </motion.button>
  );
}

function FilesTab({ onUpload }: { onUpload: () => void }) {
  const placeholders = [
    { name: "Q3-Roadmap.pdf", size: "2.4 MB", user: "Product Team" },
    { name: "Architecture-v2.png", size: "890 KB", user: "Engineering" },
    { name: "Standup-notes.docx", size: "124 KB", user: "General" },
  ];

  return (
    <div className="p-3 space-y-3">
      <Button variant="secondary" size="sm" className="w-full" onClick={onUpload}>
        <Upload className="w-4 h-4" />
        Upload file
      </Button>
      <p className="text-[11px] text-ds-text-muted px-1">Shared files in this channel</p>
      <div className="space-y-2">
        {placeholders.map((file) => (
          <div
            key={file.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ds-border/30 bg-ds-surface-hover/40"
          >
            <FileText className="w-4 h-4 text-ds-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ds-text-primary truncate">{file.name}</p>
              <p className="text-[10px] text-ds-text-muted">
                {file.size} · {file.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PinnedTab({
  messages,
  loading,
  channelName,
}: {
  messages: ApiMessage[];
  loading: boolean;
  channelName?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-ds-primary animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-6 text-center">
        <Pin className="w-8 h-8 text-ds-text-muted mx-auto mb-2 opacity-50" />
        <p className="text-sm text-ds-text-secondary">No pinned messages</p>
        <p className="text-xs text-ds-text-muted mt-1">
          Pin important messages in {channelName ? `#${channelName}` : "this channel"} from the message menu.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {messages.map((msg) => (
        <div key={msg.id} className="px-3 py-2.5 rounded-xl border border-ds-border/30 bg-ds-surface-hover/40">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-medium text-ds-text-primary">{msg.sender.full_name}</span>
            <span className="text-[10px] text-ds-text-muted capitalize">{msg.sender.role}</span>
          </div>
          <p className="text-sm text-ds-text-secondary line-clamp-3">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

function AIInsightsTab({
  insights,
  onSummarize,
  onCreateTasks,
  summarizing,
  isDm,
}: {
  insights?: ChatDetailsPanelProps["aiInsights"];
  onSummarize?: () => void;
  onCreateTasks?: () => void;
  summarizing?: boolean;
  isDm?: boolean;
}) {
  return (
    <div className="p-3 space-y-4">
      <section className="rounded-xl border border-ds-border/30 bg-ds-surface-hover/30 p-3">
        <h4 className="text-xs font-semibold text-ds-text-primary mb-2">Conversation health</h4>
        {insights?.loading ? (
          <Loader2 className="w-4 h-4 text-ds-primary animate-spin" />
        ) : (
          <p className="text-sm text-ds-text-secondary">{insights?.health ?? "Active collaboration with steady engagement."}</p>
        )}
      </section>

      <section className="rounded-xl border border-ds-border/30 bg-ds-surface-hover/30 p-3">
        <h4 className="text-xs font-semibold text-ds-text-primary mb-2">Suggested action items</h4>
        {(insights?.actionItems ?? ["Review open threads", "Follow up on pending decisions"]).map((item) => (
          <p key={item} className="text-sm text-ds-text-secondary flex items-start gap-2 mb-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-ds-primary mt-0.5 flex-shrink-0" />
            {item}
          </p>
        ))}
      </section>

      <section className="rounded-xl border border-ds-border/30 bg-ds-surface-hover/30 p-3">
        <h4 className="text-xs font-semibold text-ds-text-primary mb-2">Possible decisions</h4>
        {(insights?.decisions ?? ["No formal decisions detected yet"]).map((item) => (
          <p key={item} className="text-sm text-ds-text-secondary mb-1">
            · {item}
          </p>
        ))}
      </section>

      <div className="space-y-2">
        {!isDm && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={onSummarize}
            disabled={summarizing || !onSummarize}
          >
            {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate summary
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full" onClick={onCreateTasks}>
          <CheckSquare className="w-4 h-4" />
          Create tasks from conversation
        </Button>
      </div>
    </div>
  );
}
