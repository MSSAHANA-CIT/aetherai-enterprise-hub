import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, Search, Users, TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function ProductPreview() {
  const navigate = useNavigate();

  return (
    <section id="product" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="glow-orb w-[500px] h-[500px] bg-aether-600 left-[-200px] top-1/2 -translate-y-1/2 opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for how teams actually work
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A unified workspace that brings together communication, knowledge,
            and AI assistance — without switching between tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-aether-600/20 via-purple-600/10 to-aether-600/20 rounded-3xl blur-2xl" />

          <Card variant="gradient" className="relative overflow-hidden p-0">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-gray-500">
                  app.aetherai.com/workspace
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 min-h-[420px]">
              {/* Sidebar */}
              <div className="col-span-3 border-r border-white/10 bg-black/20 p-4 hidden sm:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">AetherAI</span>
                </div>
                <nav className="space-y-1">
                  {["Home", "Chat", "Tasks", "Knowledge", "Analytics"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          i === 0
                            ? "bg-aether-500/20 text-aether-300"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </nav>
              </div>

              {/* Main content */}
              <div className="col-span-12 sm:col-span-6 p-4 sm:p-6 border-r border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">AI Assistant</h3>
                  <Badge variant="success">Online</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aether-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-300 max-w-[85%]">
                      Good morning! You have 3 meetings today and 2 tasks due.
                      Would you like a summary of yesterday&apos;s engineering
                      standup?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-aether-600/30 border border-aether-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-200 max-w-[85%]">
                      Yes, summarize the standup and highlight blockers.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aether-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-300 max-w-[85%]">
                      <p className="mb-2 font-medium text-white">Standup Summary</p>
                      <ul className="space-y-1 text-gray-400">
                        <li>• API v2 migration 80% complete</li>
                        <li>• Blocker: staging env needs DB migration</li>
                        <li>• Design review scheduled for Thursday</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 flex-1">
                    Ask AetherAI anything...
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/ai")}
                    className="p-1.5 rounded-lg bg-aether-600 hover:bg-aether-500 transition-colors"
                    aria-label="Open AI Assistant"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Right panel */}
              <div className="col-span-12 sm:col-span-3 p-4 bg-black/10 hidden sm:block">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Team Activity
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Sarah K.", action: "completed task", time: "2m" },
                    { name: "James L.", action: "shared doc", time: "15m" },
                    { name: "Mia R.", action: "joined channel", time: "1h" },
                  ].map((activity) => (
                    <div key={activity.name} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs text-white font-medium">
                        {activity.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">
                          <span className="text-white">{activity.name}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-[10px] text-gray-600">{activity.time} ago</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>12 members online</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">+24% engagement</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
