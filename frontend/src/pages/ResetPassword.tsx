import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock, Mail, Shield, Sparkles } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import OtpInput from "../components/auth/OtpInput";
import Button from "../components/ui/Button";
import { ApiError, api } from "../lib/api";

interface FormErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
}

interface LocationState {
  email?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as LocationState)?.email ?? "";

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [stateEmail]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid work email address.";
    }

    if (!/^\d{6}$/.test(otp)) {
      nextErrors.otp = "Enter the complete 6-digit verification code.";
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

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : "Unable to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard title="Password updated" subtitle="Your password has been reset successfully.">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-400">
              You can now sign in with your new password. Email verification will be required at login.
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate("/login", { replace: true })}>
              Continue to sign in
            </Button>
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
        title="Reset your password"
        subtitle="Enter the verification code from your email and choose a new password."
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Work Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Verification Code</label>
            <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} error={errors.otp} />
          </div>

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
            placeholder="Re-enter your new password"
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
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-aether-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
