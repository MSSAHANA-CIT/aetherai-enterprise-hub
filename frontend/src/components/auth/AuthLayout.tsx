import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  CheckSquare,
  BookOpen,
  Shield,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { authFeatureHighlights } from "../../data/mockData";
import { cn } from "../../lib/utils";
import { fadeUp } from "../../design/animations";
import { FloatingCard } from "../../design/components/Card";

const iconMap = {
  Bot,
  MessageSquare,
  CheckSquare,
  BookOpen,
  Shield,
  BarChart3,
} as const;

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-ds-canvas relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-ds-primary-950/40 via-ds-canvas to-ds-accent/10" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[520px] h-[520px] rounded-full bg-ds-primary/25 blur-[120px] -top-40 -left-40"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[640px] h-[640px] rounded-full bg-ds-accent/20 blur-[120px] right-[-180px] top-1/4"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>

        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 border-l border-ds-border">
          <div className="relative w-full max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ds-primary-500 to-ds-accent flex items-center justify-center shadow-ds-glow-sm">
                  <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-ds-primary-300 font-medium">AetherAI Enterprise</p>
                  <p className="text-xs text-ds-text-muted">Unified AI workspace platform</p>
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-ds-text-primary leading-tight mb-3">
                Intelligence that scales with your team
              </h2>
              <p className="text-ds-text-muted text-sm leading-relaxed">
                Collaborate with AI assistants, manage tasks, and unlock enterprise knowledge —
                all in one secure workspace.
              </p>
            </motion.div>

            <div className="relative h-[420px]">
              {authFeatureHighlights.map((feature, index) => {
                const Icon = iconMap[feature.icon];
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: [0, -6, 0],
                      scale: 1,
                    }}
                    transition={{
                      opacity: { duration: 0.5, delay: 0.3 + index * 0.1 },
                      y: {
                        duration: 4 + index * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.4,
                      },
                      scale: { duration: 0.5, delay: 0.3 + index * 0.1 },
                    }}
                    className={cn("absolute w-52", feature.position)}
                  >
                    <FloatingCard padding="sm" className="shadow-ds-glass">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                            feature.gradient
                          )}
                        >
                          <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ds-text-primary">{feature.title}</p>
                          <p className="text-xs text-ds-text-muted mt-0.5 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </FloatingCard>
                  </motion.div>
                );
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-ds-primary/10 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
