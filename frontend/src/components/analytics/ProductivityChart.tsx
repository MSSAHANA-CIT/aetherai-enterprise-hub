import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import type { ProductivityAnalytics } from "../../lib/api";

interface ProductivityChartProps {
  data: ProductivityAnalytics | null;
  loading?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "from-gray-400 to-gray-500",
  in_progress: "from-blue-500 to-cyan-500",
  review: "from-amber-500 to-orange-500",
  done: "from-emerald-500 to-teal-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "from-slate-400 to-slate-500",
  medium: "from-indigo-500 to-blue-500",
  high: "from-orange-500 to-amber-500",
  urgent: "from-rose-500 to-red-500",
};

function CircularScore({ value, label, gradient }: { value: number; label: string; gradient: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`text-transparent bg-gradient-to-r ${gradient}`} stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">{label}</p>
    </div>
  );
}

function BarGroup({
  title,
  items,
  colors,
  labels,
}: {
  title: string;
  items: Record<string, number>;
  colors: Record<string, string>;
  labels: Record<string, string>;
}) {
  const max = Math.max(...Object.values(items), 1);

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">{title}</p>
      <div className="space-y-3">
        {Object.entries(items).map(([key, count], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-400">{labels[key] ?? key}</span>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
            <Progress value={count} max={max} gradient={colors[key] ?? "from-aether-500 to-indigo-400"} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ProductivityChart({ data, loading = false }: ProductivityChartProps) {
  if (loading || !data) {
    return (
      <Card variant="gradient" glow className="h-full">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-40 rounded bg-white/[0.06]" />
          <div className="h-28 w-28 rounded-full bg-white/[0.06] mx-auto" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded bg-white/[0.06]" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="gradient" glow className="h-full">
      <div className="flex items-center gap-2.5 mb-6">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-white">Productivity</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center justify-center gap-6 lg:border-r lg:border-white/[0.06] lg:pr-6">
          <CircularScore
            value={data.productivity_score}
            label="Productivity Score"
            gradient="from-emerald-500 to-teal-400"
          />
          <div className="w-full space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Task completion rate</span>
                <span className="text-sm font-semibold text-white">{data.task_completion_rate}%</span>
              </div>
              <Progress value={data.task_completion_rate} gradient="from-emerald-500 to-teal-400" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">AI automation score</span>
                <span className="text-sm font-semibold text-white">{data.ai_automation_score}%</span>
              </div>
              <Progress value={data.ai_automation_score} gradient="from-purple-500 to-pink-400" />
            </div>
          </div>
        </div>

        <BarGroup
          title="Tasks by status"
          items={data.tasks_by_status}
          colors={STATUS_COLORS}
          labels={STATUS_LABELS}
        />

        <BarGroup
          title="Tasks by priority"
          items={data.tasks_by_priority}
          colors={PRIORITY_COLORS}
          labels={PRIORITY_LABELS}
        />
      </div>
    </Card>
  );
}
