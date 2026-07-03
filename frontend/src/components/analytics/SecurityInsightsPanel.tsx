import { motion } from "framer-motion";
import { Bot, KeyRound, Lock, Mail, Shield, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import type { SecurityAnalytics } from "../../lib/api";

interface SecurityInsightsPanelProps {
  data: SecurityAnalytics | null;
  loading?: boolean;
}

function StatusBadge({ enabled, label }: { enabled: boolean; label?: string }) {
  return (
    <Badge variant={enabled ? "success" : "warning"}>
      {label ?? (enabled ? "Enabled" : "Not configured")}
    </Badge>
  );
}

export default function SecurityInsightsPanel({ data, loading = false }: SecurityInsightsPanelProps) {
  if (loading || !data) {
    return (
      <Card variant="gradient" glow className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded bg-white/[0.06]" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </Card>
    );
  }

  const items = [
    {
      label: "OTP Login",
      value: "Enabled",
      icon: KeyRound,
      status: data.otp_logins_enabled,
      type: "enabled" as const,
    },
    {
      label: "Gmail API",
      value: data.gmail_api_configured ? "Configured" : "Not configured",
      icon: Mail,
      status: data.gmail_api_configured,
      type: "configured" as const,
    },
    {
      label: "OpenAI",
      value: data.openai_configured ? "Configured" : "Not configured",
      icon: Bot,
      status: data.openai_configured,
      type: "configured" as const,
    },
    {
      label: "Protected Routes",
      value: `${data.protected_routes_count} endpoints`,
      icon: Lock,
      status: true,
      type: "count" as const,
    },
    {
      label: "Password Reset",
      value: "Enabled",
      icon: ShieldCheck,
      status: data.password_reset_flow_enabled,
      type: "enabled" as const,
    },
  ];

  return (
    <Card variant="gradient" glow className="h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <Shield className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">Security Insights</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-white truncate">{item.value}</p>
                </div>
              </div>
              {item.type === "enabled" && <StatusBadge enabled={item.status} />}
              {item.type === "configured" && (
                <StatusBadge
                  enabled={item.status}
                  label={item.status ? "Configured" : "Not configured"}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
