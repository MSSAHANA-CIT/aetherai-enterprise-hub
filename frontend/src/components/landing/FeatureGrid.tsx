import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  FileText,
  CheckSquare,
  BookOpen,
  FileSearch,
  BarChart3,
  Bell,
} from "lucide-react";
import Card from "../ui/Card";

const features = [
  {
    icon: Bot,
    title: "AI Workplace Assistant",
    description:
      "Context-aware AI that helps employees find answers, draft content, and automate routine tasks.",
    color: "from-aether-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Employee Chat",
    description:
      "Real-time team messaging with channels, threads, and smart search across conversations.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Meeting Summaries",
    description:
      "Automatic transcription and AI-generated summaries with action items and key decisions.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Kanban boards, assignments, and AI-suggested priorities to keep projects on track.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Centralized company wiki with semantic search and AI-powered content recommendations.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: FileSearch,
    title: "Document Intelligence",
    description:
      "Upload, analyze, and query documents with natural language. Extract insights instantly.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    description:
      "Usage dashboards, engagement metrics, and AI adoption insights for leadership.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Intelligent alerts that surface what matters and reduce notification fatigue.",
    color: "from-yellow-500 to-orange-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything your team needs
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Eight powerful modules designed for enterprise collaboration,
            powered by AI at every layer.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card
                variant="glass"
                className="h-full hover:bg-white/[0.05] hover:border-white/15 group cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow transition-shadow`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
