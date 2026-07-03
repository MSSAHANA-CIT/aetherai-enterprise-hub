import { motion } from "framer-motion";
import {
  Bot,
  CheckSquare,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import Card from "../ui/Card";
import type { RecentActivityItem } from "../../lib/api";

interface RecentActivityTimelineProps {
  items: RecentActivityItem[];
  loading?: boolean;
}

const typeConfig: Record<
  RecentActivityItem["type"],
  { icon: typeof MessageSquare; gradient: string }
> = {
  message: { icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
  task: { icon: CheckSquare, gradient: "from-emerald-500 to-teal-500" },
  document: { icon: FileText, gradient: "from-rose-500 to-pink-500" },
  summary: { icon: Sparkles, gradient: "from-purple-500 to-indigo-500" },
  security: { icon: Shield, gradient: "from-amber-500 to-orange-500" },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function RecentActivityTimeline({ items, loading = false }: RecentActivityTimelineProps) {
  if (loading) {
    return (
      <Card variant="gradient" glow>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-white/[0.06]" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-white/[0.06]" />
                <div className="h-3 w-full rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayItems = items.length
    ? items
    : [
        {
          id: "empty",
          type: "security" as const,
          title: "No recent activity",
          description: "Create tasks, messages, or documents to see enterprise events here.",
          created_at: new Date().toISOString(),
        },
      ];

  return (
    <Card variant="gradient" glow>
      <div className="flex items-center gap-2.5 mb-5">
        <Bot className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Recent Activity</h3>
      </div>

      <div className="relative">
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/[0.06]" />

        <div className="space-y-4">
          {displayItems.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="relative flex gap-4 pl-1"
              >
                <div
                  className={`relative z-10 w-9 h-9 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <span className="text-[11px] text-gray-600 flex-shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
