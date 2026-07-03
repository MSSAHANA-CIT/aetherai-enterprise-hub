import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  FileUp,
  Shield,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import type { RecentActivityItem } from "../../../lib/api";

const TYPE_ICONS: Record<string, typeof FileUp> = {
  document: FileUp,
  task: CheckCircle,
  summary: Sparkles,
  security: Shield,
  message: UserPlus,
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function TeamActivityContent() {
  const { loading, overview, documents, tasks } = useDashboardData();
  const navigate = useNavigate();

  const feed = useMemo(() => {
    const items: Array<{
      id: string;
      text: string;
      time: string;
      type: string;
      href: string;
    }> = [];

    (overview?.recent_activity ?? []).forEach((a: RecentActivityItem) => {
      items.push({
        id: a.id,
        text: `${a.title} — ${a.description}`,
        time: a.created_at,
        type: a.type,
        href: "/dashboard",
      });
    });

    documents.slice(0, 2).forEach((d) => {
      items.push({
        id: `doc-${d.id}`,
        text: `${d.uploader?.full_name ?? "Someone"} uploaded document "${d.title}"`,
        time: d.created_at,
        type: "document",
        href: "/knowledge",
      });
    });

    tasks
      .filter((t) => t.status === "done")
      .slice(0, 2)
      .forEach((t) => {
        items.push({
          id: `task-${t.id}`,
          text: `${t.assignee?.full_name ?? "Team member"} completed task "${t.title}"`,
          time: t.updated_at,
          type: "task",
          href: "/tasks",
        });
      });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [overview, documents, tasks]);

  if (loading) {
    return <Skeleton className="h-48 rounded-2xl" aria-busy="true" />;
  }

  return (
    <DashboardCard variant="glass" padding="lg" hover={false}>
      <div className="space-y-1">
        {feed.length === 0 ? (
          <p className="text-sm text-ds-text-muted text-center py-6">No team activity yet</p>
        ) : (
          feed.map((item, i) => {
            const Icon = TYPE_ICONS[item.type] ?? Sparkles;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-ds-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ds-text-secondary truncate">{item.text}</p>
                </div>
                <time className="text-[10px] text-ds-text-muted shrink-0 tabular-nums">
                  {formatTime(item.time)}
                </time>
              </motion.button>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}

export default function RecentTeamActivity() {
  return (
    <section aria-label="Recent team activity">
      <SectionHeader title="Recent Team Activity" subtitle="Enterprise activity feed" />
      <LazySection>
        <TeamActivityContent />
      </LazySection>
    </section>
  );
}
