import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface DecisionsListProps {
  decisions: string[];
  className?: string;
}

export default function DecisionsList({ decisions, className }: DecisionsListProps) {
  if (decisions.length === 0) {
    return (
      <div className={cn("rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", className)}>
        <p className="text-sm text-gray-500">No decisions were identified in this conversation.</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {decisions.map((decision, index) => (
        <motion.li
          key={`${decision}-${index}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-200 leading-relaxed">{decision}</span>
        </motion.li>
      ))}
    </ul>
  );
}
