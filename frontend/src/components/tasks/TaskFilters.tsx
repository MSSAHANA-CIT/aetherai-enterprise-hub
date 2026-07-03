import { Filter, Search, Sparkles } from "lucide-react";
import type { TaskPriority, TaskStatus } from "../../lib/api";
import { cn } from "../../lib/utils";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | "all";
  onStatusFilterChange: (value: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  onPriorityFilterChange: (value: TaskPriority | "all") => void;
  aiOnly: boolean;
  onAiOnlyChange: (value: boolean) => void;
}

const STATUS_OPTIONS: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority | "all"; label: string }> = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  aiOnly,
  onAiOnlyChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-xl border border-white/[0.08] bg-surface-card/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 backdrop-blur-xl focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-surface-card/60 px-3 py-2 backdrop-blur-xl">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as TaskStatus | "all")}
            className="bg-transparent text-sm text-gray-200 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface-card text-gray-200">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={priorityFilter}
          onChange={(event) => onPriorityFilterChange(event.target.value as TaskPriority | "all")}
          className="rounded-xl border border-white/[0.08] bg-surface-card/60 px-3 py-2.5 text-sm text-gray-200 backdrop-blur-xl focus:border-emerald-500/40 focus:outline-none"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-card text-gray-200">
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onAiOnlyChange(!aiOnly)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
            aiOnly
              ? "border-aether-500/40 bg-aether-500/15 text-aether-200"
              : "border-white/[0.08] bg-surface-card/60 text-gray-300 hover:bg-white/[0.05]"
          )}
        >
          <Sparkles className="h-4 w-4" />
          AI Generated
        </button>
      </div>
    </div>
  );
}
