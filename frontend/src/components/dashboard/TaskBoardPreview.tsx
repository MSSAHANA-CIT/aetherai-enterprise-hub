import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { taskColumns } from "../../data/mockData";
import { staggerItem } from "../../lib/animations";

const columnColors = {
  todo: "border-gray-500/30",
  "in-progress": "border-amber-500/30",
  done: "border-emerald-500/30",
};

const priorityVariant = {
  high: "warning" as const,
  medium: "info" as const,
  low: "default" as const,
};

export default function TaskBoardPreview() {
  const navigate = useNavigate();

  return (
    <motion.div variants={staggerItem}>
      <Card variant="glass" className="h-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white">Task Board</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="text-xs text-aether-400 hover:text-aether-300 transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taskColumns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className={`flex items-center gap-2 pb-2 border-b ${columnColors[column.id as keyof typeof columnColors]}`}>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {column.title}
                </span>
                <span className="text-[10px] text-gray-600 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                  {column.tasks.length}
                </span>
              </div>

              {column.tasks.map((task) => (
                <motion.button
                  key={task.id}
                  type="button"
                  onClick={() => navigate("/tasks")}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-start gap-2">
                    {column.id === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-gray-200 ${column.id === "done" ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={priorityVariant[task.priority]} className="text-[10px] px-1.5">
                          {task.priority}
                        </Badge>
                        <span className="text-[10px] text-gray-600">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
