import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ApiNotification } from "../../lib/api";
import NotificationBadge from "./NotificationBadge";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

interface NotificationItemProps {
  notification: ApiNotification;
  onMarkRead: (id: number) => void;
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative px-4 py-3.5 border-b border-white/[0.04] transition-colors ${
        notification.is_read ? "bg-transparent" : "bg-aether-500/[0.04]"
      } hover:bg-white/[0.03]`}
    >
      {!notification.is_read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-aether-400 shadow-glow-sm" />
      )}

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-medium truncate ${notification.is_read ? "text-gray-300" : "text-white"}`}>
              {notification.title}
            </p>
            <NotificationBadge type={notification.notification_type} />
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notification.message}</p>
          <p className="text-[11px] text-gray-600 mt-1.5">{formatRelativeTime(notification.created_at)}</p>
        </div>

        {!notification.is_read && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMarkRead(notification.id)}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-aether-300 hover:bg-aether-500/10 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
