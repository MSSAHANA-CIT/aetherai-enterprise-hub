import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { ApiAuditLog } from "../../lib/api";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function metadataPreview(metadata: Record<string, unknown> | null | undefined): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  const preview = JSON.stringify(metadata);
  return preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
}

interface AuditLogTableProps {
  logs: ApiAuditLog[];
  selectedId: number | null;
  onSelect: (log: ApiAuditLog) => void;
}

export default function AuditLogTable({ logs, selectedId, onSelect }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-12 text-center">
        <p className="text-gray-400">No audit logs match the current filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              {["Action", "Actor", "Entity", "Entity ID", "Time", "Metadata"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelect(log)}
                className={`border-b border-white/[0.04] cursor-pointer transition-colors ${
                  selectedId === log.id
                    ? "bg-aether-500/[0.08]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <td className="px-4 py-3.5">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-white/[0.05] text-gray-200 border border-white/[0.08]">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {log.actor ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-aether-500/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-aether-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-200">{log.actor.full_name}</p>
                        <p className="text-[11px] text-gray-500">{log.actor.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">System</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-300">{log.entity_type}</td>
                <td className="px-4 py-3.5 text-sm text-gray-400 font-mono">{log.entity_id ?? "—"}</td>
                <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(log.created_at)}
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500 font-mono max-w-[200px] truncate">
                  {metadataPreview(log.metadata_json)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
