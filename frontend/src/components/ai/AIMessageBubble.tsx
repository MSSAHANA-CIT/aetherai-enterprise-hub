import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import Avatar from "../ui/Avatar";
import AIResponseActions from "./AIResponseActions";
import { cn } from "../../lib/utils";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isFallback?: boolean;
}

interface AIMessageBubbleProps {
  message: AIMessage;
  userName?: string;
  userInitials?: string;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-aether-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function AILoadingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.06] border border-white/[0.06]">
        <ThinkingDots />
      </div>
    </motion.div>
  );
}

export default function AIMessageBubble({ message, userName = "You", userInitials = "U" }: AIMessageBubbleProps) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {isUser ? (
        <Avatar initials={userInitials} gradient="from-aether-500 to-purple-600" size="sm" />
      ) : (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col max-w-[78%]", isUser ? "items-end" : "items-start")}>
        <div className={cn("flex items-center gap-2 mb-1", isUser && "flex-row-reverse")}>
          <span className="text-xs font-medium text-gray-400">{isUser ? userName : "AetherAI Assistant"}</span>
          <span className="text-[10px] text-gray-600">{time}</span>
        </div>

        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-gradient-to-br from-aether-600/80 to-purple-600/60 text-white rounded-tr-md border border-aether-500/20"
              : cn(
                  "bg-white/[0.06] text-gray-200 rounded-tl-md border",
                  message.isFallback
                    ? "border-amber-500/30 bg-amber-500/[0.06]"
                    : "border-white/[0.06] group-hover:bg-white/[0.08]"
                )
          )}
        >
          {message.content}
        </div>

        {!isUser && <AIResponseActions content={message.content} className="mt-2" />}
      </div>
    </motion.div>
  );
}
