import { motion } from "framer-motion";
import { MessageSquare, Hash } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { chatMessages } from "../../data/mockData";
import { staggerItem } from "../../lib/animations";

export default function TeamChatPreview() {
  return (
    <motion.div variants={staggerItem}>
      <Card variant="glass" className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-500" />
                engineering
              </h3>
            </div>
          </div>
          <Badge variant="info">3 online</Badge>
        </div>

        <div className="space-y-4 flex-1">
          {chatMessages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex gap-3 group"
            >
              <Avatar
                initials={msg.user[0]}
                gradient={msg.avatarColor}
                size="sm"
                online={msg.online}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{msg.user}</span>
                  <span className="text-[10px] text-gray-600">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {msg.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            3 team members active now
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
