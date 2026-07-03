import { useComingSoon } from "../../context/ComingSoonContext";

export type AuditFilterCategory = "all" | "security" | "ai" | "tasks" | "documents" | "users";

interface AuditLogFiltersProps {
  active: AuditFilterCategory;
  onChange: (filter: AuditFilterCategory) => void;
}

const FILTERS: { id: AuditFilterCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "security", label: "Security" },
  { id: "ai", label: "AI" },
  { id: "tasks", label: "Tasks" },
  { id: "documents", label: "Documents" },
  { id: "users", label: "Users" },
];

export default function AuditLogFilters({ active, onChange }: AuditLogFiltersProps) {
  const { openComingSoon } = useComingSoon();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active === filter.id
                ? "bg-gradient-to-r from-aether-500/20 to-purple-600/20 text-white border border-aether-500/30 shadow-glow-sm"
                : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="sm:ml-auto">
        <button
          type="button"
          onClick={() =>
            openComingSoon({
              title: "Date Range Filter",
              description: "Filter audit logs by custom date ranges and export filtered results.",
              feature: "Audit Logs",
            })
          }
          className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
        >
          Filter by date range
        </button>
      </div>
    </div>
  );
}
