import { motion } from "framer-motion";
import { Bot, FileText, Sparkles, Wand2 } from "lucide-react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import type { AIUsageAnalytics } from "../../lib/api";

interface AIUsagePanelProps {
  data: AIUsageAnalytics | null;
  loading?: boolean;
}

const statItems = [
  {
    key: "queries",
    label: "AI queries today",
    icon: Sparkles,
    getValue: (d: AIUsageAnalytics) => d.ai_queries_today,
    gradient: "from-aether-500 to-indigo-500",
  },
  {
    key: "docs",
    label: "Documents summarized",
    icon: FileText,
    getValue: (d: AIUsageAnalytics) => d.documents_summarized,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "summaries",
    label: "Meeting summaries",
    icon: Wand2,
    getValue: (d: AIUsageAnalytics) => d.summaries_generated,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    key: "tasks",
    label: "AI tasks generated",
    icon: Bot,
    getValue: (d: AIUsageAnalytics) => d.ai_tasks_generated,
    gradient: "from-emerald-500 to-teal-500",
  },
] as const;

export default function AIUsagePanel({ data, loading = false }: AIUsagePanelProps) {
  if (loading || !data) {
    return (
      <Card variant="gradient" glow className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-white/[0.06]" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const maxModeCount = Math.max(...data.ai_modes_used.map((m) => m.count), 1);

  return (
    <Card variant="gradient" glow className="h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <Bot className="w-5 h-5 text-aether-400" />
        <h3 className="font-semibold text-white">AI Usage</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-semibold text-white mt-1">{item.getValue(data)}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-5 border-t border-white/[0.08]">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Most used AI modes</p>
        <div className="space-y-3">
          {data.ai_modes_used.slice(0, 5).map((mode, index) => (
            <motion.div
              key={mode.mode}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-400">{mode.label}</span>
                <span className="text-sm font-medium text-white">{mode.count}</span>
              </div>
              <Progress
                value={mode.count}
                max={maxModeCount}
                gradient="from-aether-500 to-purple-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
