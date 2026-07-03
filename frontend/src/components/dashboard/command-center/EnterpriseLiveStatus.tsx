import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Bot,
  Globe,
  HardDrive,
  Server,
  Shield,
  Users,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { DashboardCard } from "./shared/DashboardCard";
import StatusIndicator, { type StatusLevel } from "./shared/StatusIndicator";
import AnimatedCounter from "./shared/AnimatedCounter";
import SectionHeader from "./shared/SectionHeader";
import { Skeleton } from "../../../design/components/Loading";
import { staggerContainer, staggerItem } from "../../../design/animations";

interface StatusItem {
  id: string;
  label: string;
  status: StatusLevel;
  value?: string | number;
  icon: typeof Server;
  href?: string;
}

export default function EnterpriseLiveStatus() {
  const { loading, systemHealth, onlineCount, overview, documents, security } = useDashboardData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  const items: StatusItem[] = [
    {
      id: "employees",
      label: "Employees Online",
      status: onlineCount > 0 ? "operational" : "degraded",
      value: onlineCount,
      icon: Users,
      href: "/chat",
    },
    {
      id: "ai",
      label: "AI Services",
      status: systemHealth.openai,
      value: security?.openai_configured ? "Active" : "Config needed",
      icon: Bot,
      href: "/ai",
    },
    {
      id: "kb",
      label: "Knowledge Base",
      status: (overview?.total_documents ?? 0) > 0 ? "operational" : "degraded",
      value: overview?.total_documents ?? 0,
      icon: BookOpen,
      href: "/knowledge",
    },
    {
      id: "security",
      label: "Security",
      status: security?.otp_logins_enabled ? "operational" : "degraded",
      value: "Protected",
      icon: Shield,
      href: "/profile",
    },
    {
      id: "health",
      label: "System Health",
      status: systemHealth.backend,
      value: systemHealth.backend === "operational" ? "Healthy" : "Issues",
      icon: Activity,
      href: "/analytics",
    },
    {
      id: "openai",
      label: "OpenAI Status",
      status: systemHealth.openai,
      icon: Bot,
    },
    {
      id: "google",
      label: "Google Integration",
      status: systemHealth.google,
      icon: Globe,
    },
    {
      id: "storage",
      label: "Storage",
      status: systemHealth.storage,
      value: `${documents.length} files`,
      icon: HardDrive,
      href: "/knowledge",
    },
    {
      id: "api",
      label: "API Status",
      status: systemHealth.backend,
      icon: Server,
    },
  ];

  return (
    <section aria-label="Enterprise live status">
      <SectionHeader title="Enterprise Live Status" subtitle="Real-time infrastructure" />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-2.5"
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const content = (
            <DashboardCard variant="glass" padding="sm" delay={i * 0.03} className="group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-ds-text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ds-text-secondary truncate">{item.label}</p>
                    {typeof item.value === "number" ? (
                      <p className="text-sm font-bold text-ds-text-primary">
                        <AnimatedCounter value={item.value} />
                      </p>
                    ) : item.value ? (
                      <p className="text-xs text-ds-text-muted truncate">{item.value}</p>
                    ) : null}
                  </div>
                </div>
                <StatusIndicator status={item.status} showLabel={false} />
              </div>
            </DashboardCard>
          );

          return (
            <motion.div key={item.id} variants={staggerItem}>
              {item.href ? (
                <button type="button" onClick={() => navigate(item.href!)} className="w-full text-left">
                  {content}
                </button>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
