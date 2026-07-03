import { AnimatePresence } from "framer-motion";
import type { ApiTask, TaskStatus } from "../../lib/api";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: ApiTask[];
  accent: string;
  onTaskClick: (task: ApiTask) => void;
  onTaskMove: (taskId: number, status: TaskStatus) => void;
}

export default function TaskColumn({
  title,
  tasks,
  accent,
  onTaskClick,
  onTaskMove,
}: TaskColumnProps) {
  return (
    <div className="flex min-h-[520px] flex-col rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
          <h2 className="text-sm font-medium text-white">{title}</h2>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-gray-400">{tasks.length}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onMove={(nextStatus) => onTaskMove(task.id, nextStatus)}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-xs text-gray-600">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
