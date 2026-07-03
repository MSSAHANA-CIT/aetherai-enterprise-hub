import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiDocument } from "../lib/api";
import KnowledgeLayout from "../components/knowledge/KnowledgeLayout";
import KnowledgeSearchBar from "../components/knowledge/KnowledgeSearchBar";
import DocumentUploadCard, { type DocumentUploadCardHandle } from "../components/knowledge/DocumentUploadCard";
import DocumentList from "../components/knowledge/DocumentList";
import DocumentDetailPanel from "../components/knowledge/DocumentDetailPanel";

export default function KnowledgeBase() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const uploadRef = useRef<DocumentUploadCardHandle>(null);

  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ApiDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/knowledge" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadDocuments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getDocuments(token);
      setDocuments(data);

      const documentFromQuery = searchParams.get("document");
      if (documentFromQuery) {
        const parsed = Number(documentFromQuery);
        const match = data.find((document) => document.id === parsed);
        if (match) {
          setSelectedDocument(match);
        }
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to load documents");
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError, searchParams]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const state = location.state as { openUpload?: boolean } | null;
    if (!state?.openUpload) return;

    const timer = window.setTimeout(() => {
      document.getElementById("document-upload")?.scrollIntoView({ behavior: "smooth", block: "start" });
      uploadRef.current?.openFilePicker();
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.state, location.pathname, location.search, navigate]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;

    return documents.filter((document) => {
      const haystack = [
        document.title,
        document.description,
        document.file_name,
        document.extracted_text,
        document.ai_summary ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [documents, searchQuery]);

  const handleUpload = async (file: File, description?: string) => {
    if (!token) return;

    setUploading(true);
    setError(null);

    try {
      const created = await api.uploadDocument(token, file, description);
      setDocuments((prev) => [created, ...prev]);
      setSelectedDocument(created);
      setSearchParams({ document: String(created.id) });
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to upload document");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSelectDocument = (document: ApiDocument) => {
    setSelectedDocument(document);
    setSearchParams({ document: String(document.id) });
  };

  const handleSummarize = async () => {
    if (!token || !selectedDocument) return;

    setSummarizing(true);
    setError(null);

    try {
      const updated = await api.summarizeDocument(token, selectedDocument.id);
      setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)));
      setSelectedDocument(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to generate summary");
      }
    } finally {
      setSummarizing(false);
    }
  };

  const handleAsk = async (question: string): Promise<string> => {
    if (!token || !selectedDocument) return "";

    setAsking(true);
    setError(null);

    try {
      const result = await api.askDocumentQuestion(token, selectedDocument.id, question);
      return result.answer;
    } catch (err) {
      if (!handleAuthError(err)) {
        const message = err instanceof ApiError ? err.message : "Failed to get answer";
        setError(message);
        return message;
      }
      return "";
    } finally {
      setAsking(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedDocument) return;

    setDeleting(true);
    setError(null);

    try {
      await api.deleteDocument(token, selectedDocument.id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocument.id));
      setSelectedDocument(null);
      setSearchParams({});
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to delete document");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7.5rem)]">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          Loading knowledge base...
        </p>
      </div>
    );
  }

  return (
    <KnowledgeLayout>
      <KnowledgeSearchBar value={searchQuery} onChange={setSearchQuery} />

      <DocumentUploadCard
        ref={uploadRef}
        onUpload={handleUpload}
        uploading={uploading}
        error={error}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 min-h-[520px]">
        <DocumentList
          documents={filteredDocuments}
          selectedId={selectedDocument?.id}
          onSelect={handleSelectDocument}
          searchQuery={searchQuery}
        />

        <DocumentDetailPanel
          document={selectedDocument}
          onSummarize={handleSummarize}
          onAsk={handleAsk}
          onDelete={handleDelete}
          summarizing={summarizing}
          asking={asking}
          deleting={deleting}
        />
      </div>
    </KnowledgeLayout>
  );
}
