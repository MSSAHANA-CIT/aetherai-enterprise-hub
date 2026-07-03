import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import AnimatedCounter from "./shared/AnimatedCounter";
import LazySection from "./shared/LazySection";
import Avatar from "../../ui/Avatar";
import { Skeleton } from "../../../design/components/Loading";
import { Badge } from "../../../design/components/Badge";
import { cn } from "../../../lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: number): string {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-red-500",
  ];
  return colors[id % colors.length];
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Unknown";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function PresenceContent() {
  const { loading, presence, onlineCount, presenceLive } = useDashboardData();
  const navigate = useNavigate();

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" aria-busy="true" />;
  }

  const sorted = [...presence].sort((a, b) => Number(b.is_online) - Number(a.is_online));

  return (
    <DashboardCard variant="glass" padding="md" hover={false}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ds-text-muted">
          <AnimatedCounter value={onlineCount} /> online now
          {presenceLive && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="text-xs text-ds-primary hover:underline"
        >
          Open chat
        </button>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <p className="text-sm text-ds-text-muted text-center py-6">No team members found</p>
        ) : (
          sorted.slice(0, 8).map((user, i) => (
            <motion.button
              key={user.id}
              type="button"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate("/chat")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="relative">
                <Avatar
                  initials={getInitials(user.full_name)}
                  gradient={getAvatarColor(user.id)}
                  size="sm"
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ds-surface",
                    user.is_online ? "bg-emerald-400" : "bg-gray-500"
                  )}
                  aria-label={user.is_online ? "Online" : "Offline"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">{user.full_name}</p>
                <p className="text-[10px] text-ds-text-muted capitalize truncate">
                  {user.department ?? user.role.replace("_", " ")} ·{" "}
                  {user.is_online ? "Active" : formatLastSeen(user.last_seen)}
                </p>
              </div>
              <Badge variant={user.is_online ? "online" : "offline"} dot>
                {user.is_online ? "Online" : "Offline"}
              </Badge>
            </motion.button>
          ))
        )}
      </div>
    </DashboardCard>
  );
}

export default function EmployeePresence() {
  return (
    <section aria-label="Employee presence">
      <SectionHeader title="Employee Presence" subtitle="Live team status" />
      <LazySection>
        <PresenceContent />
      </LazySection>
    </section>
  );
}
