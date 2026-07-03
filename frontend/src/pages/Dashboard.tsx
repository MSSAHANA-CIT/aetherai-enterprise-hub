import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Container } from "../design/components/Layout";
import { DashboardDataProvider } from "../hooks/useDashboardData";
import { fade } from "../design/animations";
import { PageLoader } from "../design/components/Loading";
import CommandCenterHeader from "../components/dashboard/command-center/CommandCenterHeader";
import WorkspaceOverview from "../components/dashboard/command-center/WorkspaceOverview";
import MainAIWorkspace from "../components/dashboard/command-center/MainAIWorkspace";
import EnterpriseLiveStatus from "../components/dashboard/command-center/EnterpriseLiveStatus";
import FloatingAICopilot from "../components/dashboard/command-center/FloatingAICopilot";

const WorkspaceInsights = lazy(() => import("../components/dashboard/command-center/WorkspaceInsights"));
const SmartQuickActions = lazy(() => import("../components/dashboard/command-center/SmartQuickActions"));
const PersonalProductivity = lazy(() => import("../components/dashboard/command-center/PersonalProductivity"));
const AIActivityTimeline = lazy(() => import("../components/dashboard/command-center/AIActivityTimeline"));
const RecentWork = lazy(() => import("../components/dashboard/command-center/RecentWork"));
const UpcomingMeetings = lazy(() => import("../components/dashboard/command-center/UpcomingMeetings"));
const EmployeePresence = lazy(() => import("../components/dashboard/command-center/EmployeePresence"));
const AIRecommendations = lazy(() => import("../components/dashboard/command-center/AIRecommendations"));
const SecurityCenter = lazy(() => import("../components/dashboard/command-center/SecurityCenter"));
const SystemStatus = lazy(() => import("../components/dashboard/command-center/SystemStatus"));
const RecentTeamActivity = lazy(() => import("../components/dashboard/command-center/RecentTeamActivity"));

function SectionSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader message="Loading section..." />}>{children}</Suspense>
  );
}

export default function Dashboard() {
  return (
    <DashboardDataProvider>
      <motion.main
        initial="initial"
        animate="animate"
        variants={fade}
        className="pb-24"
        aria-label="Aether Command Center"
      >
        <Container className="space-y-6 lg:space-y-8">
          <CommandCenterHeader />

          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-3">
              <WorkspaceOverview />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <MainAIWorkspace />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <EnterpriseLiveStatus />
            </div>
          </div>

          <SectionSuspense>
            <WorkspaceInsights />
          </SectionSuspense>

          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            <div className="col-span-12 xl:col-span-8">
              <SectionSuspense>
                <SmartQuickActions />
              </SectionSuspense>
            </div>
            <div className="col-span-12 xl:col-span-4">
              <SectionSuspense>
                <PersonalProductivity />
              </SectionSuspense>
            </div>
          </div>

          <SectionSuspense>
            <AIActivityTimeline />
          </SectionSuspense>

          <SectionSuspense>
            <RecentWork />
          </SectionSuspense>

          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-7">
              <SectionSuspense>
                <UpcomingMeetings />
              </SectionSuspense>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <SectionSuspense>
                <EmployeePresence />
              </SectionSuspense>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-7">
              <SectionSuspense>
                <AIRecommendations />
              </SectionSuspense>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <SectionSuspense>
                <SecurityCenter />
              </SectionSuspense>
              <SectionSuspense>
                <SystemStatus />
              </SectionSuspense>
            </div>
          </div>

          <SectionSuspense>
            <RecentTeamActivity />
          </SectionSuspense>
        </Container>

        <FloatingAICopilot />
      </motion.main>
    </DashboardDataProvider>
  );
}
