import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, Pencil, Sparkles, Trash2, X } from "lucide-react";
import type { ApiTask, TaskPriority, TaskStatus } from "../../lib/api";
import { cn } from "../../lib/utils";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface TaskDetailPanelProps {
  task: ApiTask | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: ApiTask) => void;
  onDelete: (taskId: number) => Promise<void>;
  onStatusChange: (taskId: number, status: TaskStatus) => Promise<void>;
  onPriorityChange: (taskId: number, priority: TaskPriority) => Promise<void>;
  deleting?: boolean;
  updating?: boolean;
}

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailPanel({
  task,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  deleting = false,
  updating = false,
}: TaskDetailPanelProps) {
  return (
    <AnimatePresence>
      {open && task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] xl:hidden"
            onClick={onClose}
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className={cn(
              "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/[0.08] bg-surface-raised/95 p-6 shadow-2xl backdrop-blur-2xl",
              "xl:static xl:z-0 xl:h-auto xl:max-w-none xl:rounded-2xl xl:border xl:shadow-card"
            )}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {task.ai_generated && (
                    <Badge variant="purple">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                  <Badge variant="info" className="capitalize">
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-white">{task.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Description</p>
                <p className="text-sm leading-relaxed text-gray-300">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                  <select
                    value={task.status}
                    disabled={updating}
                    onChange={(event) => void onStatusChange(task.id, event.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-surface-card">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Priority</p>
                  <select
                    value={task.priority}
                    disabled={updating}
                    onChange={(event) => void onPriorityChange(task.id, event.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-surface-card">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Assignee</p>
                  <p className="text-gray-200">{task.assignee?.full_name ?? "Unassigned"}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Due Date</p>
                  <p className="flex items-center gap-2 text-gray-200">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(task.due_date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-5">
                <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void onDelete(task.id)}
                  disabled={deleting}
                  className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
