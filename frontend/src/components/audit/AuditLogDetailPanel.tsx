import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ApiAuditLog } from "../../lib/api";

interface AuditLogDetailPanelProps {
  log: ApiAuditLog | null;
  onClose: () => void;
}

export default function AuditLogDetailPanel({ log, onClose }: AuditLogDetailPanelProps) {
  return (
    <AnimatePresence>
      {log && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="rounded-2xl border border-white/[0.08] bg-surface-card/80 backdrop-blur-2xl p-5 h-fit sticky top-24"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Event Details</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">Action</dt>
              <dd className="text-gray-200 font-medium">{log.action}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">Actor</dt>
              <dd className="text-gray-300">
                {log.actor ? `${log.actor.full_name} (${log.actor.email})` : "System"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">Entity</dt>
              <dd className="text-gray-300">
                {log.entity_type}
                {log.entity_id ? ` #${log.entity_id}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">IP Address</dt>
              <dd className="text-gray-400 font-mono text-xs">{log.ip_address ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">Timestamp</dt>
              <dd className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Metadata</dt>
              <dd>
                <pre className="text-[11px] text-gray-400 bg-black/30 rounded-lg p-3 overflow-x-auto border border-white/[0.06]">
                  {JSON.stringify(log.metadata_json ?? {}, null, 2)}
                </pre>
              </dd>
            </div>
          </dl>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
