import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { ApiDocument } from "../../lib/api";
import DocumentCard from "./DocumentCard";
import EmptyKnowledgeState from "./EmptyKnowledgeState";

interface DocumentListProps {
  documents: ApiDocument[];
  selectedId?: number | null;
  onSelect: (document: ApiDocument) => void;
  searchQuery?: string;
}

export default function DocumentList({
  documents,
  selectedId,
  onSelect,
  searchQuery = "",
}: DocumentListProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl p-4 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-semibold text-white">Documents</h2>
        </div>
        <span className="text-xs text-gray-500">{documents.length} total</span>
      </div>

      {documents.length === 0 ? (
        <EmptyKnowledgeState
          title={searchQuery ? "No matching documents" : "No documents yet"}
          description={
            searchQuery
              ? "Try a different search term or upload a new document."
              : "Upload your first company document to build the knowledge base."
          }
        />
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-24rem)]">
          {documents.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <DocumentCard
                document={document}
                selected={selectedId === document.id}
                onClick={() => onSelect(document)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
