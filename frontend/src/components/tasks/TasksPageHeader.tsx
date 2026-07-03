import { motion } from "framer-motion";
import { CheckSquare, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import Button from "../ui/Button";

interface TasksPageHeaderProps {
  onNewTask: () => void;
  onGenerateAI: () => void;
  children?: ReactNode;
}

export default function TasksPageHeader({ onNewTask, onGenerateAI, children }: TasksPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-semibold text-white">Task Management</h1>
          </div>
          <p className="text-sm text-gray-500">
            Plan, assign, track, and generate work with AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onNewTask}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
          <Button onClick={onGenerateAI}>
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {children}
    </motion.div>
  );
}
