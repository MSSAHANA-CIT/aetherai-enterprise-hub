import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { getUpcomingMeetings } from "../../../lib/meetingUtils";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckSquare,
  FileText,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DashboardCard } from "./shared/DashboardCard";
import AnimatedCounter from "./shared/AnimatedCounter";
import SectionHeader from "./shared/SectionHeader";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";
import { cn } from "../../../lib/utils";

interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  trend: string;
  trendDir: "up" | "down" | "neutral";
  icon: typeof CheckSquare;
  href: string;
  color: string;
}

export default function WorkspaceOverview() {
  const { loading, tasks, meetings, documents, unreadCount, overview } =
    useDashboardData();
  const navigate = useNavigate();

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done").length,
    [tasks]
  );

  const pendingReviews = useMemo(
    () => documents.filter((d) => !d.ai_summary).length,
    [documents]
  );

  const upcomingMeetings = useMemo(() => getUpcomingMeetings(meetings, 5).length, [meetings]);

  const metrics: OverviewMetric[] = [
    {
      id: "tasks",
      label: "Today's Tasks",
      value: todayTasks,
      trend: `${overview?.completed_tasks ?? 0} completed`,
      trendDir: "up",
      icon: CheckSquare,
      href: "/tasks",
      color: "text-emerald-400",
    },
    {
      id: "reviews",
      label: "Pending Reviews",
      value: pendingReviews,
      trend: pendingReviews > 0 ? "Needs attention" : "All clear",
      trendDir: pendingReviews > 0 ? "down" : "up",
      icon: FileText,
      href: "/knowledge",
      color: "text-amber-400",
    },
    {
      id: "notifications",
      label: "Unread Notifications",
      value: unreadCount,
      trend: unreadCount > 0 ? "New updates" : "Caught up",
      trendDir: unreadCount > 0 ? "down" : "neutral",
      icon: Bell,
      href: "/dashboard",
      color: "text-blue-400",
    },
    {
      id: "meetings",
      label: "Upcoming Meetings",
      value: upcomingMeetings,
      trend: `${meetings.length} total`,
      trendDir: "neutral",
      icon: Calendar,
      href: "/meetings",
      color: "text-purple-400",
    },
    {
      id: "ai",
      label: "AI Suggestions",
      value: overview?.ai_generated_tasks ?? 0,
      trend: "AI-powered",
      trendDir: "up",
      icon: Lightbulb,
      href: "/ai",
      color: "text-aether-400",
    },
    {
      id: "docs",
      label: "Documents Pending Review",
      value: pendingReviews,
      trend: `${documents.length} in library`,
      trendDir: "neutral",
      icon: FileText,
      href: "/knowledge",
      color: "text-cyan-400",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Workspace overview">
      <SectionHeader title="Workspace Overview" subtitle="Your daily pulse" />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trendDir === "up" ? TrendingUp : metric.trendDir === "down" ? TrendingDown : null;

          return (
            <motion.div key={metric.id} variants={staggerItem}>
              <button
                type="button"
                onClick={() => navigate(metric.href)}
                className="w-full text-left"
                aria-label={`${metric.label}: ${metric.value}`}
              >
                <DashboardCard
                  variant="glass"
                  padding="sm"
                  delay={i * 0.04}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-ds-primary/15 transition-colors">
                        <Icon className={cn("w-4 h-4", metric.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-ds-text-muted uppercase tracking-wide">{metric.label}</p>
                        <p className="text-xl font-bold text-ds-text-primary">
                          <AnimatedCounter value={metric.value} />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-ds-text-muted shrink-0">
                      {TrendIcon && (
                        <TrendIcon
                          className={cn(
                            "w-3 h-3",
                            metric.trendDir === "up" ? "text-emerald-400" : "text-amber-400"
                          )}
                        />
                      )}
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                </DashboardCard>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
