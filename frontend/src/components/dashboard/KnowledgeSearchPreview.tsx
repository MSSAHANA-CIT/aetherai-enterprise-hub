import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Search, FileText } from "lucide-react";
import Card from "../ui/Card";
import { knowledgeResults } from "../../data/mockData";
import { staggerItem } from "../../lib/animations";

export default function KnowledgeSearchPreview() {
  const navigate = useNavigate();

  return (
    <motion.div variants={staggerItem}>
      <Card variant="glass" className="h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <BookOpen className="w-5 h-5 text-pink-400" />
          <h3 className="font-semibold text-white">Knowledge Search</h3>
        </div>

        <button
          type="button"
          onClick={() => navigate("/knowledge")}
          className="w-full flex items-center gap-2.5 glass rounded-xl px-4 py-3 mb-5 border border-white/[0.08] hover:bg-white/[0.06] transition-colors text-left"
        >
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-500 truncate">
            Search company policies, docs, tickets, and meeting notes...
          </span>
        </button>

        <div className="space-y-2 flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
            Recent results
          </p>
          {knowledgeResults.map((result, i) => (
            <motion.button
              key={result.id}
              type="button"
              onClick={() => navigate("/knowledge")}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              className="w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-aether-500/20 transition-colors">
                <FileText className="w-4 h-4 text-gray-500 group-hover:text-aether-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors truncate">
                  {result.title}
                </p>
                <p className="text-xs text-gray-600">
                  {result.type} · {result.updated}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
