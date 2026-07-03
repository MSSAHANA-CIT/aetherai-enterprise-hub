import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageTransitionModes } from "../animations";

export type PageTransitionMode = keyof typeof pageTransitionModes;

export interface PageTransitionProps {
  children: ReactNode;
  mode?: PageTransitionMode;
}

export function PageTransition({ children, mode = "fade" }: PageTransitionProps) {
  const location = useLocation();
  const variants = pageTransitionModes[mode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedPage({ children, mode = "slide" }: PageTransitionProps) {
  return <PageTransition mode={mode}>{children}</PageTransition>;
}
