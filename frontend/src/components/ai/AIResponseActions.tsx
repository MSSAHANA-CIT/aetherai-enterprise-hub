import { useState } from "react";
import { Bot, Check, Copy, ListPlus, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import { useComingSoon } from "../../context/ComingSoonContext";
import ExportMenu from "../export/ExportMenu";

interface AIResponseActionsProps {
  content: string;
  className?: string;
}

export default function AIResponseActions({ content, className }: AIResponseActionsProps) {
  const { openComingSoon } = useComingSoon();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy response"}
      </button>
      <button
        type="button"
        onClick={() =>
          openComingSoon({
            title: "Insert into Task",
            description: "One-click task creation from AI responses will be available soon.",
            feature: "AI Assistant",
          })
        }
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
      >
        <ListPlus className="w-3.5 h-3.5" />
        Insert into task
      </button>
      <button
        type="button"
        onClick={() =>
          openComingSoon({
            title: "Save Summary",
            description: "Saved AI summaries with version history are coming soon. Use export below for now.",
            feature: "AI Assistant",
          })
        }
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        Save summary
      </button>
      <ExportMenu content={content} title="AI Response" />
      <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
        <Bot className="w-3 h-3" />
        AetherAI
      </span>
    </div>
  );
}
