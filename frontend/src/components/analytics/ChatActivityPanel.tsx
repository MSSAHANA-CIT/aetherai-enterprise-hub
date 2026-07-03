import { motion } from "framer-motion";
import { Hash, MessageSquare, Users } from "lucide-react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import type { AnalyticsOverview, ApiChannel } from "../../lib/api";

interface ChatActivityPanelProps {
  overview: AnalyticsOverview | null;
  channels: ApiChannel[];
  loading?: boolean;
}

function getCollaborationScore(overview: AnalyticsOverview): number {
  if (overview.total_users === 0) return 0;
  const raw = (overview.total_messages / overview.total_users) * 12;
  return Math.min(100, Math.round(raw));
}

function getMostActiveChannel(channels: ApiChannel[]): string {
  if (!channels.length) return "No channels yet";

  const sorted = [...channels].sort((a, b) => {
    const aTime = a.last_activity ? new Date(a.last_activity).getTime() : 0;
    const bTime = b.last_activity ? new Date(b.last_activity).getTime() : 0;
    return bTime - aTime;
  });

  return sorted[0]?.name ?? "No channels yet";
}

export default function ChatActivityPanel({
  overview,
  channels,
  loading = false,
}: ChatActivityPanelProps) {
  if (loading || !overview) {
    return (
      <Card variant="gradient" glow className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded bg-white/[0.06]" />
          <div className="h-24 rounded-xl bg-white/[0.06]" />
        </div>
      </Card>
    );
  }

  const collaborationScore = getCollaborationScore(overview);
  const mostActiveChannel = getMostActiveChannel(channels);

  const stats = [
    { label: "Total channels", value: overview.total_channels, icon: Hash },
    { label: "Total messages", value: overview.total_messages, icon: MessageSquare },
    { label: "Active users", value: overview.total_users, icon: Users },
  ];

  return (
    <Card variant="gradient" glow className="h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Chat Activity</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
            >
              <Icon className="w-4 h-4 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active collaboration score</span>
            <span className="text-sm font-semibold text-white">{collaborationScore}%</span>
          </div>
          <Progress value={collaborationScore} gradient="from-blue-500 to-cyan-500" />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Most active channel</p>
          <p className="text-sm font-medium text-white">#{mostActiveChannel}</p>
        </div>
      </div>
    </Card>
  );
}
