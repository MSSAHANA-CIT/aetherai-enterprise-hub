import { motion } from "framer-motion";
import { CheckSquare, Plus } from "lucide-react";
import Button from "../ui/Button";

interface EmptyTaskStateProps {
  onNewTask: () => void;
  onGenerateAI: () => void;
  filtered?: boolean;
}

export default function EmptyTaskState({ onNewTask, onGenerateAI, filtered = false }: EmptyTaskStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-card/40 backdrop-blur-xl py-20 px-6 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <CheckSquare className="h-7 w-7 text-emerald-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {filtered ? "No tasks match your filters" : "No tasks yet"}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {filtered
          ? "Try adjusting your search or filter criteria to find tasks."
          : "Create a task manually or let AI generate a structured plan from your project goal."}
      </p>
      {!filtered && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={onNewTask}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
          <Button onClick={onGenerateAI}>Generate with AI</Button>
        </div>
      )}
    </motion.div>
  );
}
