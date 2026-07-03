import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import type { ApiUser } from "../../lib/api";
import Button from "../ui/Button";
import RoleBadge, { getAssignableRoles, type UserRole } from "./RoleBadge";

interface RoleChangeModalProps {
  user: ApiUser | null;
  currentUserRole: string;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
}

export default function RoleChangeModal({
  user,
  currentUserRole,
  open,
  loading,
  onClose,
  onConfirm,
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const assignableRoles = user ? getAssignableRoles(currentUserRole, user.role) : [];
  const activeRole = selectedRole ?? (user?.role as UserRole);

  const handleClose = () => {
    setSelectedRole(null);
    onClose();
  };

  if (!open || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md gradient-border rounded-2xl bg-surface-card shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Change Role</h2>
                <p className="text-xs text-gray-500">{user.full_name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-400">
              Current role: <RoleBadge role={user.role} size="sm" />
            </p>

            {assignableRoles.length === 0 ? (
              <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                You do not have permission to change this user&apos;s role.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {assignableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeRole === role
                        ? "border-aether-500/50 bg-aether-500/10"
                        : "border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <RoleBadge role={role} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06] bg-white/[0.02]">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onConfirm(activeRole)}
              disabled={loading || assignableRoles.length === 0 || activeRole === user.role}
            >
              {loading ? "Saving..." : "Confirm Change"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
