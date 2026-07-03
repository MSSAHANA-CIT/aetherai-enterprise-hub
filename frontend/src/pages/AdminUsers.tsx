import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiUser } from "../lib/api";
import { staggerContainer } from "../lib/animations";
import UserManagementHeader from "../components/admin/UserManagementHeader";
import UserStatsCards from "../components/admin/UserStatsCards";
import UserTable from "../components/admin/UserTable";
import UserDetailPanel from "../components/admin/UserDetailPanel";
import RoleChangeModal from "../components/admin/RoleChangeModal";
import type { UserRole } from "../components/admin/RoleBadge";

export default function AdminUsers() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<number, import("../lib/api").PresenceUser>>({});
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        if (err.status === 401) {
          logout();
          navigate("/login", { replace: true, state: { from: { pathname: "/admin/users" } } });
        }
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadUsers = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [data, presence] = await Promise.all([
          api.getUsers(token),
          api.getPresence(token).catch(() => ({ users: [] as import("../lib/api").PresenceUser[] })),
        ]);
        setUsers(data);
        const map: Record<number, import("../lib/api").PresenceUser> = {};
        for (const p of presence.users ?? []) {
          map[p.id] = p;
        }
        setPresenceMap(map);
        if (selectedUser) {
          const updated = data.find((u) => u.id === selectedUser.id);
          setSelectedUser(updated ?? null);
        }
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to load users");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, selectedUser, handleAuthError]
  );

  useEffect(() => {
    void loadUsers();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (role: UserRole) => {
    if (!token || !roleModalUser) return;
    setRoleLoading(true);
    setError(null);

    try {
      const updated = await api.updateUserRole(token, roleModalUser.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (selectedUser?.id === updated.id) {
        setSelectedUser(updated);
      }
      setRoleModalUser(null);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update role");
      }
    } finally {
      setRoleLoading(false);
    }
  };

  const handleStatusToggle = async (targetUser: ApiUser, isActive?: boolean) => {
    if (!token) return;
    const newStatus = isActive ?? !targetUser.is_active;
    setStatusLoading(true);
    setError(null);

    try {
      const updated = await api.updateUserStatus(token, targetUser.id, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (selectedUser?.id === updated.id) {
        setSelectedUser(updated);
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update status");
      }
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-aether-400 animate-spin" />
        <p className="text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <UserManagementHeader onRefresh={() => loadUsers(true)} refreshing={refreshing} />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <UserStatsCards users={users} />

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <UserTable
            users={users}
            presenceMap={presenceMap}
            selectedUserId={selectedUser?.id ?? null}
            onSelectUser={setSelectedUser}
            onChangeRole={setRoleModalUser}
            onToggleStatus={(u) => handleStatusToggle(u)}
            currentUserId={user?.id ?? ""}
          />
        </div>
        <UserDetailPanel
          user={selectedUser}
          currentUserId={user?.id ?? ""}
          currentUserRole={user?.role ?? "employee"}
          onClose={() => setSelectedUser(null)}
          onChangeRole={setRoleModalUser}
          onToggleStatus={handleStatusToggle}
          statusLoading={statusLoading}
        />
      </div>

      <RoleChangeModal
        user={roleModalUser}
        currentUserRole={user?.role ?? "employee"}
        open={Boolean(roleModalUser)}
        loading={roleLoading}
        onClose={() => setRoleModalUser(null)}
        onConfirm={handleRoleChange}
      />
    </motion.div>
  );
}
