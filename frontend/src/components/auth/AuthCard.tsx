import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { fadeUp } from "../../design/animations";
import { GlassCard } from "../../design/components/Card";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn("relative", className)}
    >
      <GlassCard padding="lg" className="relative overflow-hidden shadow-ds-floating">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-ds-primary/15 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-ds-text-primary tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ds-text-muted leading-relaxed">{subtitle}</p>
        </div>

        <div className="relative">{children}</div>
      </GlassCard>
    </motion.div>
  );
}
