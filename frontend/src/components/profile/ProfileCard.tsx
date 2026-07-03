import { motion } from "framer-motion";
import { Mail, Building2, Calendar } from "lucide-react";
import type { ApiUser } from "../../lib/api";
import RoleBadge from "../admin/RoleBadge";
import Avatar from "../ui/Avatar";

interface ProfileCardProps {
  user: ApiUser;
  isOnline?: boolean;
  lastSeen?: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfileCard({ user, isOnline, lastSeen }: ProfileCardProps) {
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const presenceLabel = isOnline ? "Online" : lastSeen ?? "Offline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border rounded-2xl bg-surface-card/80 backdrop-blur-sm overflow-hidden"
    >
      <div className="h-24 bg-gradient-to-r from-aether-600/30 via-purple-600/20 to-indigo-600/30" />
      <div className="px-6 pb-6 -mt-10">
        <Avatar
          initials={initials}
          gradient="from-aether-500 to-purple-600"
          size="lg"
          online={isOnline}
          className="ring-4 ring-surface-card"
        />
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-white">{user.full_name}</h2>
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Mail className="w-4 h-4 text-gray-500" />
            {user.email}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Building2 className="w-4 h-4 text-gray-500" />
            {user.company_name}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Calendar className="w-4 h-4 text-gray-500" />
            Joined {formatDate(user.created_at)}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              user.is_active
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/15 text-red-400 border-red-500/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-red-400"}`}
            />
            {user.is_active ? "Active Account" : "Inactive Account"}
          </span>
          {isOnline !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-gray-500"}`}
              />
              {presenceLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
