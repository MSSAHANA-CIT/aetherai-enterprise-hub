import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, Sparkles, Target, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GeneratedTask, TaskPriority } from "../../lib/api";
import { cn } from "../../lib/utils";
import Button from "../ui/Button";
import ExportMenu from "../export/ExportMenu";

interface AITaskGeneratorProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (payload: { goal: string; deadline: string; team_context: string }) => Promise<GeneratedTask[]>;
  onSaveAll: (tasks: GeneratedTask[]) => Promise<void>;
  generating?: boolean;
  saving?: boolean;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  medium: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  high: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  urgent: "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

export default function AITaskGenerator({
  open,
  onClose,
  onGenerate,
  onSaveAll,
  generating = false,
  saving = false,
}: AITaskGeneratorProps) {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teamContext, setTeamContext] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGeneratedTasks([]);
      setError(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Please enter a project goal.");
      return;
    }

    setError(null);
    try {
      const tasks = await onGenerate({
        goal: goal.trim(),
        deadline,
        team_context: teamContext.trim(),
      });
      setGeneratedTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate tasks");
    }
  };

  const updateGeneratedTask = (index: number, field: keyof GeneratedTask, value: string) => {
    setGeneratedTasks((current) =>
      current.map((task, taskIndex) => (taskIndex === index ? { ...task, [field]: value } : task))
    );
  };

  const exportContent = useMemo(() => {
    if (generatedTasks.length === 0) return "";
    return generatedTasks
      .map((task, index) => {
        const lines = [
          `${index + 1}. ${task.title} [${task.priority}]`,
          task.description,
          task.suggested_due_date ? `Due: ${task.suggested_due_date}` : "",
        ].filter(Boolean);
        return lines.join("\n");
      })
      .join("\n\n");
  }, [generatedTasks]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-surface-raised/95 to-surface-card/95 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aether-400/60 to-transparent" />

            <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-aether-500/30 bg-aether-500/10 px-3 py-1 text-xs text-aether-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Task Planner
                </div>
                <h2 className="text-xl font-semibold text-white">Generate Task Plan</h2>
                <p className="text-sm text-gray-500">
                  Turn a project goal into structured, prioritized tasks for your team.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Target className="h-3.5 w-3.5" />
                    Project Goal
                  </label>
                  <textarea
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    rows={3}
                    placeholder="Launch internal AI support assistant"
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:border-aether-500/40 focus:outline-none focus:ring-2 focus:ring-aether-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:border-aether-500/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Users className="h-3.5 w-3.5" />
                    Team Context
                  </label>
                  <input
                    value={teamContext}
                    onChange={(event) => setTeamContext(event.target.value)}
                    placeholder="Frontend, backend, AI, QA"
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-card/80 px-3 py-2.5 text-sm text-white focus:border-aether-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              {generatedTasks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">Generated Tasks</h3>
                      <span className="text-xs text-gray-500">{generatedTasks.length} tasks</span>
                    </div>
                    <ExportMenu
                      content={exportContent}
                      title="AI Task Plan"
                      formats={["txt", "md", "json", "csv"]}
                      metadata={{ rows: generatedTasks }}
                    />
                  </div>

                  {generatedTasks.map((task, index) => (
                    <motion.div
                      key={`${task.title}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-white/[0.08] bg-surface-card/70 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                            PRIORITY_STYLES[task.priority]
                          )}
                        >
                          {task.priority}
                        </span>
                        {task.suggested_due_date && (
                          <span className="text-xs text-gray-500">Due {task.suggested_due_date}</span>
                        )}
                      </div>

                      <input
                        value={task.title}
                        onChange={(event) => updateGeneratedTask(index, "title", event.target.value)}
                        className="mb-2 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white focus:outline-none"
                      />
                      <textarea
                        value={task.description}
                        onChange={(event) => updateGeneratedTask(index, "description", event.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-gray-300 focus:outline-none"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {generatedTasks.length > 0 ? (
                <Button
                  onClick={() => void onSaveAll(generatedTasks)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Save All Tasks
                </Button>
              ) : (
                <Button onClick={() => void handleGenerate()} disabled={generating || !goal.trim()}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Task Plan
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
