import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, Shield, Sparkles, User } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import { Button } from "../design/components/Button";
import { Alert } from "../design/components/Alert";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

type SignupRole = "employee" | "manager" | "admin_request";

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  form?: string;
}

const ROLE_OPTIONS: { id: SignupRole; label: string; description: string }[] = [
  { id: "employee", label: "Employee", description: "Collaborate with AI, chat, tasks, and knowledge." },
  { id: "manager", label: "Manager", description: "Includes analytics and team oversight tools." },
  { id: "admin_request", label: "Admin Request", description: "Request elevated admin access — pending super admin approval after verification." },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("employee");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid work email address.";
    if (!company.trim()) nextErrors.company = "Company name is required.";
    if (!password.trim()) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword.trim()) nextErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!role) nextErrors.role = "Select a role.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await register({ name, email, company, password, confirmPassword, role });
      navigate("/verify-otp", {
        replace: true,
        state: {
          email: result.email,
          expiresInMinutes: result.expiresInMinutes,
          purpose: "signup",
          from: { pathname: "/dashboard" },
        },
      });
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Unable to create workspace. Please try again.",
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

      <AuthCard title="Create your enterprise workspace" subtitle="Step 1 of 2 — verify your work email to activate your account.">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput label="Full Name" type="text" placeholder="Monish Tijil" autoComplete="name" icon={<User className="w-4 h-4" />} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <AuthInput label="Work Email" type="email" placeholder="you@company.com" autoComplete="email" icon={<Mail className="w-4 h-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <AuthInput label="Company Name" type="text" placeholder="Acme Corporation" autoComplete="organization" icon={<Building2 className="w-4 h-4" />} value={company} onChange={(e) => setCompany(e.target.value)} error={errors.company} />

          <div>
            <label className="block text-ds-label text-ds-text-secondary mb-2">Role</label>
            <div className="space-y-2" role="radiogroup" aria-label="Select your role">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={role === option.id}
                  onClick={() => setRole(option.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus",
                    role === option.id
                      ? "border-ds-primary/40 bg-ds-primary/10"
                      : "border-ds-border bg-ds-glass hover:bg-ds-glass-medium hover:border-ds-border-strong"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Shield className={cn("w-4 h-4", role === option.id ? "text-ds-primary-300" : "text-ds-text-muted")} />
                    <span className="text-sm font-medium text-ds-text-primary">{option.label}</span>
                  </div>
                  <p className="text-xs text-ds-text-muted mt-1 pl-6">{option.description}</p>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-ds-danger mt-1" role="alert">{errors.role}</p>}
          </div>

          <AuthInput label="Password" type="password" placeholder="Create a strong password" autoComplete="new-password" icon={<Lock className="w-4 h-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <AuthInput label="Confirm Password" type="password" placeholder="Confirm your password" autoComplete="new-password" icon={<Lock className="w-4 h-4" />} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />

          {errors.form && <Alert variant="error">{errors.form}</Alert>}

          <Button type="submit" size="lg" className="w-full mt-2" loading={isSubmitting}>
            {isSubmitting ? "Creating workspace..." : "Create Workspace"}
          </Button>

          <p className="text-center text-sm text-ds-text-muted pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-ds-primary-300 hover:text-ds-primary-200 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
