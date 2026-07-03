import { cn } from "../../lib/utils";

export interface AvatarProps {
  initials: string;
  gradient?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
};

const dotSizes = {
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
};

export default function Avatar({
  initials,
  gradient = "from-ds-primary-500 to-ds-accent",
  size = "md",
  online,
  className,
}: AvatarProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white",
          sizes[size],
          gradient
        )}
        aria-hidden="true"
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-ds-canvas",
            dotSizes[size],
            online ? "bg-ds-success" : "bg-ds-text-muted"
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
