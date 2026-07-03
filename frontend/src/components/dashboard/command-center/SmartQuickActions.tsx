import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Bot,
  CheckSquare,
  MessageSquare,
  Plus,
  Upload,
  UserPlus,
  Video,
  LayoutGrid,
} from "lucide-react";
import { DashboardCard } from "./shared/DashboardCard";
import SectionHeader from "./shared/SectionHeader";
import { staggerContainer, staggerItem } from "../../../design/animations";
import { useAuth } from "../../../context/AuthContext";

const ACTIONS = [
  { id: "chat", label: "Start Chat", icon: MessageSquare, href: "/chat", color: "text-cyan-400" },
  { id: "upload", label: "Upload Document", icon: Upload, href: "/knowledge", state: { openUpload: true }, color: "text-blue-400" },
  { id: "meeting", label: "New Meeting", icon: Video, href: "/meetings", color: "text-purple-400" },
  { id: "tasks", label: "Generate Tasks", icon: CheckSquare, href: "/tasks", state: { openGenerate: true }, color: "text-emerald-400" },
  { id: "kb", label: "Open Knowledge Base", icon: BookOpen, href: "/knowledge", color: "text-amber-400" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics", managerOnly: true, color: "text-pink-400" },
  { id: "invite", label: "Invite Employee", icon: UserPlus, href: "/admin/users", adminOnly: true, color: "text-rose-400" },
  { id: "workspace", label: "Create Workspace", icon: LayoutGrid, href: "/chat", state: { openCreateChannel: true }, color: "text-ds-primary" },
  { id: "ai", label: "Ask AI", icon: Bot, href: "/ai", color: "text-aether-400" },
  { id: "create", label: "New Task", icon: Plus, href: "/tasks", state: { openCreate: true }, color: "text-teal-400" },
];

export default function SmartQuickActions() {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();

  const visible = ACTIONS.filter((a) => {
    if (a.adminOnly && !isAdmin) return false;
    if (a.managerOnly && !isManager) return false;
    return true;
  });

  return (
    <section aria-label="Smart quick actions">
      <SectionHeader title="Smart Quick Actions" subtitle="One-click productivity" />
      <DashboardCard variant="glass" padding="md" hover={false}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
        >
          {visible.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                type="button"
                variants={staggerItem}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.href, action.state ? { state: action.state } : undefined)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-ds-primary/30 transition-all group"
                aria-label={action.label}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-ds-primary/15 transition-colors">
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-ds-text-secondary text-center group-hover:text-ds-text-primary">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </DashboardCard>
    </section>
  );
}
