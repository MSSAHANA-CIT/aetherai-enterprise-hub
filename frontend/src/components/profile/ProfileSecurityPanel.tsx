import { motion } from "framer-motion";
import { Shield, KeyRound, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RoleBadge from "../admin/RoleBadge";
import Button from "../ui/Button";

interface ProfileSecurityPanelProps {
  role: string;
  isActive: boolean;
}

export default function ProfileSecurityPanel({ role, isActive }: ProfileSecurityPanelProps) {
  const navigate = useNavigate();

  const securityItems = [
    {
      id: "otp",
      label: "OTP Login Enabled",
      description: "Two-factor email verification on sign-in",
      enabled: true,
      icon: Smartphone,
    },
    {
      id: "password",
      label: "Password Change Available",
      description: "Update your account password anytime",
      enabled: true,
      icon: KeyRound,
    },
    {
      id: "role",
      label: "Account Role",
      description: "Your current access level in the platform",
      enabled: true,
      icon: Shield,
      custom: <RoleBadge role={role} size="sm" />,
    },
    {
      id: "status",
      label: "Account Status",
      description: isActive ? "Your account is active and accessible" : "Your account has been deactivated",
      enabled: isActive,
      icon: Shield,
      custom: (
        <span
          className={`text-xs font-medium ${isActive ? "text-emerald-400" : "text-red-400"}`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="gradient-border rounded-2xl bg-surface-card/80 backdrop-blur-sm p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-1">Security & Access</h3>
      <p className="text-sm text-gray-500 mb-6">Your account security settings and permissions</p>

      <div className="space-y-3">
        {securityItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-aether-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              {item.custom ? (
                item.custom
              ) : item.enabled ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.06]">
        <Button variant="secondary" size="sm" onClick={() => navigate("/change-password")}>
          <KeyRound className="w-4 h-4" />
          Change Password
        </Button>
      </div>
    </motion.div>
  );
}
