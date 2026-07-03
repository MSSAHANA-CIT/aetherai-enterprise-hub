import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CountdownRingProps {
  secondsLeft: number;
  totalSeconds: number;
  expired: boolean;
}

function CountdownRing({ secondsLeft, totalSeconds, expired }: CountdownRingProps) {
  const reducedMotion = useReducedMotion();
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-3" role="timer" aria-live="polite" aria-atomic="true">
      <div className="relative w-28 h-28">
        {/* Outer ambient glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={
            reducedMotion || expired
              ? undefined
              : {
                  boxShadow: [
                    "0 0 20px rgba(99,102,241,0.1)",
                    "0 0 35px rgba(139,92,246,0.2)",
                    "0 0 20px rgba(99,102,241,0.1)",
                  ],
                }
          }
          transition={{ duration: 3, repeat: Infinity }}
        />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />

          {/* Progress arc */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#countdownGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
            style={{
              filter: expired ? undefined : "drop-shadow(0 0 6px rgba(99,102,241,0.4))",
            }}
          />

          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + (radius - 4) * Math.cos(angle);
            const y1 = 50 + (radius - 4) * Math.sin(angle);
            const x2 = 50 + (radius + 2) * Math.cos(angle);
            const y2 = 50 + (radius + 2) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          <defs>
            <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={expired ? "#f59e0b" : "#6366f1"} />
              <stop offset="50%" stopColor={expired ? "#fbbf24" : "#8b5cf6"} />
              <stop offset="100%" stopColor={expired ? "#f59e0b" : "#a855f7"} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={display}
            initial={reducedMotion ? false : { opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xl font-mono font-semibold tracking-wider ${expired ? "text-amber-400" : "text-white"}`}
          >
            {display}
          </motion.span>
        </div>
      </div>

      <p className={`text-sm ${expired ? "text-amber-400/90" : "text-gray-400"}`}>
        {expired ? "Verification code has expired" : "Verification expires soon"}
      </p>
    </div>
  );
}

export default memo(CountdownRing);
