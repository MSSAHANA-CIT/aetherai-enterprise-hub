import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Zap } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useComingSoon } from "../../context/ComingSoonContext";

export default function HeroSection() {
  const { openComingSoon } = useComingSoon();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="glow-orb w-[600px] h-[600px] bg-aether-600 top-[-200px] left-1/2 -translate-x-1/2" />
      <div className="glow-orb w-[400px] h-[400px] bg-purple-600 bottom-0 right-[-100px] opacity-20" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="purple" className="mb-6">
            <Zap className="w-3 h-3" />
            Now in early access
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-gradient">AetherAI</span>
          <br />
          <span className="text-white">Enterprise Hub</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI-powered internal collaboration platform for modern companies.
          Unify your team, knowledge, and workflows in one intelligent workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <Button variant="primary" size="lg">
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              openComingSoon({
                title: "Product Demo",
                description: "Watch a guided walkthrough of AetherAI Enterprise Hub — AI assistant, team chat, and meeting intelligence.",
                feature: "Demo Video",
              })
            }
          >
            <Play className="w-4 h-4" />
            Watch demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
        >
          <span>Trusted by forward-thinking teams</span>
          <div className="flex items-center gap-6 opacity-60">
            {["Acme Corp", "NovaTech", "Pulse Labs", "Vertex AI"].map((name) => (
              <span key={name} className="font-medium text-gray-400">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
