import { motion } from "framer-motion";
import { Calendar, FileText, Trash2, User } from "lucide-react";
import Badge from "../ui/Badge";
import type { ApiDocument } from "../../lib/api";
import DocumentSummaryPanel from "./DocumentSummaryPanel";
import DocumentQAPanel from "./DocumentQAPanel";
import EmptyKnowledgeState from "./EmptyKnowledgeState";

interface DocumentDetailPanelProps {
  document: ApiDocument | null;
  onSummarize: () => Promise<void>;
  onAsk: (question: string) => Promise<string>;
  onDelete: () => Promise<void>;
  summarizing?: boolean;
  asking?: boolean;
  deleting?: boolean;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentDetailPanel({
  document,
  onSummarize,
  onAsk,
  onDelete,
  summarizing = false,
  asking = false,
  deleting = false,
}: DocumentDetailPanelProps) {
  if (!document) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl p-4 shadow-card h-full min-h-[520px]">
        <EmptyKnowledgeState
          title="Select a document"
          description="Choose a document from the list to view details, generate an AI summary, or ask questions."
        />
      </div>
    );
  }

  const textPreview = document.extracted_text
    ? document.extracted_text.length > 1200
      ? `${document.extracted_text.slice(0, 1200)}...`
      : document.extracted_text
    : "No extractable text found in this document.";

  const handleDelete = () => {
    if (window.confirm(`Delete "${document.title}"? This action cannot be undone.`)) {
      void onDelete();
    }
  };

  return (
    <motion.div
      key={document.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl p-5 shadow-card space-y-5 min-h-[520px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-pink-300" />
            </div>
            <h2 className="text-lg font-semibold text-white truncate">{document.title}</h2>
            <Badge variant="purple" className="uppercase flex-shrink-0">
              {document.file_type}
            </Badge>
          </div>

          {document.description && (
            <p className="text-sm text-gray-400 mb-3">{document.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
            <span className="text-gray-600">{document.file_name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Extracted Text Preview
        </h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {textPreview}
        </p>
      </div>

      <DocumentSummaryPanel
        summary={document.ai_summary}
        title={document.title}
        onGenerate={() => void onSummarize()}
        generating={summarizing}
      />

      <DocumentQAPanel onAsk={onAsk} asking={asking} documentTitle={document.title} />
    </motion.div>
  );
}
