import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, FileUp, Sparkles, CheckCircle, Video, Shield } from "lucide-react";
import Card from "../ui/Card";
import LoadingState from "../ui/LoadingState";
import EmptyState from "../ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { api, type RecentActivityItem } from "../../lib/api";
import { staggerItem } from "../../lib/animations";

const typeConfig: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  document: { icon: FileUp, color: "text-blue-400", bg: "bg-blue-500/15" },
  ai: { icon: Sparkles, color: "text-aether-400", bg: "bg-aether-500/15" },
  task: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  meeting: { icon: Video, color: "text-purple-400", bg: "bg-purple-500/15" },
  summary: { icon: Sparkles, color: "text-aether-400", bg: "bg-aether-500/15" },
  message: { icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  security: { icon: Shield, color: "text-amber-400", bg: "bg-amber-500/15" },
};

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return date.toLocaleDateString();
}

export default function ActivityFeed() {
  const { token } = useAuth();
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api.getAnalyticsOverview(token).then((data) => {
      setItems(data.recent_activity ?? []);
      setLoading(false);
    });
  }, [token]);

  return (
    <motion.div variants={staggerItem}>
      <Card variant="glass" className="h-full">
        <div className="flex items-center gap-2.5 mb-5">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Live Activity Feed</h3>
        </div>

        {loading ? (
          <LoadingState message="Loading activity..." className="py-6" size="sm" />
        ) : items.length === 0 ? (
          <EmptyState title="No recent activity" description="Actions will appear here as your team works." className="py-6" />
        ) : (
          <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
            {items.map((item, i) => {
              const config = typeConfig[item.type] ?? typeConfig.ai;
              const Icon = config.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{formatTime(item.created_at)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
