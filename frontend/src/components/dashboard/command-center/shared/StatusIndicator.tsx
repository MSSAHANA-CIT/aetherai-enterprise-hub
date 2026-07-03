import { cn } from "../../../../lib/utils";

export type StatusLevel = "operational" | "degraded" | "offline" | "checking";

const statusConfig: Record<StatusLevel, { color: string; label: string; pulse?: boolean }> = {
  operational: { color: "bg-emerald-400", label: "Operational", pulse: true },
  degraded: { color: "bg-amber-400", label: "Degraded" },
  offline: { color: "bg-red-400", label: "Offline" },
  checking: { color: "bg-gray-400", label: "Checking" },
};

interface StatusIndicatorProps {
  status: StatusLevel;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusIndicator({
  status,
  label,
  showLabel = true,
  size = "sm",
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <div className={cn("flex items-center gap-2", className)} role="status" aria-label={label ?? config.label}>
      <span className="relative flex">
        {config.pulse && status === "operational" && (
          <span
            className={cn("absolute inline-flex rounded-full opacity-60 animate-ping", dotSize, config.color)}
            aria-hidden="true"
          />
        )}
        <span className={cn("relative inline-flex rounded-full", dotSize, config.color)} aria-hidden="true" />
      </span>
      {showLabel && (
        <span className="text-xs text-ds-text-muted">{label ?? config.label}</span>
      )}
    </div>
  );
}
