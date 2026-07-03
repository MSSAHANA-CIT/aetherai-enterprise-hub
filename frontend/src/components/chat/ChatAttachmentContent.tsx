import { useEffect, useState } from "react";
import { Download, FileAudio, FileText, Film, ImageIcon, Loader2 } from "lucide-react";
import { api, type ApiMessage } from "../../lib/api";
import { cn } from "../../lib/utils";

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

interface ChatAttachmentContentProps {
  message: ApiMessage;
  token: string | null;
  isOwn: boolean;
}

export default function ChatAttachmentContent({ message, token, isOwn }: ChatAttachmentContentProps) {
  const attachment = message.attachment;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isMedia =
    message.message_type === "image" ||
    message.message_type === "video" ||
    message.message_type === "audio";

  useEffect(() => {
    if (!attachment || !token || !isMedia) {
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const blob = await api.fetchChatAttachment(token, message.id);
        objectUrl = URL.createObjectURL(blob);
        if (active) {
          setBlobUrl(objectUrl);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment, token, message.id, isMedia]);

  if (!attachment) {
    return <p>{message.content}</p>;
  }

  const handleDownload = async () => {
    if (!token) return;
    try {
      const blob = await api.fetchChatAttachment(token, message.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.file_name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    }
  };

  const showCaption =
    message.content.trim() &&
    message.content.trim() !== attachment.file_name &&
    message.content.trim() !== "Shared a file";

  const fileCard = (
    <button
      type="button"
      onClick={() => void handleDownload()}
      className={cn(
        "flex items-center gap-3 w-full text-left rounded-xl border px-3 py-3 transition-colors",
        isOwn
          ? "border-white/15 bg-white/10 hover:bg-white/15"
          : "border-white/[0.08] bg-black/20 hover:bg-black/30"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isOwn ? "bg-white/15" : "bg-white/[0.06]"
        )}
      >
        {message.message_type === "audio" ? (
          <FileAudio className="w-5 h-5 text-aether-300" />
        ) : message.message_type === "video" ? (
          <Film className="w-5 h-5 text-purple-300" />
        ) : (
          <FileText className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-[11px] text-gray-400">{formatBytes(attachment.file_size)}</p>
      </div>
      <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  );

  return (
    <div className="space-y-2">
      {message.message_type === "image" && (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/20 max-w-sm">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-aether-400 animate-spin" />
            </div>
          )}
          {!loading && blobUrl && (
            <img
              src={blobUrl}
              alt={attachment.file_name}
              className="max-h-80 w-full object-contain cursor-pointer"
              onClick={() => void handleDownload()}
            />
          )}
          {!loading && error && (
            <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
              <ImageIcon className="w-4 h-4" />
              Could not load image
            </div>
          )}
        </div>
      )}

      {message.message_type === "video" && (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 max-w-md">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-aether-400 animate-spin" />
            </div>
          )}
          {!loading && blobUrl && (
            <video src={blobUrl} controls className="max-h-80 w-full" preload="metadata">
              <track kind="captions" />
            </video>
          )}
          {!loading && error && fileCard}
        </div>
      )}

      {message.message_type === "audio" && (
        <div className="min-w-[240px]">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading audio...
            </div>
          )}
          {!loading && blobUrl && (
            <audio src={blobUrl} controls className="w-full" preload="metadata" />
          )}
          {!loading && error && fileCard}
        </div>
      )}

      {message.message_type === "file" && fileCard}

      {showCaption && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
    </div>
  );
}
