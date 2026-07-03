import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Clock, MapPin, Users, Video } from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import {
  getMeetingDisplayTime,
  getRecentRecordings,
  getUpcomingMeetings,
  parseMeetingParticipants,
} from "../../../lib/meetingUtils";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import { Badge } from "../../../design/components/Badge";
import { Button } from "../../../design/components/Button";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function MeetingCard({
  meeting,
  index,
  scheduled,
}: {
  meeting: ReturnType<typeof useDashboardData>["meetings"][number];
  index: number;
  scheduled: boolean;
}) {
  const navigate = useNavigate();
  const displayTime = getMeetingDisplayTime(meeting);
  const participants = parseMeetingParticipants(meeting.participants);
  const participantLabel =
    participants.length > 0 ? participants.join(", ") : meeting.company_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <DashboardCard variant="gradient" padding="md" className="group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ds-text-primary truncate">{meeting.title}</h3>
              <div className="flex items-center gap-2 text-xs text-ds-text-muted mt-0.5">
                <Clock className="w-3 h-3" />
                <time dateTime={displayTime.toISOString()}>
                  {displayTime.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
                {scheduled && meeting.duration_seconds ? (
                  <>
                    <span>·</span>
                    <span>{formatDuration(meeting.duration_seconds)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <Badge variant={scheduled ? "info" : meeting.summary_text ? "success" : "warning"}>
            {scheduled ? "Scheduled" : meeting.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-ds-text-muted mb-4">
          <span className="flex items-center gap-1 max-w-[50%] truncate">
            <Users className="w-3 h-3 shrink-0" />
            {participantLabel}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {meeting.room ?? "Virtual Room"}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 flex-1"
            onClick={() =>
              navigate("/ai", {
                state: {
                  initialPrompt: `Prepare me for the meeting: ${meeting.title}`,
                  mode: "video_meeting_summary",
                },
              })
            }
          >
            <Bot className="w-3.5 h-3.5" />
            AI Prep
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/meetings")}>
            {meeting.summary_text ? "View Summary" : "Open"}
          </Button>
        </div>
      </DashboardCard>
    </motion.div>
  );
}

function MeetingsContent() {
  const { loading, meetings } = useDashboardData();
  const navigate = useNavigate();

  const upcoming = useMemo(() => getUpcomingMeetings(meetings, 4), [meetings]);
  const recentRecordings = useMemo(() => getRecentRecordings(meetings, 2), [meetings]);

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" aria-busy="true" />;
  }

  if (upcoming.length === 0 && recentRecordings.length === 0) {
    return (
      <DashboardCard variant="glass" padding="lg">
        <p className="text-sm text-ds-text-muted text-center py-8">
          No scheduled meetings. Upload a recording or schedule one from Meetings.
        </p>
        <div className="flex justify-center">
          <Button variant="primary" size="sm" onClick={() => navigate("/meetings")}>
            Go to Meetings
          </Button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((meeting, i) => (
        <MeetingCard key={meeting.id} meeting={meeting} index={i} scheduled />
      ))}
      {recentRecordings.length > 0 && upcoming.length > 0 && (
        <p className="text-xs text-ds-text-muted uppercase tracking-wide pt-2">Recent recordings</p>
      )}
      {recentRecordings.map((meeting, i) => (
        <MeetingCard key={`rec-${meeting.id}`} meeting={meeting} index={upcoming.length + i} scheduled={false} />
      ))}
    </div>
  );
}

export default function UpcomingMeetings() {
  return (
    <section aria-label="Upcoming meetings">
      <SectionHeader title="Upcoming Meetings" subtitle="Scheduled sessions and recordings" />
      <LazySection>
        <MeetingsContent />
      </LazySection>
    </section>
  );
}
