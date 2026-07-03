import { Loader2, Mic, Sparkles, Trash2 } from "lucide-react";
import type { ApiMeeting } from "../../lib/api";
import Button from "../ui/Button";
import Card from "../ui/Card";
import MeetingLanguageBadge from "./MeetingLanguageBadge";

interface MeetingDetailPanelProps {
  meeting: ApiMeeting | null;
  onTranscribe?: () => Promise<void>;
  onSummarize?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  processing?: boolean;
  deleting?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MeetingDetailPanel({
  meeting,
  onTranscribe,
  onSummarize,
  onDelete,
  processing = false,
  deleting = false,
}: MeetingDetailPanelProps) {
  if (!meeting) {
    return (
      <Card variant="glass" className="p-5">
        <p className="text-sm text-gray-500">Select a meeting to view details and AI intelligence.</p>
      </Card>
    );
  }

  const canSummarize = Boolean(meeting.transcript?.trim());
  const needsTranscription = meeting.status === "pending_transcription" || !meeting.transcript?.trim();

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{meeting.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {meeting.file_name} · {meeting.file_type.toUpperCase()} · {formatFileSize(meeting.file_size)}
          </p>
          <div className="mt-3">
            <MeetingLanguageBadge language={meeting.detected_language} status={meeting.status} />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={deleting}
          onClick={() => void onDelete?.()}
          className="text-red-300 hover:text-red-200 flex-shrink-0"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
        {needsTranscription && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={processing}
            onClick={() => void onTranscribe?.()}
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            Transcribe
          </Button>
        )}
        {canSummarize && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={processing}
            onClick={() => void onSummarize?.()}
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {meeting.summary_text ? "Regenerate Summary" : "Generate Summary"}
          </Button>
        )}
      </div>
    </Card>
  );
}
