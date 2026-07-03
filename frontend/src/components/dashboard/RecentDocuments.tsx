import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText } from "lucide-react";
import { Card } from "../../design/components/Card";
import { Badge } from "../../design/components/Badge";
import { EmptyState } from "../../design/components/EmptyState";
import { Spinner } from "../../design/components/Loading";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function RecentDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<{ id: number; title: string; type: string; updated: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api.getDocuments(token).then((data) => {
      setDocuments(
        data.slice(0, 4).map((d) => ({
          id: d.id,
          title: d.title ?? d.file_name ?? "Untitled",
          type: d.file_type ?? "document",
          updated: d.created_at,
        }))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  return (
    <Card variant="glass" className="h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-ds-info" aria-hidden="true" />
          <h3 className="font-semibold text-ds-text-primary">Recent Documents</h3>
        </div>
        <Link to="/knowledge" className="text-xs text-ds-primary-300 hover:text-ds-primary-200 transition-colors">
          Knowledge base
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : documents.length === 0 ? (
        <EmptyState title="No documents" description="Upload documents to your knowledge base." className="py-6" />
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-ds-border bg-ds-glass hover:bg-ds-glass-medium transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-ds-info-muted border border-ds-info-border flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-ds-info" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">{doc.title}</p>
                <p className="text-xs text-ds-text-muted">{new Date(doc.updated).toLocaleDateString()}</p>
              </div>
              <Badge variant="info">{doc.type}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
