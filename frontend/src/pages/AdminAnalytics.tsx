import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  ApiError,
  api,
  type AIUsageAnalytics,
  type AnalyticsOverview,
  type ApiChannel,
  type ProductivityAnalytics,
  type SecurityAnalytics,
} from "../lib/api";
import { staggerContainer } from "../lib/animations";
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsFilters, { type AnalyticsTimeRange } from "../components/analytics/AnalyticsFilters";
import EnterpriseKPICards from "../components/analytics/EnterpriseKPICards";
import ProductivityChart from "../components/analytics/ProductivityChart";
import AIUsagePanel from "../components/analytics/AIUsagePanel";
import ChatActivityPanel from "../components/analytics/ChatActivityPanel";
import DocumentInsightsPanel from "../components/analytics/DocumentInsightsPanel";
import SecurityInsightsPanel from "../components/analytics/SecurityInsightsPanel";
import RecentActivityTimeline from "../components/analytics/RecentActivityTimeline";
import { buildAnalyticsReport } from "../lib/analyticsExportUtils";

export default function AdminAnalytics() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [productivity, setProductivity] = useState<ProductivityAnalytics | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsageAnalytics | null>(null);
  const [security, setSecurity] = useState<SecurityAnalytics | null>(null);
  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/analytics" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadAnalytics = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [overviewData, productivityData, aiUsageData, securityData, channelData] =
          await Promise.all([
            api.getAnalyticsOverview(token),
            api.getProductivityAnalytics(token),
            api.getAIUsageAnalytics(token),
            api.getSecurityAnalytics(token),
            api.getChannels(token).catch(() => [] as ApiChannel[]),
          ]);

        setOverview(overviewData);
        setProductivity(productivityData);
        setAiUsage(aiUsageData);
        setSecurity(securityData);
        setChannels(channelData);
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to load analytics");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, handleAuthError]
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportContent = useMemo(
    () =>
      buildAnalyticsReport({
        overview,
        productivity,
        aiUsage,
        security,
        timeRange,
      }),
    [overview, productivity, aiUsage, security, timeRange]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-aether-400 animate-spin" />
        <p className="text-sm text-gray-500">Loading enterprise insights...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <AnalyticsHeader
        onRefresh={() => loadAnalytics(true)}
        refreshing={refreshing}
        exportContent={exportContent}
      />

      <AnalyticsFilters timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">{error}</p>
        </motion.div>
      )}

      <EnterpriseKPICards overview={overview} loading={refreshing && !overview} />

      <ProductivityChart data={productivity} loading={refreshing && !productivity} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AIUsagePanel data={aiUsage} loading={refreshing && !aiUsage} />
        <ChatActivityPanel
          overview={overview}
          channels={channels}
          loading={refreshing && !overview}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DocumentInsightsPanel
          overview={overview}
          summarizedCount={aiUsage?.documents_summarized}
          loading={refreshing && !overview}
        />
        <SecurityInsightsPanel data={security} loading={refreshing && !security} />
      </div>

      <RecentActivityTimeline items={overview?.recent_activity ?? []} loading={refreshing && !overview} />
    </motion.div>
  );
}
