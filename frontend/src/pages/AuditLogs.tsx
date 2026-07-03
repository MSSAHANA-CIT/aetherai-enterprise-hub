import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiAuditLog } from "../lib/api";
import { staggerContainer } from "../lib/animations";
import AuditLogHeader from "../components/audit/AuditLogHeader";
import AuditLogFilters, { type AuditFilterCategory } from "../components/audit/AuditLogFilters";
import AuditLogTable from "../components/audit/AuditLogTable";
import SecurityEventsPanel from "../components/audit/SecurityEventsPanel";
import AuditLogDetailPanel from "../components/audit/AuditLogDetailPanel";

const SECURITY_ACTIONS = new Set([
  "login_otp_sent",
  "login_otp_verified",
  "password_changed",
  "password_reset",
  "user_role_changed",
  "user_activated",
  "user_deactivated",
]);

function matchesFilter(log: ApiAuditLog, filter: AuditFilterCategory): boolean {
  if (filter === "all") return true;
  if (filter === "security") return SECURITY_ACTIONS.has(log.action);
  if (filter === "ai") return log.action.includes("ai") || log.entity_type === "summary";
  if (filter === "tasks") return log.entity_type === "task" || log.action.includes("task");
  if (filter === "documents") return log.entity_type === "document" || log.action.includes("document");
  if (filter === "users") return log.entity_type === "user" || log.action.startsWith("user_");
  return true;
}

export default function AuditLogs() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<ApiAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AuditFilterCategory>("all");
  const [selectedLog, setSelectedLog] = useState<ApiAuditLog | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        if (err.status === 401) {
          logout();
          navigate("/login", { replace: true, state: { from: { pathname: "/admin/audit-logs" } } });
        }
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadLogs = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [allLogs, secLogs] = await Promise.all([
          api.getAuditLogs(token),
          api.getSecurityAuditLogs(token),
        ]);
        setLogs(allLogs);
        setSecurityLogs(secLogs);
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to load audit logs");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, handleAuthError]
  );

  useEffect(() => {
    void loadLogs();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLogs = useMemo(
    () => logs.filter((log) => matchesFilter(log, filter)),
    [logs, filter]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-aether-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6 max-w-[1600px] mx-auto"
    >
      <AuditLogHeader onRefresh={() => void loadLogs(true)} refreshing={refreshing} />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <AuditLogFilters active={filter} onChange={setFilter} />
          <AuditLogTable
            logs={filteredLogs}
            selectedId={selectedLog?.id ?? null}
            onSelect={setSelectedLog}
          />
        </div>

        <div className="space-y-4">
          <SecurityEventsPanel events={securityLogs} />
          <AuditLogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
      </div>
    </motion.div>
  );
}
