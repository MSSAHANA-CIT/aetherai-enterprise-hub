import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiMeeting } from "../lib/api";
import PageHeader from "../components/ui/PageHeader";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import MeetingUploadCard from "../components/meetings/MeetingUploadCard";
import MeetingList from "../components/meetings/MeetingList";
import MeetingDetailPanel from "../components/meetings/MeetingDetailPanel";
import MeetingTranscriptPanel from "../components/meetings/MeetingTranscriptPanel";
import MeetingSummaryPanel from "../components/meetings/MeetingSummaryPanel";
import MeetingDecisions from "../components/meetings/MeetingDecisions";
import MeetingActionItems from "../components/meetings/MeetingActionItems";
import MeetingQAPanel from "../components/meetings/MeetingQAPanel";

export default function Meetings() {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState<ApiMeeting[]>([]);
  const [selected, setSelected] = useState<ApiMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMeetingInState = useCallback((updated: ApiMeeting) => {
    setMeetings((prev) => prev.map((meeting) => (meeting.id === updated.id ? updated : meeting)));
    setSelected(updated);
  }, []);

  const loadMeetings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMeetings(token);
      setMeetings(data);
      setSelected((prev) => {
        if (prev) {
          const refreshed = data.find((meeting) => meeting.id === prev.id);
          return refreshed ?? data[0] ?? null;
        }
        return data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const handleUpload = async (file: File, title: string) => {
    if (!token) return;
    setUploading(true);
    setError(null);
    try {
      const meeting = await api.uploadMeeting(token, file, { title });
      setMeetings((prev) => [meeting, ...prev]);
      setSelected(meeting);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!token || !selected) return;
    setProcessing(true);
    setError(null);
    try {
      const updated = await api.transcribeMeeting(token, selected.id);
      updateMeetingInState(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Transcription failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleSummarize = async () => {
    if (!token || !selected) return;
    setProcessing(true);
    setError(null);
    try {
      const updated = await api.summarizeMeeting(token, selected.id);
      updateMeetingInState(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Summarization failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selected) return;
    if (!window.confirm(`Delete "${selected.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      await api.deleteMeeting(token, selected.id);
      setMeetings((prev) => {
        const next = prev.filter((meeting) => meeting.id !== selected.id);
        setSelected(next[0] ?? null);
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete meeting");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading meeting intelligence..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meeting Intelligence"
        subtitle="Upload recordings for transcription, multilingual summaries, decisions, action items, and AI Q&A."
      />

      {error && <ErrorState message={error} onRetry={() => void loadMeetings()} />}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <MeetingUploadCard onUpload={handleUpload} uploading={uploading} />

          <div className="rounded-2xl border border-white/[0.08] bg-surface-card/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Recent Meetings</h3>
            </div>
            <MeetingList
              meetings={meetings}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <MeetingDetailPanel
            meeting={selected}
            onTranscribe={handleTranscribe}
            onSummarize={handleSummarize}
            onDelete={handleDelete}
            processing={processing}
            deleting={deleting}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MeetingSummaryPanel meeting={selected} />
            <MeetingTranscriptPanel meeting={selected} />
            <MeetingDecisions meeting={selected} />
            <MeetingActionItems meeting={selected} />
          </div>

          <MeetingQAPanel meeting={selected} />
        </div>
      </div>
    </div>
  );
}
