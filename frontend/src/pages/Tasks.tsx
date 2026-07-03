import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  ApiError,
  api,
  type ApiTask,
  type ApiTaskUser,
  type GeneratedTask,
  type TaskCreatePayload,
  type TaskPriority,
  type TaskStatus,
} from "../lib/api";
import AITaskGenerator from "../components/tasks/AITaskGenerator";
import EmptyTaskState from "../components/tasks/EmptyTaskState";
import TaskBoard from "../components/tasks/TaskBoard";
import TaskDetailPanel from "../components/tasks/TaskDetailPanel";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskFormModal from "../components/tasks/TaskFormModal";
import TasksPageHeader from "../components/tasks/TasksPageHeader";

export default function Tasks() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [assignees, setAssignees] = useState<ApiTaskUser[]>([]);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingGenerated, setSavingGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [aiOnly, setAiOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/tasks" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadTasks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [taskData, assigneeData] = await Promise.all([
        api.getTasks(token),
        api.getTaskAssignees(token),
      ]);
      setTasks(taskData);
      setAssignees(assigneeData);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const state = location.state as { openCreate?: boolean } | null;
    if (!state?.openCreate) return;

    setEditingTask(null);
    setFormOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (aiOnly && !task.ai_generated) return false;

      if (!query) return true;

      const haystack = [
        task.title,
        task.description,
        task.assignee?.full_name ?? "",
        task.priority,
        task.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, aiOnly]);

  const syncSelectedTask = (updatedTask: ApiTask) => {
    setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    setSelectedTask(updatedTask);
  };

  const handleCreateOrUpdate = async (payload: TaskCreatePayload) => {
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      if (editingTask) {
        const updated = await api.updateTask(token, editingTask.id, payload);
        syncSelectedTask(updated);
      } else {
        const created = await api.createTask(token, payload);
        setTasks((current) => [created, ...current]);
      }

      setFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to save task");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTaskMove = async (taskId: number, status: TaskStatus) => {
    if (!token) return;

    setUpdating(true);
    setError(null);

    try {
      const updated = await api.updateTask(token, taskId, { status });
      syncSelectedTask(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update task status");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (taskId: number, priority: TaskPriority) => {
    if (!token) return;

    setUpdating(true);
    setError(null);

    try {
      const updated = await api.updateTask(token, taskId, { priority });
      syncSelectedTask(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update task priority");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!token) return;
    if (!window.confirm("Delete this task? This action cannot be undone.")) return;

    setDeleting(true);
    setError(null);

    try {
      await api.deleteTask(token, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to delete task");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateTasks = async (payload: {
    goal: string;
    deadline: string;
    team_context: string;
  }) => {
    if (!token) return [];

    setGenerating(true);
    setError(null);

    try {
      const response = await api.generateTasks(token, {
        goal: payload.goal,
        deadline: payload.deadline || null,
        team_context: payload.team_context || null,
        save: false,
      });
      return response.data;
    } catch (err) {
      if (handleAuthError(err)) {
        return [];
      }
      throw err instanceof ApiError ? err : new Error("Failed to generate tasks");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedTasks = async (generated: GeneratedTask[]) => {
    if (!token || generated.length === 0) return;

    setSavingGenerated(true);
    setError(null);

    try {
      const created = await api.bulkCreateTasks(
        token,
        generated.map((task) => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.suggested_due_date || null,
        }))
      );
      setTasks((current) => [...created, ...current]);
      setAiOpen(false);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to save generated tasks");
      }
    } finally {
      setSavingGenerated(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEditModal = (task: ApiTask) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <>
      <TasksPageHeader onNewTask={openCreateModal} onGenerateAI={() => setAiOpen(true)}>
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          aiOnly={aiOnly}
          onAiOnlyChange={setAiOnly}
        />

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <EmptyTaskState onNewTask={openCreateModal} onGenerateAI={() => setAiOpen(true)} />
        ) : filteredTasks.length === 0 ? (
          <EmptyTaskState
            filtered
            onNewTask={openCreateModal}
            onGenerateAI={() => setAiOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <TaskBoard
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onTaskMove={handleTaskMove}
            />
            <div className="hidden xl:block">
              {selectedTask ? (
                <TaskDetailPanel
                  task={selectedTask}
                  open={Boolean(selectedTask)}
                  onClose={() => setSelectedTask(null)}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskMove}
                  onPriorityChange={handlePriorityChange}
                  deleting={deleting}
                  updating={updating}
                />
              ) : (
                <div className="flex h-full min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-surface-card/30 p-6 text-center text-sm text-gray-500">
                  Select a task to view details, edit priority, or delete.
                </div>
              )}
            </div>
          </div>
        )}
      </TasksPageHeader>

      <div className="xl:hidden">
        <TaskDetailPanel
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
          onStatusChange={handleTaskMove}
          onPriorityChange={handlePriorityChange}
          deleting={deleting}
          updating={updating}
        />
      </div>

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        assignees={assignees}
        initialTask={editingTask}
        saving={saving}
      />

      <AITaskGenerator
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onGenerate={handleGenerateTasks}
        onSaveAll={handleSaveGeneratedTasks}
        generating={generating}
        saving={savingGenerated}
      />
    </>
  );
}
