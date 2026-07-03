import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import StatusIndicator from "./shared/StatusIndicator";
import SectionHeader from "./shared/SectionHeader";
import LazySection from "./shared/LazySection";
import { Skeleton } from "../../../design/components/Loading";
import {
  Activity,
  Bell,
  Bot,
  Database,
  Globe,
  HardDrive,
  Radio,
} from "lucide-react";

const LABELS: Record<string, { label: string; icon: typeof Database }> = {
  backend: { label: "Backend", icon: Activity },
  database: { label: "Database", icon: Database },
  openai: { label: "OpenAI", icon: Bot },
  google: { label: "Google API", icon: Globe },
  notifications: { label: "Notifications", icon: Bell },
  websocket: { label: "WebSocket", icon: Radio },
  storage: { label: "Storage", icon: HardDrive },
};

function SystemStatusContent() {
  const { loading, systemHealth } = useDashboardData();

  if (loading) {
    return <Skeleton className="h-56 rounded-2xl" aria-busy="true" />;
  }

  return (
    <DashboardCard variant="gradient" padding="md" hover={false}>
      <div className="grid grid-cols-1 gap-2.5">
        {Object.entries(systemHealth).map(([key, status]) => {
          const config = LABELS[key];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-ds-text-muted" />
                <span className="text-sm text-ds-text-secondary">{config.label}</span>
              </div>
              <StatusIndicator status={status} />
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export default function SystemStatus() {
  return (
    <section aria-label="System status" className="mt-5">
      <SectionHeader title="System Status" subtitle="Infrastructure health" />
      <LazySection>
        <SystemStatusContent />
      </LazySection>
    </section>
  );
}
