import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiTask, ApiTaskUser, TaskCreatePayload, TaskPriority, TaskStatus } from "../../lib/api";
import Button from "../ui/Button";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: TaskCreatePayload) => Promise<void>;
  assignees: ApiTaskUser[];
  initialTask?: ApiTask | null;
  saving?: boolean;
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

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  assignees,
  initialTask,
  saving = false,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) return;

    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setAssigneeId(initialTask.assignee_id ? String(initialTask.assignee_id) : "");
      setDueDate(initialTask.due_date ?? "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId("");
      setDueDate("");
    }
  }, [open, initialTask]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee_id: assigneeId ? Number(assigneeId) : null,
      due_date: dueDate || null,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-surface-raised/95 p-6 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {initialTask ? "Edit Task" : "New Task"}
                </h2>
                <p className="text-sm text-gray-500">Capture work details and assignment.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-surface-card">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-surface-card">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="" className="bg-surface-card">
                      Unassigned
                    </option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id} className="bg-surface-card">
                        {assignee.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Due Date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 py-2.5 pl-10 pr-3 text-sm text-white focus:border-emerald-500/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !title.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {initialTask ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
