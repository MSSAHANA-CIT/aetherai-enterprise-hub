import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import { Button } from "../design/components/Button";
import { Alert } from "../design/components/Alert";
import { ApiError, api } from "../lib/api";

interface FormErrors {
  email?: string;
  form?: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid work email address.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.forgotPassword({ email: email.trim().toLowerCase() });
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : "Unable to send reset instructions. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ds-primary-500 to-ds-accent flex items-center justify-center shadow-ds-glow-sm">
          <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-semibold text-ds-text-primary text-lg">AetherAI</span>
      </div>

      <AuthCard title="Reset your password" subtitle="Enter your work email and we'll send a secure verification code.">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-ds-success-muted border border-ds-success-border flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-ds-success" />
              </div>
              <p className="text-ds-text-primary font-medium mb-2">If an account exists, password reset instructions have been sent.</p>
              <p className="text-sm text-ds-text-muted mb-6">Check your inbox for a verification code to reset your password.</p>
              <div className="space-y-3">
                <Button size="lg" className="w-full" onClick={() => navigate("/reset-password", { state: { email: email.trim().toLowerCase() } })}>
                  Enter verification code
                </Button>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-5" noValidate>
              <AuthInput label="Work Email" type="email" placeholder="you@company.com" autoComplete="email" icon={<Mail className="w-4 h-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
              {errors.form && <Alert variant="error">{errors.form}</Alert>}
              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                {isSubmitting ? "Sending instructions..." : "Send Reset Instructions"}
              </Button>
              <p className="text-center text-sm text-ds-text-muted pt-2">
                Remember your password?{" "}
                <Link to="/login" className="text-ds-primary-300 hover:text-ds-primary-200 font-medium transition-colors">Sign in</Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </AuthCard>
    </AuthLayout>
  );
}
