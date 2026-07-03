import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { fadeUp } from "../../../../design/animations";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay: reducedMotion ? 0 : 0.05 }}
      className={cn("flex items-end justify-between gap-4 mb-4", className)}
    >
      <div>
        <h2 className="text-lg font-semibold text-ds-text-primary tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-ds-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
