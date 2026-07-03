import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";

const MESSAGES = [
  "Preparing encrypted workspace...",
  "Initializing AI systems...",
  "Loading enterprise knowledge...",
  "Verifying security...",
  "Almost ready...",
];

function MobileWorkspaceStrip() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % MESSAGES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20 p-4"
    >
      <div className="max-w-[480px] mx-auto p-4 rounded-2xl bg-[#0c0c14]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Workspace Initializing</p>
            <div className="h-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  className="text-xs text-gray-400 truncate"
                >
                  {MESSAGES[index]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-aether-500 to-purple-500"
            animate={{ width: ["20%", "85%", "60%", "95%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default memo(MobileWorkspaceStrip);
