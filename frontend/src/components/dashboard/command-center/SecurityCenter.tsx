import { useAuth } from "../../../context/AuthContext";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import StatusIndicator from "./shared/StatusIndicator";
import SectionHeader from "./shared/SectionHeader";
import RoleBadge from "../../admin/RoleBadge";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import { Shield, Key, Lock, Route, LogIn, User } from "lucide-react";

function SecurityContent() {
  const { user } = useAuth();
  const { loading, security } = useDashboardData();

  if (loading) {
    return <Skeleton className="h-56 rounded-2xl" aria-busy="true" />;
  }

  const items = [
    {
      id: "otp",
      label: "OTP Enabled",
      status: security?.otp_logins_enabled ? ("operational" as const) : ("degraded" as const),
      icon: Key,
    },
    {
      id: "google",
      label: "Google Verified",
      status: security?.gmail_api_configured ? ("operational" as const) : ("degraded" as const),
      icon: Shield,
    },
    {
      id: "jwt",
      label: "JWT Active",
      status: "operational" as const,
      icon: Lock,
    },
    {
      id: "routes",
      label: "Protected Routes",
      status: "operational" as const,
      value: security?.protected_routes_count ?? 0,
      icon: Route,
    },
  ];

  return (
    <DashboardCard variant="glass" padding="md" hover={false}>
      <div className="space-y-3 mb-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-ds-text-muted" />
                <span className="text-sm text-ds-text-secondary">{item.label}</span>
                {"value" in item && item.value !== undefined && (
                  <span className="text-xs text-ds-text-muted">({item.value})</span>
                )}
              </div>
              <StatusIndicator status={item.status} showLabel={false} />
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-ds-border space-y-2">
        <div className="flex items-center gap-2 text-sm text-ds-text-muted">
          <LogIn className="w-4 h-4" />
          <span>Last Login: Today</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-ds-text-muted" />
          <span className="text-sm text-ds-text-secondary">Role:</span>
          <RoleBadge role={user?.role ?? "employee"} size="sm" />
        </div>
      </div>
    </DashboardCard>
  );
}

export default function SecurityCenter() {
  return (
    <section aria-label="Security center">
      <SectionHeader title="Security Center" subtitle="Account protection status" />
      <LazySection>
        <SecurityContent />
      </LazySection>
    </section>
  );
}
