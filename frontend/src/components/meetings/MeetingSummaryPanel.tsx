import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";
import type { ApiMeeting } from "../../lib/api";
import { buildMeetingExportContent } from "../../lib/meetingExportUtils";

interface MeetingSummaryPanelProps {
  meeting: ApiMeeting | null;
}

export default function MeetingSummaryPanel({ meeting }: MeetingSummaryPanelProps) {
  const summary = meeting?.summary_text || "";
  const exportContent = meeting ? buildMeetingExportContent(meeting, "summary") : "";

  return (
    <Card variant="glass" className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-white">AI Summary</h3>
        {exportContent && (
          <ExportMenu content={exportContent} title={`${meeting?.title || "Meeting"} — Summary`} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar text-sm text-gray-300">
        <p className="leading-relaxed whitespace-pre-wrap">
          {summary || "Summary will appear after transcription and AI processing."}
        </p>
      </div>
    </Card>
  );
}
