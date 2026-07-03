import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Building2, Calendar, Shield, KeyRound } from "lucide-react";
import type { ApiUser } from "../../lib/api";
import RoleBadge from "./RoleBadge";
import UserStatusToggle from "./UserStatusToggle";

interface UserDetailPanelProps {
  user: ApiUser | null;
  currentUserId: string;
  currentUserRole: string;
  onClose: () => void;
  onChangeRole: (user: ApiUser) => void;
  onToggleStatus: (user: ApiUser, isActive: boolean) => void;
  statusLoading: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserDetailPanel({
  user,
  currentUserId,
  currentUserRole,
  onClose,
  onChangeRole,
  onToggleStatus,
  statusLoading,
}: UserDetailPanelProps) {
  const isSelf = user ? String(user.id) === currentUserId : false;
  const canModifySuperAdmin =
    currentUserRole === "super_admin" || user?.role !== "super_admin";

  return (
    <AnimatePresence>
      {user && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full xl:w-96 flex-shrink-0"
        >
          <div className="gradient-border rounded-2xl bg-surface-card/90 backdrop-blur-sm sticky top-6">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">User Details</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-glow-sm">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{user.full_name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{user.company_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Control
                </h3>
                <UserStatusToggle
                  isActive={user.is_active}
                  disabled={isSelf || !canModifySuperAdmin || statusLoading}
                  onChange={(active) => onToggleStatus(user, active)}
                  loading={statusLoading}
                />
                {canModifySuperAdmin && (
                  <button
                    type="button"
                    onClick={() => onChangeRole(user)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <Shield className="w-4 h-4 text-aether-400" />
                    Change Role
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </h3>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <KeyRound className="w-4 h-4" />
                    <span>OTP login enabled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>JWT session protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
