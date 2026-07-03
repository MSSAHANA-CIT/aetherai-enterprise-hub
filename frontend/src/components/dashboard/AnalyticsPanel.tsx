import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import { analyticsMetrics, weeklyChartData } from "../../data/mockData";
import { staggerItem } from "../../lib/animations";

export default function AnalyticsPanel() {
  return (
    <motion.div variants={staggerItem}>
      <Card variant="gradient" glow className="h-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">Analytics</h3>
          </div>
          <span className="text-xs text-gray-500">This week</span>
        </div>

        {/* Progress metrics */}
        <div className="space-y-5 mb-6">
          {analyticsMetrics.map((metric, i) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{metric.label}</span>
                <span className="text-sm font-semibold text-white">
                  {metric.value}{metric.unit}
                </span>
              </div>
              <Progress value={metric.value} max={metric.max} gradient={metric.color} />
            </motion.div>
          ))}
        </div>

        {/* Mini bar chart */}
        <div className="pt-5 border-t border-white/[0.08]">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
            Weekly activity
          </p>
          <div className="flex items-end gap-1.5 h-20">
            {weeklyChartData.map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                className="flex-1 rounded-md bg-gradient-to-t from-aether-600 to-aether-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                title={`Day ${i + 1}: ${height}%`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="text-[10px] text-gray-600 flex-1 text-center">
                {day}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
