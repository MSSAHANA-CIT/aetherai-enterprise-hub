import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, api } from "../../lib/api";
import Button from "../ui/Button";

export type ExportFormat = "txt" | "md" | "json" | "csv" | "pdf";

interface ExportMenuProps {
  content: string;
  title: string;
  metadata?: Record<string, unknown>;
  formats?: ExportFormat[];
}

const ALL_FORMATS: { id: ExportFormat; label: string; icon: typeof FileText }[] = [
  { id: "txt", label: "TXT", icon: FileText },
  { id: "md", label: "Markdown", icon: FileType },
  { id: "json", label: "JSON", icon: FileJson },
  { id: "csv", label: "CSV", icon: FileSpreadsheet },
  { id: "pdf", label: "PDF", icon: Download },
];

export default function ExportMenu({
  content,
  title,
  metadata,
  formats = ["txt", "md", "json", "pdf"],
}: ExportMenuProps) {
  const { token } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleFormats = ALL_FORMATS.filter((format) => formats.includes(format.id));

  const handleExport = async (format: ExportFormat) => {
    if (!token || !content.trim()) return;
    setExporting(format);
    setError(null);
    try {
      const blob = await api.exportSummary(token, { content, title, format, metadata });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "_")}.${format === "md" ? "md" : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {visibleFormats.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant="secondary"
            size="sm"
            disabled={!content.trim() || exporting === id}
            onClick={() => void handleExport(id)}
          >
            <Icon className="w-3.5 h-3.5" />
            {exporting === id ? "Exporting..." : label}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
