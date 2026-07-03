import { motion } from "framer-motion";
import { Calendar, FileText, Sparkles, User } from "lucide-react";
import Badge from "../ui/Badge";
import { cn } from "../../lib/utils";
import type { ApiDocument } from "../../lib/api";

interface DocumentCardProps {
  document: ApiDocument;
  selected?: boolean;
  onClick?: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ document, selected = false, onClick }: DocumentCardProps) {
  const preview = document.description || document.extracted_text;
  const previewText = preview.length > 120 ? `${preview.slice(0, 120)}...` : preview;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-all duration-200",
        "bg-surface-card/60 backdrop-blur-xl shadow-card",
        selected
          ? "border-pink-500/40 bg-pink-500/[0.08] shadow-glow-sm"
          : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-pink-300" />
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{document.title}</h3>
        </div>
        <Badge variant="purple" className="flex-shrink-0 uppercase">
          {document.file_type}
        </Badge>
      </div>

      {previewText && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{previewText}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span>{formatFileSize(document.file_size)}</span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(document.created_at)}
        </span>
        {document.uploader && (
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            {document.uploader.full_name}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {document.ai_summary ? "Summary ready" : "No summary"}
        </span>
      </div>
    </motion.button>
  );
}
