import { motion } from "framer-motion";
import { MoreHorizontal, Eye } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ApiUser } from "../../lib/api";
import type { PresenceUser } from "../../lib/api";
import RoleBadge from "./RoleBadge";

interface UserTableProps {
  users: ApiUser[];
  presenceMap?: Record<number, PresenceUser>;
  selectedUserId: number | null;
  onSelectUser: (user: ApiUser) => void;
  onChangeRole: (user: ApiUser) => void;
  onToggleStatus: (user: ApiUser) => void;
  currentUserId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserTable({
  users,
  presenceMap = {},
  selectedUserId,
  onSelectUser,
  onChangeRole,
  onToggleStatus,
  currentUserId,
}: UserTableProps) {
  return (
    <div className="gradient-border rounded-2xl overflow-hidden bg-surface-card/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {["Name", "Email", "Company", "Role", "Presence", "Status", "Created", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {users.map((user, index) => {
              const presence = presenceMap[user.id];
              const isSelected = selectedUserId === user.id;
              const isSelf = String(user.id) === currentUserId;

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onSelectUser(user)}
                  className={cn(
                    "cursor-pointer transition-colors group",
                    isSelected ? "bg-aether-500/10" : "hover:bg-white/[0.03]"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                        {user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.full_name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] text-aether-400">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{user.company_name}</td>
                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} size="sm" />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        presence?.is_online
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          presence?.is_online ? "bg-emerald-400" : "bg-gray-500"
                        )}
                      />
                      {presence?.is_online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        user.is_active
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/15 text-red-400 border-red-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          user.is_active ? "bg-emerald-400" : "bg-red-400"
                        )}
                      />
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(user);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRole(user);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Change role"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(user);
                        }}
                        disabled={isSelf}
                        className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isSelf ? "Cannot change own status" : "Toggle status"}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="py-16 text-center text-gray-500">No users found</div>
      )}
    </div>
  );
}
