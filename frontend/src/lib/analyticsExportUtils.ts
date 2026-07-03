import type { AIUsageAnalytics, AnalyticsOverview, ProductivityAnalytics, SecurityAnalytics } from "../lib/api";

export function buildAnalyticsReport(params: {
  overview: AnalyticsOverview | null;
  productivity: ProductivityAnalytics | null;
  aiUsage: AIUsageAnalytics | null;
  security: SecurityAnalytics | null;
  timeRange: string;
}): string {
  const { overview, productivity, aiUsage, security, timeRange } = params;
  const lines: string[] = [
    "# Enterprise Analytics Report",
    "",
    `Time range: ${timeRange}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Overview",
    `- Total users: ${overview?.total_users ?? 0}`,
    `- Total channels: ${overview?.total_channels ?? 0}`,
    `- Total messages: ${overview?.total_messages ?? 0}`,
    `- Total tasks: ${overview?.total_tasks ?? 0}`,
    `- Completed tasks: ${overview?.completed_tasks ?? 0}`,
    `- Open tasks: ${overview?.open_tasks ?? 0}`,
    `- Documents: ${overview?.total_documents ?? 0}`,
    `- Meeting summaries: ${overview?.total_summaries ?? 0}`,
    `- AI-generated tasks: ${overview?.ai_generated_tasks ?? 0}`,
    "",
    "## Productivity",
    `- Task completion rate: ${productivity?.task_completion_rate ?? 0}%`,
    `- Tasks by status: ${JSON.stringify(productivity?.tasks_by_status ?? {})}`,
    "",
    "## AI Usage",
    `- AI queries today: ${aiUsage?.ai_queries_today ?? 0}`,
    `- Documents summarized: ${aiUsage?.documents_summarized ?? 0}`,
    `- Summaries generated: ${aiUsage?.summaries_generated ?? 0}`,
    `- AI tasks generated: ${aiUsage?.ai_tasks_generated ?? 0}`,
    "",
    "## Security & Integrations",
    `- OTP logins enabled: ${security?.otp_logins_enabled ? "Yes" : "No"}`,
    `- Password reset flow: ${security?.password_reset_flow_enabled ? "Yes" : "No"}`,
    `- Gmail API configured: ${security?.gmail_api_configured ? "Yes" : "No"}`,
    `- OpenAI configured: ${security?.openai_configured ? "Yes" : "No"}`,
    "",
  ];

  if (overview?.recent_activity?.length) {
    lines.push("## Recent Activity", "");
    for (const item of overview.recent_activity.slice(0, 10)) {
      lines.push(`- ${item.title}: ${item.description}`);
    }
  }

  return lines.join("\n");
}
