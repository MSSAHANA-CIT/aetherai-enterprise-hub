import { motion } from "framer-motion";
import { BarChart3, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import ExportMenu from "../export/ExportMenu";

interface AnalyticsHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
  exportContent?: string;
}

export default function AnalyticsHeader({
  onRefresh,
  refreshing = false,
  exportContent = "",
}: AnalyticsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Enterprise Insights</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor company productivity, AI adoption, collaboration, and security health.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-3 self-start sm:self-auto">
        <Button variant="secondary" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh data
        </Button>
        {exportContent.trim() && (
          <ExportMenu content={exportContent} title="Analytics Report" formats={["txt", "md", "json"]} />
        )}
      </div>
    </motion.div>
  );
}
