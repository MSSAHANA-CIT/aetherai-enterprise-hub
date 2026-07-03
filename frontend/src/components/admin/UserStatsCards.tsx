import { motion } from "framer-motion";
import { Users, UserCheck, Shield, Briefcase } from "lucide-react";
import { staggerItem } from "../../lib/animations";
import type { ApiUser } from "../../lib/api";

interface UserStatsCardsProps {
  users: ApiUser[];
}

export default function UserStatsCards({ users }: UserStatsCardsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const admins = users.filter((u) => u.role === "admin" || u.role === "super_admin").length;
  const managers = users.filter((u) => u.role === "manager").length;

  const stats = [
    {
      id: "total",
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      gradient: "from-aether-500 to-indigo-500",
    },
    {
      id: "active",
      label: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "admins",
      label: "Admins",
      value: admins,
      icon: Shield,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "managers",
      label: "Managers",
      value: managers,
      icon: Briefcase,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            variants={staggerItem}
            className="gradient-border rounded-2xl p-5 bg-surface-card/80 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-glow-sm`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
