import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedShield() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32" aria-hidden="true">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          reducedMotion
            ? undefined
            : {
                boxShadow: [
                  "0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(139,92,246,0.1)",
                  "0 0 50px rgba(99,102,241,0.35), 0 0 80px rgba(139,92,246,0.15)",
                  "0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(139,92,246,0.1)",
                ],
              }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating border ring */}
      <motion.div
        className="absolute inset-1 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent, rgba(99,102,241,0.5), rgba(139,92,246,0.3), transparent)",
        }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner glass container */}
      <motion.div
        className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-aether-500/20 via-purple-600/10 to-indigo-600/15 border border-white/10 backdrop-blur-xl flex items-center justify-center"
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.03, 1],
              }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          {/* Shield body */}
          <motion.path
            d="M32 6L10 16v16c0 12.5 9.5 24.2 22 26 12.5-1.8 22-13.5 22-26V16L32 6z"
            stroke="url(#shieldGrad)"
            strokeWidth="2"
            fill="url(#shieldFill)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Animated scan line */}
          {!reducedMotion && (
            <motion.line
              x1="16"
              y1="28"
              x2="48"
              y2="28"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              animate={{ y1: [24, 44, 24], y2: [24, 44, 24] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Checkmark */}
          <motion.path
            d="M24 32l6 6 12-14"
            stroke="url(#checkGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          />

          {/* Pulse dot */}
          {!reducedMotion && (
            <motion.circle
              cx="32"
              cy="20"
              r="3"
              fill="#a4b8fc"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <defs>
            <linearGradient id="shieldGrad" x1="10" y1="6" x2="54" y2="58">
              <stop offset="0%" stopColor="#8093f8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="shieldFill" x1="32" y1="6" x2="32" y2="58">
              <stop offset="0%" stopColor="rgba(99,102,241,0.25)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.08)" />
            </linearGradient>
            <linearGradient id="checkGrad" x1="24" y1="32" x2="42" y2="38">
              <stop offset="0%" stopColor="#c7d6fe" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
