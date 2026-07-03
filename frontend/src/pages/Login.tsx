import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Sparkles } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import { Button } from "../design/components/Button";
import { Alert } from "../design/components/Alert";
import { useAuth } from "../context/AuthContext";

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestLoginOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid work email address.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
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
      const result = await requestLoginOtp(email, password);
      const query = new URLSearchParams({
        email: result.email,
        purpose: result.purpose,
      });
      navigate(`/verify-otp?${query.toString()}`, {
        replace: true,
        state: {
          email: result.email,
          expiresInMinutes: result.expiresInMinutes,
          purpose: result.purpose,
          from: { pathname: from },
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      console.error("[AetherAI Auth] Login form error:", message);
      setErrors({ form: message });
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

      <AuthCard
        title="Welcome back to AetherAI"
        subtitle="Sign in to your enterprise AI workspace."
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

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-ds-primary-300 hover:text-ds-primary-200 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {errors.form && <Alert variant="error">{errors.form}</Alert>}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Sending verification code..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-ds-text-muted pt-2">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-ds-primary-300 hover:text-ds-primary-200 font-medium transition-colors"
            >
              Create an account
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
