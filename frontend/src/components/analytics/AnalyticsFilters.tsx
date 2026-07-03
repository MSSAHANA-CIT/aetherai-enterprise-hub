import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import Card from "../ui/Card";

export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "all";

interface AnalyticsFiltersProps {
  timeRange: AnalyticsTimeRange;
  onTimeRangeChange: (range: AnalyticsTimeRange) => void;
}

const ranges: { value: AnalyticsTimeRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

export default function AnalyticsFilters({ timeRange, onTimeRangeChange }: AnalyticsFiltersProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card variant="glass" className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Time range</span>
            <span className="text-gray-600 hidden sm:inline">·</span>
            <span className="text-gray-600 text-xs hidden sm:inline">
              Filters apply to display labels; live metrics reflect current data
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ranges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => onTimeRangeChange(range.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range.value
                    ? "bg-gradient-to-r from-aether-500 to-purple-600 text-white shadow-glow-sm"
                    : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
