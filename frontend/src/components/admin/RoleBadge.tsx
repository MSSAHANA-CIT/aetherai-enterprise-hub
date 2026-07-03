import { cn } from "../../lib/utils";

export type UserRole = "employee" | "manager" | "admin" | "admin_request" | "super_admin";

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  employee: {
    label: "Employee",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/25",
  },
  manager: {
    label: "Manager",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  },
  admin: {
    label: "Admin",
    className: "bg-aether-500/15 text-aether-300 border-aether-500/25",
  },
  admin_request: {
    label: "Admin Request",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  },
  super_admin: {
    label: "Super Admin",
    className: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
  },
};

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = roleConfig[role as UserRole] ?? roleConfig.employee;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border capitalize",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function getAssignableRoles(
  currentUserRole: string,
  targetUserRole?: string
): UserRole[] {
  const base: UserRole[] = ["employee", "manager", "admin"];
  if (currentUserRole === "super_admin") {
    return [...base, "super_admin"];
  }
  if (targetUserRole === "super_admin") {
    return [];
  }
  return base;
}
