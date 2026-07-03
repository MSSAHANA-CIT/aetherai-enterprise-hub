import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

interface KnowledgeLayoutProps {
  children: ReactNode;
}

export default function KnowledgeLayout({ children }: KnowledgeLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-pink-400" />
          <h1 className="text-2xl font-semibold text-white">Company Knowledge Base</h1>
        </div>
        <p className="text-sm text-gray-500">
          Upload, search, summarize, and ask questions about internal documents.
        </p>
      </div>
      {children}
    </motion.div>
  );
}
