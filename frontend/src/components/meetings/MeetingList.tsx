import { motion } from "framer-motion";
import { Video } from "lucide-react";
import type { ApiMeeting } from "../../lib/api";
import EmptyState from "../ui/EmptyState";
import MeetingLanguageBadge from "./MeetingLanguageBadge";

interface MeetingListProps {
  meetings: ApiMeeting[];
  selectedId: number | null;
  onSelect: (meeting: ApiMeeting) => void;
}

export default function MeetingList({ meetings, selectedId, onSelect }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="No meetings yet"
        description="Upload your first recording to generate transcripts and summaries."
        className="py-10"
      />
    );
  }

  return (
    <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2 space-y-1">
      {meetings.map((meeting) => (
        <motion.button
          key={meeting.id}
          type="button"
          onClick={() => onSelect(meeting)}
          className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
            selectedId === meeting.id
              ? "bg-aether-500/15 border border-aether-500/25"
              : "hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <p className="text-sm font-medium text-white truncate">{meeting.title}</p>
          <p className="text-xs text-gray-500 mt-1">{meeting.file_name}</p>
          <div className="mt-2">
            <MeetingLanguageBadge language={meeting.detected_language} status={meeting.status} />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
