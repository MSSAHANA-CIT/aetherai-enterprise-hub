import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  BarChart3,
  Monitor,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const MIN_WIDTH = 1024;

interface DeviceInfo {
  deviceType: string;
  screenWidth: number;
  blocked: boolean;
}

function detectMobileUserAgent(ua: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
    ua,
  );
}

function detectIPad(ua: string): boolean {
  if (/iPad/i.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh with touch
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function detectAndroidTablet(ua: string): boolean {
  return /Android/i.test(ua) && !/Mobile/i.test(ua);
}

function detectTablet(ua: string, width: number): boolean {
  if (detectIPad(ua)) return true;
  if (detectAndroidTablet(ua)) return true;
  if (/Tablet|PlayBook|Silk/i.test(ua)) return true;
  // Touch device with tablet-like dimensions
  const isTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  if (isTouch && width >= 600 && width < MIN_WIDTH) return true;
  return false;
}

function detectFoldable(ua: string): boolean {
  return /Fold|Galaxy Z|Surface Duo/i.test(ua);
}

function analyzeDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const width = window.innerWidth;

  const isMobile = detectMobileUserAgent(ua);
  const isIPad = detectIPad(ua);
  const isAndroidTablet = detectAndroidTablet(ua);
  const isTablet = detectTablet(ua, width);
  const isFoldable = detectFoldable(ua);
  const isTouchOnly =
    (navigator.maxTouchPoints > 0 || "ontouchstart" in window) &&
    width < MIN_WIDTH &&
    !/Windows|Macintosh|Linux/i.test(ua);
  const isNarrow = width < MIN_WIDTH;

  let deviceType = "Desktop";
  if (isIPad) deviceType = "iPad";
  else if (isAndroidTablet) deviceType = "Android Tablet";
  else if (isFoldable) deviceType = "Foldable Device";
  else if (isMobile) deviceType = "Mobile Phone";
  else if (isTablet) deviceType = "Tablet";
  else if (isNarrow) deviceType = "Small Screen";
  else if (isTouchOnly) deviceType = "Touch Device";

  const blocked =
    isNarrow ||
    isMobile ||
    isIPad ||
    isAndroidTablet ||
    isTablet ||
    isFoldable ||
    isTouchOnly;

  return { deviceType, screenWidth: width, blocked };
}

const FEATURES = [
  {
    icon: Shield,
    title: "Secure AI Workspace",
    description: "Enterprise-grade security for your AI workflows",
  },
  {
    icon: BarChart3,
    title: "Enterprise Dashboard",
    description: "Real-time insights and command center controls",
  },
  {
    icon: Users,
    title: "Meeting Intelligence",
    description: "AI-powered meeting summaries and action items",
  },
  {
    icon: Bot,
    title: "Admin Controls",
    description: "Full workspace administration and governance",
  },
] as const;

function BlockedPage({ info }: { info: DeviceInfo }) {
  return (
    <div className="min-h-screen bg-ds-canvas relative overflow-hidden flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-ds-primary-950/40 via-ds-canvas to-ds-accent/10" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[520px] h-[520px] rounded-full bg-ds-primary/25 blur-[120px] -top-40 -left-40"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[640px] h-[640px] rounded-full bg-ds-accent/20 blur-[120px] right-[-180px] top-1/4"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      </div>

      <main
        className="relative z-10 w-full max-w-2xl"
        role="main"
        aria-labelledby="gate-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="ds-glass-strong rounded-2xl p-8 sm:p-10 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              AetherAI
            </span>
          </div>

          <div className="flex justify-center mb-8" aria-hidden="true">
            <div className="relative">
              <div className="w-32 h-24 rounded-lg border-2 border-white/20 bg-white/[0.04] flex items-end justify-center pb-2">
                <div className="w-24 h-16 rounded border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-aether-400/80" />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-white/10" />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/5" />
            </div>
          </div>

          <h1
            id="gate-title"
            className="text-2xl sm:text-3xl font-bold text-white text-center mb-3"
          >
            Desktop Workspace Required
          </h1>
          <p className="text-ds-text-secondary text-center text-sm sm:text-base mb-2">
            AetherAI Enterprise Hub is optimized for secure desktop and laptop
            workflows.
          </p>
          <p className="text-gray-400 text-center text-sm mb-8">
            For the best enterprise experience, please open this workspace on a
            laptop or desktop computer.
          </p>

          <div
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
              Device Status
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Device type</dt>
                <dd className="text-white font-medium">{info.deviceType}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Screen width</dt>
                <dd className="text-white font-medium">{info.screenWidth}px</dd>
              </div>
              <div>
                <dt className="text-gray-500">Minimum required</dt>
                <dd className="text-white font-medium">{MIN_WIDTH}px</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aether-500/15 flex items-center justify-center flex-shrink-0">
                    <feature.icon
                      className="w-4 h-4 text-aether-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

interface DesktopOnlyGateProps {
  children: React.ReactNode;
}

export default function DesktopOnlyGate({ children }: DesktopOnlyGateProps) {
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  const checkDevice = useCallback(() => {
    setInfo(analyzeDevice());
  }, []);

  useEffect(() => {
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, [checkDevice]);

  if (info === null) {
    return (
      <div
        className="min-h-screen bg-ds-canvas"
        role="status"
        aria-label="Checking device compatibility"
      />
    );
  }

  if (info.blocked) {
    return <BlockedPage info={info} />;
  }

  return <>{children}</>;
}
