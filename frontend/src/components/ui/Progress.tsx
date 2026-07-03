import { cn } from "../../lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  gradient?: string;
  showLabel?: boolean;
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  gradient = "from-ds-primary-500 to-ds-accent",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-ds-text-muted">
            {value}
            {max === 100 ? "%" : ` / ${max}`}
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-ds-glass-medium overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradient)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
