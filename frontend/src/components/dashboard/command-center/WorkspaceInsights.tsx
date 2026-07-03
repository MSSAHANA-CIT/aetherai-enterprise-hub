import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CheckSquare,
  FileUp,
  MessageSquare,
  Search,
  Target,
  Video,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import AnimatedCounter from "./shared/AnimatedCounter";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";
import { cn } from "../../../lib/utils";

function InsightsContent() {
  const { loading, overview, productivity, aiUsage, tasks } = useDashboardData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const completedToday = tasks.filter((t) => t.status === "done").length;
  const completionPct = Math.round(productivity?.task_completion_rate ?? 0);

  const widgets = [
    {
      id: "productivity",
      label: "Today's Productivity",
      value: Math.round(productivity?.productivity_score ?? 0),
      suffix: "%",
      icon: Target,
      color: "from-emerald-500/20 to-teal-500/10",
      href: "/analytics",
    },
    {
      id: "tasks",
      label: "Tasks Completed",
      value: completedToday,
      icon: CheckSquare,
      color: "from-blue-500/20 to-cyan-500/10",
      href: "/tasks",
    },
    {
      id: "meetings",
      label: "Meetings",
      value: overview?.total_summaries ?? 0,
      icon: Video,
      color: "from-purple-500/20 to-pink-500/10",
      href: "/meetings",
    },
    {
      id: "ai",
      label: "AI Requests",
      value: aiUsage?.ai_queries_today ?? 0,
      icon: Bot,
      color: "from-aether-500/20 to-indigo-500/10",
      href: "/ai",
    },
    {
      id: "docs",
      label: "Documents Uploaded",
      value: overview?.total_documents ?? 0,
      icon: FileUp,
      color: "from-amber-500/20 to-orange-500/10",
      href: "/knowledge",
    },
    {
      id: "search",
      label: "Knowledge Searches",
      value: aiUsage?.documents_summarized ?? 0,
      icon: Search,
      color: "from-cyan-500/20 to-blue-500/10",
      href: "/knowledge",
    },
    {
      id: "messages",
      label: "Messages Sent",
      value: overview?.total_messages ?? 0,
      icon: MessageSquare,
      color: "from-rose-500/20 to-red-500/10",
      href: "/chat",
    },
    {
      id: "completion",
      label: "Completion %",
      value: completionPct,
      suffix: "%",
      icon: BarChart3,
      color: "from-ds-primary/20 to-purple-500/10",
      href: "/analytics",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {widgets.map((w) => {
        const Icon = w.icon;
        return (
          <motion.div key={w.id} variants={staggerItem}>
            <button type="button" onClick={() => navigate(w.href)} className="w-full text-left">
              <DashboardCard
                variant="gradient"
                padding="md"
                className={cn("bg-gradient-to-br", w.color)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-ds-text-muted" />
                </div>
                <p className="text-2xl font-bold text-ds-text-primary">
                  <AnimatedCounter value={w.value} suffix={w.suffix ?? ""} />
                </p>
                <p className="text-xs text-ds-text-muted mt-1">{w.label}</p>
              </DashboardCard>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function WorkspaceInsights() {
  return (
    <section aria-label="Workspace insights">
      <SectionHeader title="Workspace Insights" subtitle="Analytics at a glance" />
      <LazySection>
        <InsightsContent />
      </LazySection>
    </section>
  );
}
