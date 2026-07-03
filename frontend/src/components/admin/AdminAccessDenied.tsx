import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function AdminAccessDenied() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-glow-sm">
        <ShieldX className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Access Denied</h1>
      <p className="text-gray-400 max-w-md mb-8">
        You do not have permission to access the admin user management area. Contact your
        company administrator if you believe this is an error.
      </p>
      <Button variant="secondary" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </motion.div>
  );
}
