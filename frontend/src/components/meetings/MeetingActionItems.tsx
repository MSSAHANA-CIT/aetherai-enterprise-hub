import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";
import type { ApiMeeting } from "../../lib/api";
import { buildMeetingExportContent, formatActionItem, parseMeetingJsonList } from "../../lib/meetingExportUtils";

interface MeetingActionItemsProps {
  meeting: ApiMeeting | null;
}

export default function MeetingActionItems({ meeting }: MeetingActionItemsProps) {
  const actions = parseMeetingJsonList(meeting?.action_items);
  const exportContent = meeting ? buildMeetingExportContent(meeting, "action_items") : "";

  return (
    <Card variant="glass" className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-white">Action Items</h3>
        {exportContent && (
          <ExportMenu
            content={exportContent}
            title={`${meeting?.title || "Meeting"} — Action Items`}
            formats={["txt", "md", "json", "csv"]}
            metadata={{ rows: actions }}
          />
        )}
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-gray-500">Action items with owners and deadlines will appear after summarization.</p>
      ) : (
        <ul className="space-y-3">
          {actions.map((item, index) => {
            const record = item && typeof item === "object" ? (item as Record<string, string>) : null;
            const task = record?.task || record?.description || formatActionItem(item);
            const owner = record?.owner || record?.assignee;
            const deadline = record?.deadline || record?.due_date;

            return (
              <li
                key={index}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-gray-300"
              >
                <p>{task}</p>
                {(owner || deadline) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {[owner && `Owner: ${owner}`, deadline && `Due: ${deadline}`].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
