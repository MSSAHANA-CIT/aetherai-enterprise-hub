import { ClipboardList, Shield } from "lucide-react";
import Button from "../ui/Button";

interface AuditLogHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export default function AuditLogHeader({ onRefresh, refreshing }: AuditLogHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Audit Logs</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Track security events, admin actions, and enterprise activity
          </p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onRefresh} disabled={refreshing}>
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
