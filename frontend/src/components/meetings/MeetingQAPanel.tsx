import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiMeeting } from "../../lib/api";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ExportMenu from "../export/ExportMenu";

interface MeetingQAPanelProps {
  meeting: ApiMeeting | null;
}

export default function MeetingQAPanel({ meeting }: MeetingQAPanelProps) {
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!token || !meeting || !question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const result = await api.askMeetingQuestion(token, meeting.id, question.trim());
      setAnswer(result.answer);
    } catch {
      setError("Unable to generate an answer right now. Please try again.");
      setAnswer("");
    } finally {
      setAsking(false);
    }
  };

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-aether-400" />
        <h3 className="text-sm font-semibold text-white">Ask AI About This Meeting</h3>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What decisions were made about the launch timeline?"
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-aether-500/40 resize-none"
      />

      <Button
        type="button"
        className="mt-3"
        disabled={!meeting || asking || !question.trim()}
        onClick={() => void handleAsk()}
      >
        {asking ? "Thinking..." : "Ask AI"}
      </Button>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      {answer && (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>
          <ExportMenu content={answer} title={`${meeting?.title || "Meeting"} — AI Answer`} />
        </div>
      )}
    </Card>
  );
}
