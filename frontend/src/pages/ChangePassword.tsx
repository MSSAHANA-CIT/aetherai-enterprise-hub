import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Lock, Shield, Sparkles } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError, api } from "../lib/api";

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (!validate() || !token) return;

    setIsSubmitting(true);
    try {
      await api.changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
      window.setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : "Unable to change password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard title="Password changed" subtitle="Your password has been updated successfully.">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-400">Redirecting you to sign in with your new password...</p>
            <Loader2 className="w-5 h-5 animate-spin text-aether-400 mx-auto" />
          </motion.div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-lg">AetherAI</span>
      </div>

      <AuthCard
        title="Change your password"
        subtitle="Update your account password to keep your workspace secure."
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            autoComplete="current-password"
            icon={<KeyRound className="w-4 h-4" />}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
          />

          <AuthInput
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            icon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
          />

          <AuthInput
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          {errors.form && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 text-center"
            >
              {errors.form}
            </motion.p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
