import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckSquare,
  ClipboardList,
  Mail,
  Rocket,
  Users,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../../lib/animations";

export interface AIPromptCard {
  id: string;
  title: string;
  prompt: string;
  icon: typeof Mail;
  gradient: string;
}

export const AI_PROMPT_CARDS: AIPromptCard[] = [
  {
    id: "engineering-updates",
    title: "Summarize today's engineering updates",
    prompt: "Summarize today's engineering updates including deployments, blockers, and wins.",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "client-email",
    title: "Draft a client follow-up email",
    prompt: "Draft a professional follow-up email to a client after a product demo.",
    icon: Mail,
    gradient: "from-aether-500 to-indigo-500",
  },
  {
    id: "project-tasks",
    title: "Turn this goal into project tasks",
    prompt: "Turn this goal into a structured project plan with tasks, priorities, and deadlines: launch a new internal helpdesk.",
    icon: CheckSquare,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "error-log",
    title: "Explain this backend error log",
    prompt:
      "Explain this backend error log in simple terms and suggest fixes:\n\nTraceback (most recent call last):\n  File \"app/main.py\", line 42, in handler\n    result = db.query(User).filter(User.id == user_id).one()\nsqlalchemy.exc.NoResultFound: No row was found when one was required",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "deployment-checklist",
    title: "Write a deployment checklist",
    prompt: "Write a deployment checklist for a production release including pre-deploy, deploy, and post-deploy steps.",
    icon: Rocket,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "meeting-actions",
    title: "Create meeting action items",
    prompt:
      "Create meeting action items from this notes summary:\n- Discussed Q3 roadmap priorities\n- Agreed to migrate auth service\n- Need owner for documentation refresh\n- Follow up on customer feedback next week",
    icon: ClipboardList,
    gradient: "from-rose-500 to-red-500",
  },
];

interface AIPromptCardsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export default function AIPromptCards({ onSelectPrompt, disabled }: AIPromptCardsProps) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {AI_PROMPT_CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <motion.button
            key={card.id}
            type="button"
            variants={staggerItem}
            disabled={disabled}
            onClick={() => onSelectPrompt(card.prompt)}
            whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            className="group relative text-left rounded-2xl p-4 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">Click to use this prompt</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
