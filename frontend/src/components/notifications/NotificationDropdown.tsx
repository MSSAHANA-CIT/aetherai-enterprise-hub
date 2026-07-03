import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { api, type ApiNotification } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import NotificationItem from "./NotificationItem";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationDropdown({
  open,
  onClose,
  unreadCount,
  onUnreadCountChange,
}: NotificationDropdownProps) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getNotifications(token);
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      onUnreadCountChange(unread);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, onUnreadCountChange]);

  useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleMarkRead = async (id: number) => {
    if (!token) return;
    try {
      await api.markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;
    setActionLoading(true);
    try {
      const data = await api.markAllNotificationsRead(token);
      setNotifications(data);
      onUnreadCountChange(0);
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-2xl bg-surface-card/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-gradient-to-r from-aether-500/10 to-purple-600/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <p className="text-[11px] text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => void handleMarkAllRead()}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-aether-300 hover:bg-aether-500/10 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark all read
                </motion.button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-aether-400 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                  <p className="text-xs text-gray-600 mt-1">Activity will appear here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => void handleMarkRead(id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
