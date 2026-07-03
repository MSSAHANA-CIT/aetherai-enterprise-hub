import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  CheckSquare,
  Users,
  BarChart3,
  BookOpen,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  Circle,
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useComingSoon } from "../context/ComingSoonContext";

const chatMessages = [
  { user: "Sarah", message: "Can someone review the Q3 roadmap doc?", time: "10:32" },
  { user: "James", message: "On it — I'll have feedback by EOD", time: "10:34" },
  { user: "Mia", message: "Added comments on the API section", time: "10:41" },
];

const tasks = [
  { title: "Review API migration plan", priority: "high", due: "Today" },
  { title: "Update onboarding docs", priority: "medium", due: "Tomorrow" },
  { title: "Schedule design review", priority: "low", due: "Thu" },
];

const activity = [
  { name: "Sarah K.", action: "Completed sprint planning", time: "5m ago" },
  { name: "James L.", action: "Uploaded quarterly report", time: "23m ago" },
  { name: "Mia R.", action: "Created knowledge article", time: "1h ago" },
  { name: "Alex T.", action: "Joined #engineering channel", time: "2h ago" },
];

const analyticsData = [
  { label: "Active Users", value: "847", change: "+12%" },
  { label: "AI Queries", value: "2.4k", change: "+28%" },
  { label: "Tasks Done", value: "156", change: "+8%" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPreview() {
  const navigate = useNavigate();
  const { openComingSoon } = useComingSoon();

  return (
    <section id="dashboard" className="py-24 lg:py-32 relative">
      <div className="glow-orb w-[600px] h-[600px] bg-purple-600 right-[-250px] top-0 opacity-15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="purple" className="mb-4">
            Dashboard Preview
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your command center
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A beautifully organized dashboard that gives every role the insights
            and tools they need — from individual contributors to executives.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="glass" glow className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="space-y-3">
                <div className="glass rounded-xl p-3 text-sm text-gray-300">
                  <p className="text-gray-500 text-xs mb-1">Suggested for you</p>
                  Summarize today&apos;s meetings and draft follow-up emails.
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "Summarize", route: "/ai" },
                    { label: "Draft email", route: "/ai" },
                    { label: "Find docs", route: "/knowledge" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.route)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="glass" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">#product-team</h3>
                </div>
                <Badge variant="info">3 new</Badge>
              </div>
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.user + msg.time} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-medium">
                      {msg.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">{msg.user}</span>
                        <span className="text-[10px] text-gray-600">{msg.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="mt-4 w-full py-2 text-xs text-aether-400 hover:text-aether-300 transition-colors"
              >
                Open Team Chat →
              </button>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="glass" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">My Tasks</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="text-gray-500 hover:text-white"
                  aria-label="View all tasks"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <button
                    key={task.title}
                    type="button"
                    onClick={() => navigate("/tasks")}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "warning"
                              : task.priority === "medium"
                                ? "info"
                                : "default"
                          }
                          className="text-[10px] px-1.5"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.due}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="glass" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Team Activity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => openComingSoon({ title: "Team Activity Feed", description: "Full activity timeline across your workspace.", feature: "Dashboard" })}
                  className="text-gray-600 hover:text-white"
                  aria-label="View activity"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {activity.map((activityItem) => (
                  <div key={activityItem.name + activityItem.time} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aether-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-xs text-white font-medium">
                      {activityItem.name[0]}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="text-white font-medium">{activityItem.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activityItem.action}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{activityItem.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="gradient" glow className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">Analytics</h3>
                </div>
                <span className="text-xs text-gray-500">This week</span>
              </div>
              <div className="space-y-4">
                {analyticsData.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-xl font-semibold text-white">{stat.value}</p>
                    </div>
                    <span className="text-sm text-emerald-400 font-medium">
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("/analytics")}
                className="mt-4 w-full py-2 text-xs text-aether-400 hover:text-aether-300 transition-colors"
              >
                View Analytics →
              </button>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card variant="glass" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-400" />
                  <h3 className="font-semibold text-white">Knowledge Base</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/knowledge")}
                className="w-full flex items-center gap-2 glass rounded-xl px-3 py-2.5 mb-4 hover:bg-white/[0.06] transition-colors"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Search company knowledge...</span>
              </button>
              <div className="space-y-2">
                {[
                  "Engineering Onboarding Guide",
                  "API Authentication Docs",
                  "Q3 Product Roadmap",
                ].map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => navigate("/knowledge")}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-sm text-gray-400">{doc}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
