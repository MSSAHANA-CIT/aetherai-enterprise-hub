import type { ApiMeeting } from "./api";

export function parseMeetingJsonList(value: string | null | undefined): unknown[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatActionItem(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const record = item as Record<string, string>;
    const task = record.task || record.description || "";
    const owner = record.owner || record.assignee || "";
    const deadline = record.deadline || record.due_date || "";
    const parts = [task, owner && `Owner: ${owner}`, deadline && `Due: ${deadline}`].filter(Boolean);
    return parts.join(" — ");
  }
  return JSON.stringify(item);
}

export function formatDecision(item: unknown): string {
  return typeof item === "string" ? item : JSON.stringify(item);
}

export function buildMeetingExportContent(
  meeting: ApiMeeting,
  type: "transcript" | "summary" | "decisions" | "action_items"
): string {
  switch (type) {
    case "transcript":
      return meeting.transcript || "";
    case "summary":
      return meeting.summary_text || "";
    case "decisions":
      return parseMeetingJsonList(meeting.decisions)
        .map((item, index) => `${index + 1}. ${formatDecision(item)}`)
        .join("\n");
    case "action_items":
      return parseMeetingJsonList(meeting.action_items)
        .map((item, index) => `${index + 1}. ${formatActionItem(item)}`)
        .join("\n");
    default:
      return "";
  }
}
