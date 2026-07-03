import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, FileText } from "lucide-react";
import { Card } from "../../design/components/Card";
import { Badge } from "../../design/components/Badge";
import { EmptyState } from "../../design/components/EmptyState";
import { Spinner } from "../../design/components/Loading";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function MeetingHighlights() {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState<{ id: number; title: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api.getMeetings(token).then((data) => {
      setMeetings(
        data.slice(0, 4).map((m: { id: number; title: string; created_at: string }) => ({
          id: m.id,
          title: m.title ?? "Untitled meeting",
          date: m.created_at,
        }))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  return (
    <Card variant="glass" className="h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Video className="w-5 h-5 text-ds-accent" aria-hidden="true" />
          <h3 className="font-semibold text-ds-text-primary">Meeting Highlights</h3>
        </div>
        <Link to="/meetings" className="text-xs text-ds-primary-300 hover:text-ds-primary-200 transition-colors">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : meetings.length === 0 ? (
        <EmptyState title="No meetings yet" description="Upload a meeting to see highlights here." className="py-6" />
      ) : (
        <ul className="space-y-2">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-ds-border bg-ds-glass hover:bg-ds-glass-medium transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-ds-accent/10 border border-ds-accent/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-ds-accent" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">{meeting.title}</p>
                <p className="text-xs text-ds-text-muted">{new Date(meeting.date).toLocaleDateString()}</p>
              </div>
              <Badge variant="ai">Summary</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
