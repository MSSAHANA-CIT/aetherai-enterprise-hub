import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Target, TrendingUp, Zap } from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import AnimatedCounter from "./shared/AnimatedCounter";
import { Skeleton } from "../../../design/components/Loading";
import { fadeUp } from "../../../design/animations";

export default function PersonalProductivity() {
  const { loading, productivity, tasks, aiUsage } = useDashboardData();
  const navigate = useNavigate();

  const openTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done"),
    [tasks]
  );

  const currentGoal = openTasks[0]?.title ?? "Stay focused on high-impact work";

  if (loading) {
    return <Skeleton className="h-full min-h-[200px] rounded-2xl" aria-busy="true" />;
  }

  const weeklyProgress = Math.round(productivity?.task_completion_rate ?? 0);
  const aiScore = Math.round(productivity?.ai_automation_score ?? aiUsage?.ai_queries_today ?? 0);
  const streak = Math.min(7, Math.max(1, Math.floor(weeklyProgress / 15)));

  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      aria-label="Personal productivity"
    >
      <DashboardCard variant="gradient" padding="md" className="h-full">
        <h2 className="text-sm font-semibold text-ds-text-primary mb-4">Personal Productivity</h2>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-ds-primary" />
              <span className="text-xs text-ds-text-muted uppercase tracking-wide">Today&apos;s Focus</span>
            </div>
            <p className="text-sm text-ds-text-secondary line-clamp-2">{currentGoal}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-ds-text-muted uppercase tracking-wide">Current Goal</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="text-sm font-medium text-ds-primary hover:underline"
            >
              {openTasks.length} open tasks →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-2 rounded-xl bg-white/[0.03]">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-ds-text-primary">
                <AnimatedCounter value={weeklyProgress} suffix="%" />
              </p>
              <p className="text-[10px] text-ds-text-muted">Weekly</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.03]">
              <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-ds-text-primary">
                <AnimatedCounter value={streak} />
              </p>
              <p className="text-[10px] text-ds-text-muted">Streak</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.03]">
              <Zap className="w-4 h-4 text-ds-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-ds-text-primary">
                <AnimatedCounter value={aiScore} />
              </p>
              <p className="text-[10px] text-ds-text-muted">AI Score</p>
            </div>
          </div>
        </div>
      </DashboardCard>
    </motion.section>
  );
}
