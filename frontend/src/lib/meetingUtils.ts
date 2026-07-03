import type { ApiMeeting } from "./api";

export function parseMeetingParticipants(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* fall through to comma-separated */
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function getMeetingDisplayTime(meeting: ApiMeeting): Date {
  return new Date(meeting.scheduled_at ?? meeting.created_at);
}

export function getUpcomingMeetings(meetings: ApiMeeting[], limit = 6): ApiMeeting[] {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  return meetings
    .filter((meeting) => {
      if (!meeting.scheduled_at) return false;
      const scheduled = new Date(meeting.scheduled_at).getTime();
      return scheduled >= oneHourAgo;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduled_at ?? a.created_at).getTime() -
        new Date(b.scheduled_at ?? b.created_at).getTime()
    )
    .slice(0, limit);
}

export function getRecentRecordings(meetings: ApiMeeting[], limit = 4): ApiMeeting[] {
  return meetings
    .filter((meeting) => !meeting.scheduled_at)
    .slice(0, limit);
}
