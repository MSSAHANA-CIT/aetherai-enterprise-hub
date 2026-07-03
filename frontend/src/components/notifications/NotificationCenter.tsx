import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { IconButton } from "../../design/components/Button";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationCenter() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await api.getUnreadNotificationCount(token);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [token]);

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(() => void fetchUnreadCount(), 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <IconButton
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-br from-ds-primary-500 to-ds-accent text-[10px] font-bold text-white ring-2 ring-ds-canvas">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </IconButton>

      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
