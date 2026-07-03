import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import Card from "../ui/Card";
import { staggerItem } from "../../lib/animations";
import type { AnalyticsOverview } from "../../lib/api";

interface EnterpriseKPICardsProps {
  overview: AnalyticsOverview | null;
  loading?: boolean;
}

const kpiConfig = [
  {
    key: "employees",
    label: "Employees",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    getValue: (o: AnalyticsOverview) => o.total_users,
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessageSquare,
    gradient: "from-indigo-500 to-purple-500",
    getValue: (o: AnalyticsOverview) => o.total_messages,
  },
  {
    key: "open-tasks",
    label: "Open Tasks",
    icon: ClipboardList,
    gradient: "from-amber-500 to-orange-500",
    getValue: (o: AnalyticsOverview) => o.open_tasks,
  },
  {
    key: "completed-tasks",
    label: "Completed Tasks",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-500",
    getValue: (o: AnalyticsOverview) => o.completed_tasks,
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileText,
    gradient: "from-rose-500 to-pink-500",
    getValue: (o: AnalyticsOverview) => o.total_documents,
  },
  {
    key: "ai-actions",
    label: "AI Actions",
    icon: Bot,
    gradient: "from-aether-500 to-violet-500",
    getValue: (o: AnalyticsOverview) => o.ai_generated_tasks + o.total_summaries,
  },
] as const;

function SkeletonCard() {
  return (
    <Card variant="glass" className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />
        <div className="h-3 w-20 rounded bg-white/[0.06]" />
        <div className="h-7 w-16 rounded bg-white/[0.08]" />
      </div>
    </Card>
  );
}

export default function EnterpriseKPICards({ overview, loading = false }: EnterpriseKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiConfig.map((item) => (
          <SkeletonCard key={item.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiConfig.map((item, index) => {
        const Icon = item.icon;
        const value = overview ? item.getValue(overview) : 0;

        return (
          <motion.div
            key={item.key}
            variants={staggerItem}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card variant="gradient" glow className="p-5 h-full hover:shadow-glow transition-shadow">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 shadow-glow-sm`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{item.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{value.toLocaleString()}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
