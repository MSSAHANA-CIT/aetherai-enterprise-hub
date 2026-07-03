import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface UserStatusToggleProps {
  isActive: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange: (isActive: boolean) => void;
}

export default function UserStatusToggle({
  isActive,
  disabled = false,
  loading = false,
  onChange,
}: UserStatusToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div>
        <p className="text-sm font-medium text-white">Account Status</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isActive ? "User can access the platform" : "User access is disabled"}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => onChange(!isActive)}
        className={cn(
          "relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-aether-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
          isActive ? "bg-emerald-500/80" : "bg-gray-600"
        )}
        aria-label={isActive ? "Deactivate user" : "Activate user"}
      >
        {loading ? (
          <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
        ) : (
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md",
              isActive ? "left-6" : "left-1"
            )}
          />
        )}
      </button>
    </div>
  );
}
