import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";

interface EmptyKnowledgeStateProps {
  title?: string;
  description?: string;
}

export default function EmptyKnowledgeState({
  title = "No documents yet",
  description = "Upload your first company document to build the knowledge base.",
}: EmptyKnowledgeStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-10 text-center flex-1 flex flex-col items-center justify-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 flex items-center justify-center mb-4">
        <FileSearch className="w-6 h-6 text-pink-300/70" />
      </div>
      <p className="text-sm text-gray-300 mb-1">{title}</p>
      <p className="text-xs text-gray-500 max-w-xs">{description}</p>
    </motion.div>
  );
}
