import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Bot, CheckSquare, FileSearch } from "lucide-react";
import Card from "../ui/Card";
import LoadingState from "../ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { api, type AnalyticsOverview } from "../../lib/api";
import { staggerContainer, staggerItem } from "../../lib/animations";

export default function MetricCards() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api.getAnalyticsOverview(token).then(setOverview).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <LoadingState message="Loading live metrics..." className="py-8" size="sm" />;
  }

  const metrics = [
    {
      id: "users",
      label: "Team Members",
      value: String(overview?.total_users ?? 0),
      change: "Live",
      trend: "up" as const,
      icon: Users,
    },
    {
      id: "ai",
      label: "AI Summaries",
      value: String(overview?.total_summaries ?? 0),
      change: "Live",
      trend: "up" as const,
      icon: Bot,
    },
    {
      id: "tasks",
      label: "Open Tasks",
      value: String(overview?.open_tasks ?? 0),
      change: `${overview?.completed_tasks ?? 0} done`,
      trend: "down" as const,
      icon: CheckSquare,
    },
    {
      id: "docs",
      label: "Documents",
      value: String(overview?.total_documents ?? 0),
      change: "Live",
      trend: "up" as const,
      icon: FileSearch,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <motion.div key={metric.id} variants={staggerItem}>
            <Card variant="glass" glow className="p-5 hover:bg-white/[0.04] group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:bg-aether-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-aether-400" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
