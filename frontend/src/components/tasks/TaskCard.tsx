import { motion } from "framer-motion";
import { Calendar, ChevronRight, Sparkles } from "lucide-react";
import type { ApiTask, TaskStatus } from "../../lib/api";
import { cn } from "../../lib/utils";
import Badge from "../ui/Badge";

interface TaskCardProps {
  task: ApiTask;
  onClick: () => void;
  onMove: (status: TaskStatus) => void;
}

const PRIORITY_STYLES: Record<ApiTask["priority"], string> = {
  low: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  medium: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  high: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  urgent: "bg-rose-500/15 text-rose-300 border-rose-500/20",
};

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: "in_progress",
  in_progress: "review",
  review: "done",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDueDate(value: string | null): string {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TaskCard({ task, onClick, onMove }: TaskCardProps) {
  const nextStatus = NEXT_STATUS[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-white/[0.08] bg-surface-raised/80 p-4 shadow-card backdrop-blur-xl transition-colors hover:border-emerald-500/20"
    >
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium text-white line-clamp-2">{task.title}</h3>
          {task.assignee && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white"
              title={task.assignee.full_name}
            >
              {getInitials(task.assignee.full_name)}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2">{task.description}</p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
              PRIORITY_STYLES[task.priority]
            )}
          >
            {task.priority}
          </span>
          {task.ai_generated && (
            <Badge variant="purple" className="text-[11px]">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDueDate(task.due_date)}</span>
        </div>
      </button>

      {nextStatus && (
        <button
          type="button"
          onClick={() => onMove(nextStatus)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:border-emerald-500/30 hover:text-emerald-300"
        >
          Move forward
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
