import { useCallback, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "../../lib/utils";

interface DocumentUploadCardProps {
  onUpload: (file: File, description?: string) => Promise<void>;
  uploading?: boolean;
  error?: string | null;
}

export interface DocumentUploadCardHandle {
  openFilePicker: () => void;
}

const SUPPORTED_TYPES = ["PDF", "TXT", "MD", "DOCX"];

const DocumentUploadCard = forwardRef<DocumentUploadCardHandle, DocumentUploadCardProps>(function DocumentUploadCard(
  {
  onUpload,
  uploading = false,
  error = null,
},
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const file = event.dataTransfer.files?.[0];
      handleFile(file ?? null);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    await onUpload(selectedFile, description.trim() || undefined);
    setSelectedFile(null);
    setDescription("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      inputRef.current?.click();
    },
  }));

  return (
    <div id="document-upload" className="rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Upload Document</h2>
        <div className="flex items-center gap-1.5">
          {SUPPORTED_TYPES.map((type) => (
            <span
              key={type}
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.06]"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: dragActive ? "rgba(236, 72, 153, 0.5)" : "rgba(255,255,255,0.08)",
          backgroundColor: dragActive ? "rgba(236, 72, 153, 0.06)" : "rgba(255,255,255,0.02)",
        }}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive && "shadow-glow-sm"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />

        <motion.div
          animate={{ y: dragActive ? -4 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/20 flex items-center justify-center mb-4">
            <CloudUpload className="w-7 h-7 text-pink-300" />
          </div>

          <p className="text-sm text-gray-300 mb-1">
            Drag and drop a document here, or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-pink-300 hover:text-pink-200 underline underline-offset-2"
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-gray-500">Maximum file size: 10 MB</p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-pink-300" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-white truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/40"
            />

            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-glow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

export default DocumentUploadCard;
