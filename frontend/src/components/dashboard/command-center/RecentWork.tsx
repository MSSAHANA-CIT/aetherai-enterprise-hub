import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, CheckSquare, FileText, Sparkles, Video } from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { getRecentAIChats } from "../../../lib/aiChatHistory";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";

function RecentWorkContent() {
  const { loading, documents, meetings, summaries, tasks } = useDashboardData();
  const navigate = useNavigate();
  const aiChats = useMemo(() => getRecentAIChats(3), [loading]);

  if (loading) {
    return <Skeleton className="h-48 rounded-2xl" aria-busy="true" />;
  }

  const sections = [
    {
      id: "docs",
      label: "Recent documents",
      icon: FileText,
      items: documents.slice(0, 3).map((d) => ({
        id: d.id,
        title: d.title,
        meta: d.file_type,
        href: "/knowledge",
      })),
    },
    {
      id: "meetings",
      label: "Recent meetings",
      icon: Video,
      items: meetings.slice(0, 3).map((m) => ({
        id: m.id,
        title: m.title,
        meta: m.status,
        href: "/meetings",
      })),
    },
    {
      id: "ai",
      label: "Recent AI chats",
      icon: Bot,
      items: aiChats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        meta: chat.preview,
        href: "/ai",
        state: { resumeSessionId: chat.id },
      })),
    },
    {
      id: "summaries",
      label: "Recent summaries",
      icon: Sparkles,
      items: summaries.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.title,
        meta: s.channel?.name ?? "Channel",
        href: "/summaries",
      })),
    },
    {
      id: "tasks",
      label: "Recent tasks",
      icon: CheckSquare,
      items: tasks.slice(0, 3).map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.status,
        href: "/tasks",
      })),
    },
  ];

  return (
    <DashboardCard variant="glass" padding="lg" hover={false}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div key={section.id} variants={staggerItem}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-ds-primary" />
                <h3 className="text-xs font-semibold text-ds-text-muted uppercase tracking-wide">
                  {section.label}
                </h3>
              </div>
              <div className="space-y-2">
                {section.items.length === 0 ? (
                  <p className="text-xs text-ds-text-muted">Nothing yet</p>
                ) : (
                  section.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          item.href,
                          "state" in item && item.state ? { state: item.state } : undefined
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                    >
                      <p className="text-xs font-medium text-ds-text-primary truncate">{item.title}</p>
                      <p className="text-[10px] text-ds-text-muted capitalize">{item.meta}</p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </DashboardCard>
  );
}

export default function RecentWork() {
  return (
    <section aria-label="Recent work">
      <SectionHeader title="Recent Work" subtitle="Continue where you left off" />
      <LazySection>
        <RecentWorkContent />
      </LazySection>
    </section>
  );
}
