import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import { aiSuggestedPrompts } from "../../data/mockData";
import { staggerItem } from "../../lib/animations";

export default function AICommandCenter() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const goToAI = (message?: string) => {
    navigate("/ai", message ? { state: { initialPrompt: message } } : undefined);
  };

  return (
    <motion.div variants={staggerItem}>
      <Card variant="gradient" glow className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Command Center</h3>
              <p className="text-xs text-gray-500">Powered by AetherAI</p>
            </div>
          </div>
          <Badge variant="success">Online</Badge>
        </div>

        <div className="glass rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-aether-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Good morning! I&apos;m ready to help with summaries, drafts, analysis,
                and planning. What would you like to work on today?
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
            Suggested prompts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {aiSuggestedPrompts.map((suggestedPrompt) => (
              <motion.button
                key={suggestedPrompt}
                type="button"
                onClick={() => goToAI(suggestedPrompt)}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="text-left px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {suggestedPrompt}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Input
            placeholder="Ask AetherAI anything..."
            className="flex-1"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && prompt.trim()) {
                goToAI(prompt.trim());
              }
            }}
          />
          <motion.button
            type="button"
            onClick={() => prompt.trim() && goToAI(prompt.trim())}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-aether-600 to-aether-500 text-white shadow-glow-sm hover:from-aether-500 hover:to-aether-400 transition-all disabled:opacity-50"
            aria-label="Send message"
            disabled={!prompt.trim()}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
}
