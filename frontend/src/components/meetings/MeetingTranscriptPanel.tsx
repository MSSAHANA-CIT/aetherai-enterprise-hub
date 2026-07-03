import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";
import type { ApiMeeting } from "../../lib/api";
import { buildMeetingExportContent } from "../../lib/meetingExportUtils";

interface MeetingTranscriptPanelProps {
  meeting: ApiMeeting | null;
}

export default function MeetingTranscriptPanel({ meeting }: MeetingTranscriptPanelProps) {
  const transcript = meeting?.transcript || "";
  const exportContent = meeting ? buildMeetingExportContent(meeting, "transcript") : "";

  return (
    <Card variant="glass" className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-white">Transcript</h3>
        {exportContent && (
          <ExportMenu content={exportContent} title={`${meeting?.title || "Meeting"} — Transcript`} />
        )}
      </div>
      <div className="flex-1 max-h-[420px] overflow-y-auto custom-scrollbar text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {transcript || "Transcript will appear here after processing."}
      </div>
    </Card>
  );
}
