import { motion } from "framer-motion";
import { BookOpen, FileSearch, FileText } from "lucide-react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import { useComingSoon } from "../../context/ComingSoonContext";
import type { AnalyticsOverview } from "../../lib/api";

interface DocumentInsightsPanelProps {
  overview: AnalyticsOverview | null;
  summarizedCount?: number;
  loading?: boolean;
}

export default function DocumentInsightsPanel({
  overview,
  summarizedCount = 0,
  loading = false,
}: DocumentInsightsPanelProps) {
  const { openComingSoon } = useComingSoon();

  if (loading || !overview) {
    return (
      <Card variant="gradient" glow className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-white/[0.06]" />
          <div className="h-32 rounded-xl bg-white/[0.06]" />
        </div>
      </Card>
    );
  }

  const uploaded = overview.total_documents;
  const summarized = summarizedCount;
  const knowledgeUsage = uploaded > 0 ? Math.min(100, Math.round((summarized / uploaded) * 100)) : 0;

  const items = [
    {
      label: "Uploaded documents",
      value: uploaded,
      icon: FileText,
      gradient: "from-rose-500 to-pink-500",
    },
    {
      label: "Summarized documents",
      value: summarized,
      icon: FileSearch,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      label: "Knowledge base queries",
      value: "—",
      icon: BookOpen,
      gradient: "from-amber-500 to-orange-500",
      placeholder: true,
    },
  ];

  return (
    <Card variant="gradient" glow className="h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <FileText className="w-5 h-5 text-rose-400" />
        <h3 className="font-semibold text-white">Document Insights</h3>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-semibold text-white">
                  {item.placeholder ? (
                    <button
                      type="button"
                      onClick={() =>
                        openComingSoon({
                          title: "Knowledge Base Queries",
                          description: "Track search queries and knowledge base engagement across your organization.",
                          feature: "Analytics",
                        })
                      }
                      className="text-gray-400 text-sm font-normal hover:text-aether-400 transition-colors"
                    >
                      View insights →
                    </button>
                  ) : (
                    item.value
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Knowledge base usage</span>
          <span className="text-sm font-semibold text-white">{knowledgeUsage}%</span>
        </div>
        <Progress value={knowledgeUsage} gradient="from-amber-500 to-orange-500" />
        <p className="text-[11px] text-gray-600 mt-2">Based on summarized vs uploaded documents</p>
      </div>
    </Card>
  );
}
