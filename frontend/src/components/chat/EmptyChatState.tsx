import { motion } from "framer-motion";
import { MessageSquare, Hash } from "lucide-react";

interface EmptyChatStateProps {
  channelName?: string;
}

export default function EmptyChatState({ channelName }: EmptyChatStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aether-600/20 to-purple-600/20 border border-aether-500/20 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-aether-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {channelName ? (
          <>
            Welcome to <span className="text-aether-400">#{channelName}</span>
          </>
        ) : (
          "No messages yet"
        )}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        {channelName
          ? "Be the first to send a message in this channel. Your team conversation starts here."
          : "Select a channel from the sidebar to view team conversations."}
      </p>
      {channelName && (
        <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-600">
          <Hash className="w-3.5 h-3.5" />
          <span>Enterprise team chat powered by AetherAI</span>
        </div>
      )}
    </motion.div>
  );
}
