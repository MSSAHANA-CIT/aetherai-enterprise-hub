import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import OtpBackground from "../components/otp/OtpBackground";
import AnimatedShield from "../components/otp/AnimatedShield";
import CountdownRing from "../components/otp/CountdownRing";
import WorkspacePreview from "../components/otp/WorkspacePreview";
import MobileWorkspaceStrip from "../components/otp/MobileWorkspaceStrip";
import { GlassCard } from "../design/components/Card";
import { OtpInput } from "../design/components/Input";
import { Button } from "../design/components/Button";
import { Alert } from "../design/components/Alert";
import { Badge } from "../design/components/Badge";
import { fadeUp } from "../design/animations";
import { useAuth } from "../context/AuthContext";
import { ApiError, api } from "../lib/api";

interface LocationState {
  email?: string;
  expiresInMinutes?: number;
  purpose?: "login" | "signup";
  from?: { pathname: string };
}

interface OtpSession {
  email: string;
  expiresInMinutes: number;
  purpose: "login" | "signup";
  from: string;
}

const OTP_SESSION_KEY = "aetherai_otp_session";
const RESEND_COOLDOWN_SECONDS = 60;

function saveOtpSession(session: OtpSession) {
  try { sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
}

function loadOtpSession(): OtpSession | null {
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OtpSession;
  } catch { return null; }
}

function clearOtpSession() {
  try { sessionStorage.removeItem(OTP_SESSION_KEY); } catch { /* ignore */ }
}

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { verifyLoginOtp, verifySignupOtp } = useAuth();
  const reducedMotion = useReducedMotion();

  const isPreview = import.meta.env.DEV && searchParams.get("preview") === "1";
  const routeState = (location.state as LocationState) ?? {};
  const storedSession = loadOtpSession();

  const purposeParam = searchParams.get("purpose");
  const emailParam = searchParams.get("email");

  const email = emailParam ?? routeState.email ?? storedSession?.email ?? (isPreview ? "recruiter@company.com" : "");
  const expiresInMinutes = routeState.expiresInMinutes ?? storedSession?.expiresInMinutes ?? 10;
  const purpose: "login" | "signup" =
    purposeParam === "signup" || purposeParam === "login"
      ? purposeParam
      : routeState.purpose === "signup" || storedSession?.purpose === "signup"
        ? "signup"
        : "login";
  const from = routeState.from?.pathname ?? storedSession?.from ?? "/dashboard";
  const totalSeconds = expiresInMinutes * 60;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [resendCooldown, setResendCooldown] = useState(0);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (email) saveOtpSession({ email, expiresInMinutes, purpose, from });
  }, [email, expiresInMinutes, purpose, from]);

  useEffect(() => {
    if (isPreview) return;
    if (!email) navigate(purpose === "signup" ? "/register" : "/login", { replace: true });
  }, [email, navigate, purpose, isPreview]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async () => {
    if (isPreview) { setError("Preview mode — sign in from /login to verify a real code."); return; }
    setError("");
    setResendMessage("");
    if (!/^\d{6}$/.test(otp)) { setError("Enter the complete 6-digit verification code."); return; }

    setIsSubmitting(true);
    try {
      if (purpose === "signup") await verifySignupOtp(email, otp);
      else await verifyLoginOtp(email, otp);
      setIsSuccess(true);
      clearOtpSession();
      setTimeout(() => navigate(from, { replace: true }), reducedMotion ? 200 : 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      autoSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, purpose, email, verifySignupOtp, verifyLoginOtp, navigate, from, reducedMotion, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (otp.length === 6 && !isSubmitting && !isSuccess && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      void handleVerify();
    }
    if (otp.length < 6) autoSubmittedRef.current = false;
  }, [otp, isSubmitting, isSuccess, handleVerify, isPreview]);

  const handleResend = async () => {
    if (isPreview) { setResendMessage("Preview mode — resend is disabled."); return; }
    if (resendCooldown > 0) return;
    setError("");
    setResendMessage("");
    setIsResending(true);
    try {
      const response = purpose === "signup" ? await api.resendSignupOtp({ email }) : await api.resendLoginOtp({ email });
      setResendMessage(response.message);
      setSecondsLeft(totalSeconds);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
      autoSubmittedRef.current = false;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  const expired = secondsLeft <= 0;
  const canResend = !isResending && resendCooldown <= 0;

  return (
    <div className="min-h-screen relative bg-ds-canvas text-ds-text-primary">
      <OtpBackground />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-screen pb-28 lg:pb-10">
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="w-full max-w-[480px]">
            <GlassCard padding="lg" className="shadow-ds-floating">
              <div className="flex items-center justify-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ds-primary-500 to-ds-accent flex items-center justify-center shadow-ds-glow-sm">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-semibold text-lg tracking-tight">AetherAI</span>
              </div>

              <div className="flex justify-center mb-8"><AnimatedShield /></div>

              <p className="text-[11px] uppercase tracking-[0.2em] text-ds-primary-300 text-center mb-3 font-medium">
                {purpose === "signup" ? "Account Activation" : "Secure Authentication"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-3 tracking-tight">Verify your identity</h1>
              <p className="text-sm text-ds-text-muted text-center mb-8 leading-relaxed max-w-sm mx-auto">
                We&apos;re securing your enterprise workspace before granting access.
              </p>

              <div className="flex justify-center mb-8">
                <Badge variant="online" dot className="px-4 py-2">{email}</Badge>
              </div>

              <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting || isSuccess} error={error} />

              <div className="mt-8 mb-8">
                <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalSeconds} expired={expired} />
              </div>

              <AnimatePresence>
                {resendMessage && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                    <Alert variant="success">{resendMessage}</Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                size="lg"
                className="w-full"
                onClick={() => void handleVerify()}
                disabled={otp.length !== 6 || expired}
                loading={isSubmitting}
                variant={isSuccess ? "success" : "gradient"}
              >
                {isSuccess ? "Verified!" : purpose === "signup" ? "Verify & Activate Account" : "Verify & Sign In"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full mt-3"
                disabled={!canResend}
                loading={isResending}
                onClick={() => void handleResend()}
              >
                {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend Verification Code"}
              </Button>

              <Link
                to={purpose === "signup" ? "/register" : "/login"}
                onClick={clearOtpSession}
                className="group mt-8 flex items-center justify-center gap-2 text-sm text-ds-text-muted hover:text-ds-primary-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {purpose === "signup" ? "Back to registration" : "Back to sign in"}
              </Link>
            </GlassCard>
          </motion.div>
        </div>

        <div className="hidden lg:flex flex-1 relative border-l border-ds-border min-h-screen">
          <WorkspacePreview />
        </div>
      </div>

      <MobileWorkspaceStrip />
    </div>
  );
}
