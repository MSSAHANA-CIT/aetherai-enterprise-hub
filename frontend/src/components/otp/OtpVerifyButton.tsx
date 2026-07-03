import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface OtpVerifyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  children: React.ReactNode;
}

function OtpVerifyButton({
  onClick,
  disabled = false,
  loading = false,
  success = false,
  children,
}: OtpVerifyButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const reducedMotion = useReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading || success) return;

      if (!reducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      }

      onClick();
    },
    [disabled, loading, success, onClick, reducedMotion]
  );

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading || success}
      whileHover={!disabled && !loading && !success && !reducedMotion ? { y: -2, scale: 1.01 } : undefined}
      whileTap={!disabled && !loading && !success && !reducedMotion ? { scale: 0.98 } : undefined}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl px-7 py-4 text-base font-semibold",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-aether-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a12]",
        "transition-shadow duration-300",
        success
          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          : "bg-gradient-to-r from-aether-600 via-aether-500 to-purple-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.45)]",
        (disabled || loading) && !success && "opacity-50 cursor-not-allowed hover:shadow-none"
      )}
      aria-busy={loading}
    >
      {/* Shimmer overlay */}
      {!disabled && !loading && !success && !reducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        />
      )}

      {/* Ripples */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
          animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      <span className="relative z-10 flex items-center justify-center gap-2.5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2.5"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              {children}
            </motion.span>
          ) : success ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5"
            >
              <Check className="w-5 h-5" />
              Verified
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export default memo(OtpVerifyButton);
