import { motion } from "framer-motion";
import { Hash, Loader2, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import type { ApiChannel } from "../../lib/api";
import { cn } from "../../lib/utils";

interface SummaryGeneratorProps {
  channels: ApiChannel[];
  selectedChannelId: number | null;
  onChannelChange: (channelId: number) => void;
  onGenerate: () => void;
  generating: boolean;
  error?: string | null;
  className?: string;
}

export default function SummaryGenerator({
  channels,
  selectedChannelId,
  onChannelChange,
  onGenerate,
  generating,
  error,
  className,
}: SummaryGeneratorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-surface-card/60 backdrop-blur-xl p-5 shadow-card",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-aether-400" />
            <h2 className="text-sm font-semibold text-white">Generate AI Summary</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Select a channel and let AetherAI extract decisions, action items, owners, and deadlines.
          </p>
          <label className="block">
            <span className="text-xs text-gray-400 mb-1.5 block">Channel</span>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aether-400 pointer-events-none" />
              <select
                value={selectedChannelId ?? ""}
                onChange={(event) => onChannelChange(Number(event.target.value))}
                disabled={generating || channels.length === 0}
                className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aether-500/30 disabled:opacity-60"
              >
                {channels.length === 0 ? (
                  <option value="">No channels available</option>
                ) : (
                  channels.map((channel) => (
                    <option key={channel.id} value={channel.id} className="bg-surface-card text-white">
                      {channel.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </label>
        </div>

        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={generating || !selectedChannelId}
          className="w-full lg:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Summary
            </>
          )}
        </Button>
      </div>

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-xl border border-aether-500/20 bg-aether-500/[0.06] px-4 py-3"
        >
          <p className="text-xs text-aether-200 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            AI is analyzing channel messages and building your meeting summary...
          </p>
        </motion.div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
    </motion.div>
  );
}
