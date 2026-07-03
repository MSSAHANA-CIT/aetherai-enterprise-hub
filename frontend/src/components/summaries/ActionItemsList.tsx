import { motion } from "framer-motion";
import { Calendar, CircleDot, User } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ApiActionItem } from "../../lib/api";

interface ActionItemsListProps {
  actionItems: ApiActionItem[];
  className?: string;
}

export default function ActionItemsList({ actionItems, className }: ActionItemsListProps) {
  if (actionItems.length === 0) {
    return (
      <div className={cn("rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", className)}>
        <p className="text-sm text-gray-500">No action items were identified in this conversation.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {actionItems.map((item, index) => (
        <motion.div
          key={`${item.task}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-xl border border-aether-500/15 bg-aether-500/[0.06] p-4"
        >
          <div className="flex items-start gap-3">
            <CircleDot className="w-4 h-4 text-aether-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium leading-relaxed">{item.task}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-aether-300" />
                  {item.owner || "Unassigned"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-300" />
                  {item.deadline || "TBD"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
