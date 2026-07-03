import { motion } from "framer-motion";
import type { ApiTask, TaskStatus } from "../../lib/api";
import TaskColumn from "./TaskColumn";

interface TaskBoardProps {
  tasks: ApiTask[];
  onTaskClick: (task: ApiTask) => void;
  onTaskMove: (taskId: number, status: TaskStatus) => void;
}

const COLUMNS: Array<{ status: TaskStatus; title: string; accent: string }> = [
  { status: "todo", title: "To Do", accent: "bg-slate-400" },
  { status: "in_progress", title: "In Progress", accent: "bg-blue-400" },
  { status: "review", title: "Review", accent: "bg-amber-400" },
  { status: "done", title: "Done", accent: "bg-emerald-400" },
];

export default function TaskBoard({ tasks, onTaskClick, onTaskMove }: TaskBoardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4"
    >
      {COLUMNS.map((column) => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          accent={column.accent}
          tasks={tasks.filter((task) => task.status === column.status)}
          onTaskClick={onTaskClick}
          onTaskMove={onTaskMove}
        />
      ))}
    </motion.div>
  );
}
