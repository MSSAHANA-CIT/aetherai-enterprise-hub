import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiChannel, type ApiSummary } from "../lib/api";
import SummaryGenerator from "../components/summaries/SummaryGenerator";
import SummaryCard from "../components/summaries/SummaryCard";
import SummaryDetailPanel from "../components/summaries/SummaryDetailPanel";

export default function MeetingSummaries() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [summaries, setSummaries] = useState<ApiSummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<ApiSummary | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/summaries" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [channelData, summaryData] = await Promise.all([
        api.getChannels(token),
        api.getSummaries(token),
      ]);

      setChannels(channelData);
      setSummaries(summaryData);

      const channelFromQuery = searchParams.get("channel");
      if (channelFromQuery) {
        const parsed = Number(channelFromQuery);
        if (channelData.some((channel) => channel.id === parsed)) {
          setSelectedChannelId(parsed);
        }
      } else {
        setSelectedChannelId((prev) => {
          if (prev) return prev;
          const general = channelData.find((channel) => channel.name === "general") ?? channelData[0];
          return general?.id ?? null;
        });
      }

      const summaryFromQuery = searchParams.get("summary");
      if (summaryFromQuery) {
        const parsed = Number(summaryFromQuery);
        const match = summaryData.find((summary) => summary.id === parsed);
        if (match) {
          setSelectedSummary(match);
        }
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to load summaries");
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError, searchParams]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    if (!token || !selectedChannelId) return;

    setGenerating(true);
    setError(null);

    try {
      const created = await api.generateChannelSummary(token, selectedChannelId);
      setSummaries((prev) => [created, ...prev]);
      setSelectedSummary(created);
      setSearchParams({ summary: String(created.id) });
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to generate summary");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSummary = (summary: ApiSummary) => {
    setSelectedSummary(summary);
    setSearchParams({ summary: String(summary.id) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7.5rem)]">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aether-400 animate-pulse" />
          Loading summaries...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-aether-400" />
          <h1 className="text-2xl font-semibold text-white">Meeting Summaries</h1>
        </div>
        <p className="text-sm text-gray-500">
          AI-powered summaries from team chat with decisions, action items, owners, and deadlines.
        </p>
      </div>

      <SummaryGenerator
        channels={channels}
        selectedChannelId={selectedChannelId}
        onChannelChange={setSelectedChannelId}
        onGenerate={() => void handleGenerate()}
        generating={generating}
        error={error}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 min-h-[520px]">
        <div className="rounded-2xl border border-white/[0.08] bg-surface-card/40 backdrop-blur-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Summary History</h2>
            <span className="text-xs text-gray-500">{summaries.length} total</span>
          </div>

          {summaries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-400 mb-1">No summaries yet</p>
              <p className="text-xs text-gray-500">
                Generate your first summary from team chat or use the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
              {summaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  summary={summary}
                  selected={selectedSummary?.id === summary.id}
                  onClick={() => handleSelectSummary(summary)}
                />
              ))}
            </div>
          )}
        </div>

        <SummaryDetailPanel summary={selectedSummary} />
      </div>
    </motion.div>
  );
}
