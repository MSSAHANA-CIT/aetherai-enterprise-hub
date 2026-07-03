import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Card } from "../../design/components/Card";
import { Badge } from "../../design/components/Badge";
import { EmptyState } from "../../design/components/EmptyState";
import { Spinner } from "../../design/components/Loading";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiNotification } from "../../lib/api";

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
}

export default function NotificationPreview() {
  const { token } = useAuth();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api.getNotifications(token).then((data) => {
      setItems(data.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  return (
    <Card variant="glass" className="h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-ds-primary-300" aria-hidden="true" />
          <h3 className="font-semibold text-ds-text-primary">Notification Preview</h3>
        </div>
        <Link to="/dashboard" className="text-xs text-ds-primary-300 hover:text-ds-primary-200 transition-colors">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." className="py-6" />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-ds-border bg-ds-glass hover:bg-ds-glass-medium transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">{item.title}</p>
                <p className="text-xs text-ds-text-muted mt-0.5">{formatTime(item.created_at)}</p>
              </div>
              {!item.is_read && <Badge variant="info" dot>New</Badge>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
