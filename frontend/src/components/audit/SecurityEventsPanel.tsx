import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";
import type { ApiAuditLog } from "../../lib/api";

interface SecurityEventsPanelProps {
  events: ApiAuditLog[];
}

export default function SecurityEventsPanel({ events }: SecurityEventsPanelProps) {
  const recent = events.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.03] backdrop-blur-xl p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-red-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Security Events</h3>
          <p className="text-[11px] text-gray-500">{events.length} security-related entries</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-gray-500">No security events recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-200">{event.action}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {event.actor?.full_name ?? "System"} · {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
