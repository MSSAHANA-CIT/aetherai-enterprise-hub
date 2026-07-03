import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";
import type { ApiMeeting } from "../../lib/api";
import { buildMeetingExportContent, formatDecision, parseMeetingJsonList } from "../../lib/meetingExportUtils";

interface MeetingDecisionsProps {
  meeting: ApiMeeting | null;
}

export default function MeetingDecisions({ meeting }: MeetingDecisionsProps) {
  const decisions = parseMeetingJsonList(meeting?.decisions);
  const exportContent = meeting ? buildMeetingExportContent(meeting, "decisions") : "";

  return (
    <Card variant="glass" className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-white">Decisions</h3>
        {exportContent && (
          <ExportMenu
            content={exportContent}
            title={`${meeting?.title || "Meeting"} — Decisions`}
            formats={["txt", "md", "json"]}
          />
        )}
      </div>

      {decisions.length === 0 ? (
        <p className="text-sm text-gray-500">Decisions will appear after AI summarization.</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
          {decisions.map((item, index) => (
            <li key={index}>{formatDecision(item)}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
