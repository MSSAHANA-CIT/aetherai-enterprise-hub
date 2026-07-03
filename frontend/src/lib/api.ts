const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function resolveWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}`;
  }
  return "ws://localhost:8000";
}

export const WS_BASE_URL = resolveWsBaseUrl();

export interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  role: string;
  department?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  company_name: string;
  password: string;
  confirm_password: string;
  role: "employee" | "manager" | "admin_request";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpRequiredResponse {
  status: "otp_required";
  message: string;
  data: {
    email: string;
    expires_in_minutes: number;
    purpose?: "login" | "signup";
  };
}

export interface MessageResponse {
  status: string;
  message: string;
}

export interface VerifyLoginOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiChannel {
  id: number;
  name: string;
  description: string;
  channel_type: string;
  created_at: string;
  last_activity: string | null;
  unread_count: number;
  peer?: ApiSender | null;
  last_message_preview?: string | null;
}

export interface ApiSender {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface ApiMessageAttachment {
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string;
}

export interface ApiReactionGroup {
  emoji: string;
  count: number;
  user_ids: number[];
  reacted_by_me: boolean;
  my_reaction_id?: number | null;
}

export interface ApiMessage {
  id: number;
  content: string;
  message_type: string;
  created_at: string;
  sender: ApiSender;
  attachment?: ApiMessageAttachment | null;
  parent_message_id?: number | null;
  is_pinned?: boolean;
  reply_count?: number;
  reactions?: ApiReactionGroup[];
}

export interface ChannelCreatePayload {
  name: string;
  description?: string;
  channel_type?: string;
}

export type AIMode =
  | "general"
  | "meeting_summary"
  | "email_writer"
  | "task_planner"
  | "error_explainer"
  | "policy_helper"
  | "document_summary"
  | "video_meeting_summary"
  | "manager_briefing"
  | "message_rewrite"
  | "chat_summary";

export interface AIChatData {
  response: string;
  mode: AIMode;
  suggestions?: string[];
}

export interface AIChatApiResponse {
  status: string;
  message: string;
  data: AIChatData;
}

export interface ApiActionItem {
  task: string;
  owner: string;
  deadline: string;
}

export interface ApiSummaryChannel {
  id: number;
  name: string;
}

export interface ApiSummaryCreator {
  id: number;
  full_name: string;
  email: string;
}

export interface ApiSummary {
  id: number;
  channel_id: number;
  created_by: number;
  title: string;
  summary_text: string;
  decisions: string[];
  action_items: ApiActionItem[];
  created_at: string;
  channel?: ApiSummaryChannel | null;
  creator?: ApiSummaryCreator | null;
}

export interface SummaryListApiResponse {
  status: string;
  message: string;
  data: ApiSummary[];
}

export interface SummaryDetailApiResponse {
  status: string;
  message: string;
  data: ApiSummary;
}

export interface ApiDocumentUploader {
  id: number;
  full_name: string;
  email: string;
}

export interface ApiDocument {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  extracted_text: string;
  ai_summary: string | null;
  created_at: string;
  uploader?: ApiDocumentUploader | null;
}

export interface DocumentListApiResponse {
  status: string;
  message: string;
  data: ApiDocument[];
}

export interface DocumentDetailApiResponse {
  status: string;
  message: string;
  data: ApiDocument;
}

export interface DocumentAnswerData {
  answer: string;
  question: string;
}

export interface DocumentAnswerApiResponse {
  status: string;
  message: string;
  data: DocumentAnswerData;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ApiTaskUser {
  id: number;
  full_name: string;
  email: string;
}

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: number | null;
  created_by: number;
  due_date: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  assignee?: ApiTaskUser | null;
  creator?: ApiTaskUser | null;
}

export interface TaskListApiResponse {
  status: string;
  message: string;
  data: ApiTask[];
}

export interface TaskDetailApiResponse {
  status: string;
  message: string;
  data: ApiTask;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number | null;
  due_date?: string | null;
  ai_generated?: boolean;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number | null;
  due_date?: string | null;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  suggested_due_date?: string | null;
}

export interface TaskGeneratePayload {
  goal: string;
  deadline?: string | null;
  team_context?: string | null;
  save?: boolean;
}

export interface TaskGenerateApiResponse {
  status: string;
  message: string;
  data: GeneratedTask[];
  saved_tasks?: ApiTask[] | null;
}

export interface TaskBulkItemPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: number | null;
  due_date?: string | null;
}

export interface TaskAssigneeListApiResponse {
  status: string;
  message: string;
  data: ApiTaskUser[];
}

export interface RecentActivityItem {
  id: string;
  type: "message" | "task" | "document" | "summary" | "security";
  title: string;
  description: string;
  created_at: string;
}

export interface AnalyticsOverview {
  total_users: number;
  total_channels: number;
  total_messages: number;
  total_tasks: number;
  completed_tasks: number;
  open_tasks: number;
  total_documents: number;
  total_summaries: number;
  ai_generated_tasks: number;
  recent_activity: RecentActivityItem[];
}

export interface ProductivityAnalytics {
  task_completion_rate: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
  ai_automation_score: number;
  productivity_score: number;
}

export interface AIModeUsage {
  mode: string;
  count: number;
  label: string;
}

export interface AIUsageAnalytics {
  ai_queries_today: number;
  ai_modes_used: AIModeUsage[];
  documents_summarized: number;
  summaries_generated: number;
  ai_tasks_generated: number;
}

export interface SecurityAnalytics {
  otp_logins_enabled: boolean;
  password_reset_flow_enabled: boolean;
  protected_routes_count: number;
  gmail_api_configured: boolean;
  openai_configured: boolean;
}

export interface AnalyticsOverviewApiResponse {
  status: string;
  message: string;
  data: AnalyticsOverview;
}

export interface ProductivityAnalyticsApiResponse {
  status: string;
  message: string;
  data: ProductivityAnalytics;
}

export interface AIUsageAnalyticsApiResponse {
  status: string;
  message: string;
  data: AIUsageAnalytics;
}

export interface SecurityAnalyticsApiResponse {
  status: string;
  message: string;
  data: SecurityAnalytics;
}

export interface UserListApiResponse {
  status: string;
  message: string;
  data: ApiUser[];
}

export interface UserDetailApiResponse {
  status: string;
  message: string;
  data: ApiUser;
}

export interface ProfileUpdatePayload {
  full_name: string;
  company_name: string;
}

export interface ApiNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListApiResponse {
  status: string;
  message: string;
  data: ApiNotification[];
}

export interface UnreadCountApiResponse {
  status: string;
  message: string;
  data: { count: number };
}

export interface ApiMeeting {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  duration_seconds: number | null;
  detected_language: string | null;
  transcript: string | null;
  summary_text: string | null;
  decisions: string | null;
  action_items: string | null;
  status: string;
  uploaded_by: number;
  company_name: string;
  scheduled_at: string | null;
  room: string | null;
  participants: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingListApiResponse {
  status: string;
  message: string;
  data: ApiMeeting[];
}

export interface MeetingDetailApiResponse {
  status: string;
  message: string;
  data: ApiMeeting;
}

export interface PresenceUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  company_name?: string;
  department?: string;
  is_online: boolean;
  active_channel: string | null;
  active_channel_id?: number | null;
  last_seen: string | null;
}

export interface PresenceApiResponse {
  status: string;
  message: string;
  data: {
    online_count: number;
    total_users: number;
    users: PresenceUser[];
  };
}

export interface ApiAuditActor {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface ApiAuditLog {
  id: number;
  actor_id: number | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata_json: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: ApiAuditActor | null;
}

export interface AuditLogListApiResponse {
  status: string;
  message: string;
  data: ApiAuditLog[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function parseErrorMessage(status: number, detail: unknown): string {
  if (status === 400 && typeof detail === "string" && detail.toLowerCase().includes("already registered")) {
    return "Email already registered";
  }

  if (status === 401 && typeof detail === "string") {
    if (detail.toLowerCase().includes("verification code")) {
      return detail;
    }
    return "Invalid email or password";
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    if (first?.msg) {
      return first.msg;
    }
  }

  return "Something went wrong. Please try again.";
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Server unavailable", 0);
  }

  if (!response.ok) {
    let detail: unknown = null;

    try {
      const body = (await response.json()) as { detail?: unknown };
      detail = body.detail;
    } catch {
      detail = null;
    }

    throw new ApiError(parseErrorMessage(response.status, detail), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function requestBlob(path: string, options: RequestInit = {}, token?: string | null): Promise<Blob> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new ApiError("Export failed", response.status);
  }
  return response.blob();
}

export const api = {
  register(payload: RegisterPayload) {
    return request<OtpRequiredResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifySignupOtp(payload: VerifyLoginOtpPayload) {
    return request<AuthResponse>("/api/auth/verify-signup-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resendSignupOtp(payload: { email: string }) {
    return request<MessageResponse>("/api/auth/resend-signup-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return request<OtpRequiredResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyLoginOtp(payload: VerifyLoginOtpPayload) {
    return request<AuthResponse>("/api/auth/verify-login-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resendLoginOtp(payload: { email: string }) {
    return request<MessageResponse>("/api/auth/resend-login-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(payload: { email: string }) {
    return request<MessageResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return request<MessageResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  changePassword(token: string, payload: ChangePasswordPayload) {
    return request<MessageResponse>(
      "/api/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  getMe(token: string) {
    return request<ApiUser>("/api/auth/me", { method: "GET" }, token);
  },

  health() {
    return request<{
      status: string;
      message: string;
      database: string;
      api_version: string;
    }>("/api/health");
  },

  emailHealth() {
    return request<{
      gmail_configured: boolean;
      sender_email: string;
      refresh_token_present: boolean;
    }>("/api/health/email");
  },

  getChannels(token: string) {
    return request<ApiChannel[]>("/api/chat/channels", { method: "GET" }, token);
  },

  getDmConversations(token: string) {
    return request<ApiChannel[]>("/api/chat/dms", { method: "GET" }, token);
  },

  startDm(token: string, userId: number) {
    return request<ApiChannel>(`/api/chat/dms/${userId}`, { method: "POST" }, token);
  },

  createChannel(token: string, payload: ChannelCreatePayload) {
    return request<ApiChannel>(
      "/api/chat/channels",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  getMessages(token: string, channelId: number) {
    return request<ApiMessage[]>(`/api/chat/channels/${channelId}/messages`, { method: "GET" }, token);
  },

  sendMessage(token: string, channelId: number, content: string, messageType = "text", parentMessageId?: number) {
    return request<ApiMessage>(
      `/api/chat/channels/${channelId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content,
          message_type: messageType,
          parent_message_id: parentMessageId ?? null,
        }),
      },
      token
    );
  },

  getMessageReplies(token: string, messageId: number) {
    return request<ApiMessage[]>(`/api/chat/messages/${messageId}/replies`, { method: "GET" }, token);
  },

  getPinnedMessages(token: string, channelId: number) {
    return request<ApiMessage[]>(`/api/chat/channels/${channelId}/pinned`, { method: "GET" }, token);
  },

  togglePinMessage(token: string, messageId: number) {
    return request<ApiMessage>(`/api/chat/messages/${messageId}/pin`, { method: "PUT" }, token);
  },

  addMessageReaction(token: string, messageId: number, emoji: string) {
    return request<{ id: number; message_id: number; user_id: number; emoji: string; created_at: string }>(
      `/api/chat/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: JSON.stringify({ emoji }),
      },
      token
    );
  },

  removeMessageReaction(token: string, messageId: number, reactionId: number) {
    return request<void>(
      `/api/chat/messages/${messageId}/reactions/${reactionId}`,
      { method: "DELETE" },
      token
    );
  },

  uploadChatAttachment(token: string, channelId: number, file: File, caption?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (caption?.trim()) {
      formData.append("caption", caption.trim());
    }

    return request<ApiMessage>(
      `/api/chat/channels/${channelId}/attachments`,
      {
        method: "POST",
        body: formData,
      },
      token
    );
  },

  fetchChatAttachment(token: string, messageId: number) {
    return requestBlob(`/api/chat/attachments/${messageId}/file`, { method: "GET" }, token);
  },

  getSummaries(token: string) {
    return request<SummaryListApiResponse>("/api/summaries", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getSummary(token: string, summaryId: number) {
    return request<SummaryDetailApiResponse>(`/api/summaries/${summaryId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  generateChannelSummary(token: string, channelId: number) {
    return request<SummaryDetailApiResponse>(
      `/api/summaries/channel/${channelId}`,
      { method: "POST" },
      token
    ).then((response) => response.data);
  },

  uploadDocument(token: string, file: File, description?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    return request<DocumentDetailApiResponse>(
      "/api/documents/upload",
      {
        method: "POST",
        body: formData,
      },
      token
    ).then((response) => response.data);
  },

  getDocuments(token: string) {
    return request<DocumentListApiResponse>("/api/documents", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getDocument(token: string, documentId: number) {
    return request<DocumentDetailApiResponse>(`/api/documents/${documentId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  summarizeDocument(token: string, documentId: number) {
    return request<DocumentDetailApiResponse>(
      `/api/documents/${documentId}/summarize`,
      { method: "POST" },
      token
    ).then((response) => response.data);
  },

  askDocumentQuestion(token: string, documentId: number, question: string) {
    return request<DocumentAnswerApiResponse>(
      `/api/documents/${documentId}/ask`,
      {
        method: "POST",
        body: JSON.stringify({ question }),
      },
      token
    ).then((response) => response.data);
  },

  deleteDocument(token: string, documentId: number) {
    return request<{ status: string; message: string }>(
      `/api/documents/${documentId}`,
      { method: "DELETE" },
      token
    );
  },

  getTasks(token: string) {
    return request<TaskListApiResponse>("/api/tasks", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getTask(token: string, taskId: number) {
    return request<TaskDetailApiResponse>(`/api/tasks/${taskId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  createTask(token: string, payload: TaskCreatePayload) {
    return request<TaskDetailApiResponse>(
      "/api/tasks",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ).then((response) => response.data);
  },

  updateTask(token: string, taskId: number, payload: TaskUpdatePayload) {
    return request<TaskDetailApiResponse>(
      `/api/tasks/${taskId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    ).then((response) => response.data);
  },

  deleteTask(token: string, taskId: number) {
    return request<{ status: string; message: string }>(`/api/tasks/${taskId}`, { method: "DELETE" }, token);
  },

  generateTasks(token: string, payload: TaskGeneratePayload) {
    return request<TaskGenerateApiResponse>(
      "/api/tasks/generate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  bulkCreateTasks(token: string, tasks: TaskBulkItemPayload[]) {
    return request<TaskListApiResponse>(
      "/api/tasks/bulk",
      {
        method: "POST",
        body: JSON.stringify({ tasks }),
      },
      token
    ).then((response) => response.data);
  },

  getTaskAssignees(token: string) {
    return request<TaskAssigneeListApiResponse>("/api/tasks/assignees", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getAnalyticsOverview(token: string) {
    return request<AnalyticsOverviewApiResponse>("/api/analytics/overview", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getProductivityAnalytics(token: string) {
    return request<ProductivityAnalyticsApiResponse>("/api/analytics/productivity", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getAIUsageAnalytics(token: string) {
    return request<AIUsageAnalyticsApiResponse>("/api/analytics/ai-usage", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getSecurityAnalytics(token: string) {
    return request<SecurityAnalyticsApiResponse>("/api/analytics/security", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getUsers(token: string) {
    return request<UserListApiResponse>("/api/users", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getUser(token: string, userId: number) {
    return request<UserDetailApiResponse>(`/api/users/${userId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  updateUserRole(token: string, userId: number, role: string) {
    return request<UserDetailApiResponse>(
      `/api/users/${userId}/role`,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
      token
    ).then((response) => response.data);
  },

  updateUserStatus(token: string, userId: number, isActive: boolean) {
    return request<UserDetailApiResponse>(
      `/api/users/${userId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ is_active: isActive }),
      },
      token
    ).then((response) => response.data);
  },

  getMyProfile(token: string) {
    return request<UserDetailApiResponse>("/api/users/me/profile", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  updateMyProfile(token: string, data: ProfileUpdatePayload) {
    return request<UserDetailApiResponse>(
      "/api/users/me/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ).then((response) => response.data);
  },

  getNotifications(token: string) {
    return request<NotificationListApiResponse>("/api/notifications", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getUnreadNotificationCount(token: string) {
    return request<UnreadCountApiResponse>(
      "/api/notifications/unread-count",
      { method: "GET" },
      token
    ).then((response) => response.data.count);
  },

  markNotificationRead(token: string, notificationId: number) {
    return request<{ status: string; message: string; data: ApiNotification }>(
      `/api/notifications/${notificationId}/read`,
      { method: "PUT" },
      token
    ).then((response) => response.data);
  },

  markAllNotificationsRead(token: string) {
    return request<NotificationListApiResponse>(
      "/api/notifications/read-all",
      { method: "PUT" },
      token
    ).then((response) => response.data);
  },

  getAuditLogs(token: string) {
    return request<AuditLogListApiResponse>("/api/audit-logs", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getSecurityAuditLogs(token: string) {
    return request<AuditLogListApiResponse>("/api/audit-logs/security", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getMeetings(token: string) {
    return request<MeetingListApiResponse>("/api/meetings", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getMeeting(token: string, meetingId: number) {
    return request<MeetingDetailApiResponse>(`/api/meetings/${meetingId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  uploadMeeting(
    token: string,
    file: File,
    options?: { title?: string; scheduledAt?: string; room?: string; participants?: string }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.title) formData.append("title", options.title);
    if (options?.scheduledAt) formData.append("scheduled_at", options.scheduledAt);
    if (options?.room) formData.append("room", options.room);
    if (options?.participants) formData.append("participants", options.participants);

    return request<MeetingDetailApiResponse>(
      "/api/meetings/upload",
      { method: "POST", body: formData },
      token
    ).then((response) => response.data);
  },

  updateMeetingSchedule(
    token: string,
    meetingId: number,
    payload: { scheduled_at?: string; room?: string; participants?: string }
  ) {
    return request<MeetingDetailApiResponse>(
      `/api/meetings/${meetingId}/schedule`,
      { method: "PATCH", body: JSON.stringify(payload) },
      token
    ).then((response) => response.data);
  },

  askMeetingQuestion(token: string, meetingId: number, question: string) {
    return request<{ status: string; message: string; data: { answer: string; question: string } }>(
      `/api/meetings/${meetingId}/ask`,
      { method: "POST", body: JSON.stringify({ question }) },
      token
    ).then((response) => response.data);
  },

  transcribeMeeting(token: string, meetingId: number) {
    return request<MeetingDetailApiResponse>(
      `/api/meetings/${meetingId}/transcribe`,
      { method: "POST" },
      token
    ).then((response) => response.data);
  },

  summarizeMeeting(token: string, meetingId: number) {
    return request<MeetingDetailApiResponse>(
      `/api/meetings/${meetingId}/summarize`,
      { method: "POST" },
      token
    ).then((response) => response.data);
  },

  deleteMeeting(token: string, meetingId: number) {
    return request<{ status: string; message: string }>(
      `/api/meetings/${meetingId}`,
      { method: "DELETE" },
      token
    );
  },

  exportSummary(
    token: string,
    payload: { content: string; title: string; format: string; metadata?: Record<string, unknown> }
  ) {
    return requestBlob(
      "/api/exports/summary",
      { method: "POST", body: JSON.stringify(payload) },
      token
    );
  },

  getPresence(token: string) {
    return request<PresenceApiResponse>("/api/presence", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getPresenceUsers(token: string) {
    return request<PresenceApiResponse>("/api/presence/users", { method: "GET" }, token).then(
      (response) => response.data
    );
  },

  getChannelPresence(token: string, channelId: number) {
    return request<PresenceApiResponse>(`/api/presence/channel/${channelId}`, { method: "GET" }, token).then(
      (response) => response.data
    );
  },
};

export function sendAIMessage(token: string, message: string, mode: AIMode = "general") {
  return request<AIChatApiResponse>(
    "/api/ai/chat",
    {
      method: "POST",
      body: JSON.stringify({ message, mode }),
    },
    token
  );
}
