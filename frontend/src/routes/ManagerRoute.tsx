import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ManagerRouteProps {
  children: React.ReactNode;
}

export default function ManagerRoute({ children }: ManagerRouteProps) {
  const { loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-aether-400 animate-spin" />
      </div>
    );
  }

  if (!hasRole("manager", "admin", "super_admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
