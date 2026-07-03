import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Bot,
  Brain,
  BookOpen,
  Search,
  Bell,
  BarChart3,
  MessageSquare,
  Shield,
  Check,
  Users,
  Sparkles,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ROTATING_MESSAGES = [
  "Preparing encrypted workspace...",
  "Initializing AI systems...",
  "Loading enterprise knowledge...",
  "Connecting your team...",
  "Verifying security...",
  "Personalizing dashboard...",
  "Almost ready...",
];

const SYSTEM_STATUS = [
  { label: "AI Assistant Ready", progress: 100, done: true },
  { label: "Loading Company Knowledge...", progress: 80, done: false },
  { label: "Connected to Enterprise Chat", progress: 100, done: true },
  { label: "Preparing Dashboard...", progress: 75, done: false },
  { label: "Security Scan Passed", progress: 100, done: true },
  { label: "Knowledge Index Loaded", progress: 100, done: true },
  { label: "Notifications Synced", progress: 100, done: true },
];

const ENTERPRISE_CARDS = [
  { icon: Bot, label: "AI Assistant", color: "from-aether-500/25 to-indigo-600/10" },
  { icon: Brain, label: "Task Intelligence", color: "from-purple-500/25 to-violet-600/10" },
  { icon: BookOpen, label: "Knowledge Engine", color: "from-blue-500/25 to-cyan-600/10" },
  { icon: Search, label: "Enterprise Search", color: "from-indigo-500/25 to-blue-600/10" },
  { icon: Bell, label: "Notifications", color: "from-amber-500/20 to-orange-600/10" },
  { icon: BarChart3, label: "Analytics", color: "from-emerald-500/20 to-teal-600/10" },
  { icon: MessageSquare, label: "Chat", color: "from-sky-500/25 to-blue-600/10" },
  { icon: Shield, label: "Security", color: "from-violet-500/25 to-purple-600/10" },
];

const SECURITY_ITEMS = [
  "256-bit Encryption",
  "Google Identity Verified",
  "Multi-factor Authentication",
  "Zero Trust Access",
  "Enterprise Security Enabled",
  "SOC2 Ready",
];

const TEAM_DEPARTMENTS = [
  { name: "Engineering", online: 12 },
  { name: "HR", online: 4 },
  { name: "Support", online: 6 },
  { name: "Management", online: 5 },
];

const ACTIVITY_FEED = [
  "Meeting Summary Generated",
  "Task Assigned",
  "Knowledge Updated",
  "AI Finished Analysis",
  "Chat Connected",
  "Security Verified",
];

function ProgressBar({ progress, animate }: { progress: number; animate: boolean }) {
  return (
    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-2">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-aether-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: animate ? 1.2 : 0, ease: "easeOut" }}
      />
    </div>
  );
}

function SystemStatusCard({
  item,
  index,
  visible,
}: {
  item: (typeof SYSTEM_STATUS)[0];
  index: number;
  visible: boolean;
}) {
  const reducedMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
    >
      <motion.div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
          item.done ? "bg-emerald-500/20" : "bg-aether-500/20"
        )}
        animate={item.done && !reducedMotion ? { scale: [1, 1.15, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        {item.done ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <motion.div
            className="w-2 h-2 rounded-full bg-aether-400"
            animate={reducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 font-medium">{item.label}</p>
        {!item.done && <ProgressBar progress={item.progress} animate={visible} />}
      </div>
    </motion.div>
  );
}

function EnterpriseCard({
  card,
  index,
}: {
  card: (typeof ENTERPRISE_CARDS)[0];
  index: number;
}) {
  const Icon = card.icon;
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: reducedMotion ? 0 : [0, -4, 0],
      }}
      transition={{
        opacity: { delay: 0.3 + index * 0.08, duration: 0.4 },
        scale: { delay: 0.3 + index * 0.08, duration: 0.4 },
        y: { duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
      }}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.03 }}
      className={cn(
        "group relative p-3 rounded-2xl border border-white/[0.08] backdrop-blur-xl",
        "bg-gradient-to-br cursor-default",
        card.color
      )}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}
      />
      <div className="relative flex items-center gap-2">
        <Icon className="w-4 h-4 text-white/70" />
        <span className="text-[11px] font-medium text-white/80">{card.label}</span>
      </div>
    </motion.div>
  );
}

function WorkspacePreview() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleStatusCount, setVisibleStatusCount] = useState(1);
  const [activities, setActivities] = useState<string[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (visibleStatusCount >= SYSTEM_STATUS.length) return;
    const timer = setInterval(() => {
      setVisibleStatusCount((prev) => Math.min(prev + 1, SYSTEM_STATUS.length));
    }, 800);
    return () => clearInterval(timer);
  }, [visibleStatusCount]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      const activity = ACTIVITY_FEED[index % ACTIVITY_FEED.length];
      setActivities((prev) => [activity, ...prev].slice(0, 4));
      index++;
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const totalOnline = TEAM_DEPARTMENTS.reduce((sum, d) => sum + d.online, 0);

  return (
    <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-aether-300 font-medium">AetherAI Enterprise</p>
            <p className="text-xs text-gray-500">Secure workspace initialization</p>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight mb-3">
          Your workspace is{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-aether-300 to-purple-300">
            coming online
          </span>
        </h2>

        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-gray-400"
            >
              {ROTATING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left column */}
        <div className="space-y-5">
          {/* System status */}
          <div className="space-y-2" aria-label="System initialization status">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
              Live System Status
            </p>
            {SYSTEM_STATUS.map((item, i) => (
              <SystemStatusCard key={item.label} item={item} index={i} visible={i < visibleStatusCount} />
            ))}
          </div>

          {/* Security indicators */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm"
          >
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
              Security
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SECURITY_ITEMS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.08 }}
                  className="flex items-center gap-1.5"
                >
                  <motion.div
                    animate={reducedMotion ? undefined : { scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  </motion.div>
                  <span className="text-[10px] text-gray-400">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Enterprise cards grid */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
              Enterprise Modules
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ENTERPRISE_CARDS.map((card, i) => (
                <EnterpriseCard key={card.label} card={card} index={i} />
              ))}
            </div>
          </div>

          {/* Team presence */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-aether-400" />
                <span className="text-xs font-medium text-gray-300">Employees Online</span>
              </div>
              <motion.span
                className="text-lg font-semibold text-white"
                animate={reducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {totalOnline}
              </motion.span>
            </div>
            <div className="space-y-2">
              {TEAM_DEPARTMENTS.map((dept, deptIndex) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={reducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: deptIndex * 0.4 }}
                    />
                    <span className="text-[11px] text-gray-400">{dept.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">{dept.online}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live activity */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-aether-400" />
              <span className="text-xs font-medium text-gray-300">Live Activity</span>
            </div>
            <div className="space-y-2 min-h-[80px]">
              <AnimatePresence initial={false}>
                {activities.map((activity, i) => (
                  <motion.div
                    key={`${activity}-${i}`}
                    initial={reducedMotion ? false : { opacity: 0, x: -12, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-aether-400 flex-shrink-0" />
                    <span className="text-[11px] text-gray-400">{activity}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating AI assistant widget */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: reducedMotion ? 0 : [0, -6, 0],
        }}
        transition={{
          opacity: { delay: 1.2, duration: 0.5 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-8 right-8 left-8 xl:left-auto xl:w-80 p-4 rounded-2xl bg-gradient-to-br from-aether-500/10 to-purple-600/10 border border-aether-500/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(99,102,241,0.1)]"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">Need help?</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your secure workspace is almost ready. Everything is being encrypted and synchronized.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(WorkspacePreview);
