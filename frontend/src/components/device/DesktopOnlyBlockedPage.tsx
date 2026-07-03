import {
  BarChart3,
  Bot,
  Chrome,
  Laptop,
  Monitor,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { DeviceInfo } from "./deviceDetection";
import { DEVICE_GATE_MIN_WIDTH } from "./deviceDetection";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Workspace",
    description: "Secure AI workflows built for enterprise teams",
  },
  {
    icon: BarChart3,
    title: "Enterprise Dashboard",
    description: "Real-time command center and analytics views",
  },
  {
    icon: Users,
    title: "Meeting Intelligence",
    description: "AI-powered summaries, insights, and action items",
  },
  {
    icon: Shield,
    title: "Admin Controls",
    description: "Governance, roles, and workspace administration",
  },
] as const;

const STEPS = [
  "Open this link on a laptop or desktop computer.",
  "Use Chrome, Edge, Safari, or Firefox.",
  "Make sure your browser window is at least 1024px wide.",
  "Sign in again from the desktop workspace.",
] as const;

interface DesktopOnlyBlockedPageProps {
  info: DeviceInfo;
}

export default function DesktopOnlyBlockedPage({
  info,
}: DesktopOnlyBlockedPageProps) {
  return (
    <div
      className="gate-page min-h-[100dvh] w-full overflow-x-hidden bg-[#07070d] text-white"
      style={{ minHeight: "100vh" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="gate-aurora absolute inset-0" />
        <div className="gate-grid absolute inset-0 opacity-[0.35]" />
        <div className="gate-orb gate-orb-a absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-[110px]" />
        <div className="gate-orb gate-orb-b absolute -right-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="gate-orb gate-orb-c absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      <main
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-3xl items-center justify-center px-4 py-8 sm:px-6"
        role="main"
        aria-labelledby="gate-title"
      >
        <div className="gate-card-enter w-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl sm:p-9">
          <header className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_24px_rgba(99,102,241,0.35)]">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300/80">
                AetherAI
              </p>
              <p className="text-sm font-semibold text-white">Enterprise Hub</p>
            </div>
          </header>

          <div className="mb-8 flex justify-center" aria-hidden="true">
            <div className="relative">
              <div className="gate-float flex h-28 w-36 items-end justify-center rounded-xl border border-white/15 bg-white/[0.04] pb-3">
                <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.1] to-white/[0.02]">
                  <Monitor className="h-9 w-9 text-indigo-300" />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/10" />
              <div className="absolute -bottom-5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/5" />
            </div>
          </div>

          <h1
            id="gate-title"
            className="mb-3 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Desktop Workspace Required
          </h1>
          <p className="mb-2 text-center text-sm text-gray-300 sm:text-base">
            AetherAI Enterprise Hub is designed for secure laptop and desktop
            workflows.
          </p>
          <p className="mb-8 text-center text-sm leading-relaxed text-gray-400">
            This workspace contains enterprise dashboards, AI meeting
            intelligence, admin controls, collaboration panels, and analytics
            views that require a larger screen for the best experience.
          </p>

          <section
            className="mb-6 rounded-xl border border-white/[0.08] bg-black/20 p-4 sm:p-5"
            aria-labelledby="gate-guidance-title"
          >
            <h2
              id="gate-guidance-title"
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"
            >
              <Laptop className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              How to continue
            </h2>
            <ol className="space-y-2.5 text-sm text-gray-300">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Chrome className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Recommended browsers: Chrome, Edge, Safari, Firefox</span>
            </div>
          </section>

          <section
            className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Device information
            </h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Detected device</dt>
                <dd className="font-medium text-white">{info.deviceType}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Current width</dt>
                <dd className="font-medium text-white">
                  {info.screenWidth > 0 ? `${info.screenWidth}px` : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Required width</dt>
                <dd className="font-medium text-white">
                  {DEVICE_GATE_MIN_WIDTH}px minimum
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-amber-300">
                  Access paused for this device
                </dd>
              </div>
            </dl>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                    <feature.icon
                      className="h-4 w-4 text-indigo-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-200">
              <Shield className="h-4 w-4" aria-hidden="true" />
              Why desktop only?
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              To protect usability, visibility, and enterprise workflow quality,
              this platform is restricted to laptop and desktop environments.
            </p>
          </section>

          <footer className="border-t border-white/[0.06] pt-5 text-center">
            <p className="text-sm font-semibold text-white">
              AetherAI Enterprise Hub
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Secure AI workspace for modern teams.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
