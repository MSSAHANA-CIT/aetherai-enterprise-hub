import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckSquare,
  FileText,
  Sparkles,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";

function RecommendationsContent() {
  const { loading, tasks, notifications, documents, summaries, unreadCount } = useDashboardData();
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      icon: typeof AlertTriangle;
      color: string;
      href: string;
      state?: Record<string, unknown>;
    }> = [];

    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== "done"
    );
    if (overdue.length > 0) {
      items.push({
        id: "overdue",
        title: `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
        description: "Review and update priorities to stay on track",
        icon: AlertTriangle,
        color: "text-amber-400",
        href: "/tasks",
      });
    }

    const latestSummary = summaries[0];
    if (latestSummary) {
      items.push({
        id: "summary",
        title: "Meeting summary available",
        description: latestSummary.title,
        icon: Sparkles,
        color: "text-purple-400",
        href: "/summaries",
      });
    }

    const recentDoc = documents.find((d) => d.ai_summary);
    if (recentDoc) {
      items.push({
        id: "kb",
        title: "Knowledge article updated",
        description: recentDoc.title,
        icon: BookOpen,
        color: "text-blue-400",
        href: "/knowledge",
      });
    }

    if (unreadCount > 0) {
      items.push({
        id: "notifications",
        title: `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`,
        description: "Catch up on workspace updates",
        icon: Bell,
        color: "text-cyan-400",
        href: "/dashboard",
      });
    }

    const unsummarized = documents.filter((d) => !d.ai_summary);
    if (unsummarized.length >= 3) {
      items.push({
        id: "cleanup",
        title: "Suggest document cleanup",
        description: `${unsummarized.length} documents without AI summaries`,
        icon: FileText,
        color: "text-rose-400",
        href: "/knowledge",
        state: { openUpload: false },
      });
    }

    const openTasks = tasks.filter((t) => t.status === "todo" || t.status === "in_progress");
    if (openTasks.length > 5) {
      items.push({
        id: "tasks",
        title: "High task volume detected",
        description: "Use AI to generate a prioritized plan",
        icon: CheckSquare,
        color: "text-emerald-400",
        href: "/ai",
        state: { initialPrompt: "Help me prioritize my open tasks and suggest a focus plan." },
      });
    }

    if (items.length === 0) {
      items.push({
        id: "default",
        title: "You're all caught up",
        description: "Explore AI features to boost productivity",
        icon: Sparkles,
        color: "text-ds-primary",
        href: "/ai",
      });
    }

    return items.slice(0, 5);
  }, [tasks, notifications, documents, summaries, unreadCount]);

  if (loading) {
    return <Skeleton className="h-48 rounded-2xl" aria-busy="true" />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {recommendations.map((rec) => {
        const Icon = rec.icon;
        return (
          <motion.div key={rec.id} variants={staggerItem}>
            <button
              type="button"
              onClick={() => navigate(rec.href, rec.state ? { state: rec.state } : undefined)}
              className="w-full text-left"
            >
              <DashboardCard variant="gradient" padding="md" className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${rec.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ds-text-primary">{rec.title}</p>
                    <p className="text-xs text-ds-text-muted mt-0.5 line-clamp-2">{rec.description}</p>
                  </div>
                </div>
              </DashboardCard>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function AIRecommendations() {
  return (
    <section aria-label="AI recommendations">
      <SectionHeader title="AI Recommendations" subtitle="Personalized insights for your workflow" />
      <LazySection>
        <RecommendationsContent />
      </LazySection>
    </section>
  );
}
