import Badge from "../ui/Badge";

interface MeetingLanguageBadgeProps {
  language?: string | null;
  status?: string;
}

export default function MeetingLanguageBadge({ language, status }: MeetingLanguageBadgeProps) {
  if (!language && !status) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {language && <Badge variant="info">Language: {language.toUpperCase()}</Badge>}
      {status && (
        <Badge variant={status === "completed" ? "success" : status === "processing" ? "warning" : "default"}>
          {status.replace(/_/g, " ")}
        </Badge>
      )}
    </div>
  );
}
