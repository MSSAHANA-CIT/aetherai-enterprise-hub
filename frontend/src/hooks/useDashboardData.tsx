import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspacePresence } from "./useWorkspacePresence";
import {
  api,
  type AIUsageAnalytics,
  type AnalyticsOverview,
  type ApiDocument,
  type ApiMeeting,
  type ApiNotification,
  type ApiSummary,
  type ApiTask,
  type ApiUser,
  type PresenceUser,
  type ProductivityAnalytics,
  type SecurityAnalytics,
} from "../lib/api";

export type SystemHealthStatus = "operational" | "degraded" | "offline" | "checking";

export interface SystemHealth {
  backend: SystemHealthStatus;
  database: SystemHealthStatus;
  openai: SystemHealthStatus;
  google: SystemHealthStatus;
  notifications: SystemHealthStatus;
  websocket: SystemHealthStatus;
  storage: SystemHealthStatus;
}

export interface DashboardData {
  loading: boolean;
  error: string | null;
  overview: AnalyticsOverview | null;
  productivity: ProductivityAnalytics | null;
  aiUsage: AIUsageAnalytics | null;
  security: SecurityAnalytics | null;
  tasks: ApiTask[];
  documents: ApiDocument[];
  meetings: ApiMeeting[];
  notifications: ApiNotification[];
  summaries: ApiSummary[];
  presence: PresenceUser[];
  onlineCount: number;
  users: ApiUser[];
  unreadCount: number;
  systemHealth: SystemHealth;
  presenceLive: boolean;
  refresh: () => Promise<void>;
}

const defaultSystemHealth: SystemHealth = {
  backend: "checking",
  database: "checking",
  openai: "checking",
  google: "checking",
  notifications: "checking",
  websocket: "checking",
  storage: "checking",
};

const DashboardDataContext = createContext<DashboardData | null>(null);

async function fetchSystemHealth(token: string): Promise<SystemHealth> {
  const health: SystemHealth = { ...defaultSystemHealth };

  try {
    const backend = await api.health();
    health.backend = backend.status === "success" ? "operational" : "degraded";
    health.database =
      backend.database === "connected" ? "operational" : backend.database ? "degraded" : "offline";
    health.storage = "operational";
    health.websocket = "operational";
    health.notifications = "operational";
  } catch {
    health.backend = "offline";
    health.database = "offline";
    health.storage = "degraded";
    health.websocket = "degraded";
    health.notifications = "degraded";
  }

  try {
    const email = await api.emailHealth();
    health.google = email.gmail_configured ? "operational" : "degraded";
  } catch {
    health.google = "offline";
  }

  try {
    const security = await api.getSecurityAnalytics(token);
    health.openai = security.openai_configured ? "operational" : "degraded";
  } catch {
    health.openai = "degraded";
  }

  return health;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { onlineUsers: wsOnlineUsers, onlineCount: wsOnlineCount, connected: presenceLive } =
    useWorkspacePresence(token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [productivity, setProductivity] = useState<ProductivityAnalytics | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsageAnalytics | null>(null);
  const [security, setSecurity] = useState<SecurityAnalytics | null>(null);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [meetings, setMeetings] = useState<ApiMeeting[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [summaries, setSummaries] = useState<ApiSummary[]>([]);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(defaultSystemHealth);

  const refresh = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        api.getAnalyticsOverview(token),
        api.getProductivityAnalytics(token),
        api.getAIUsageAnalytics(token),
        api.getSecurityAnalytics(token),
        api.getTasks(token),
        api.getDocuments(token),
        api.getMeetings(token),
        api.getNotifications(token),
        api.getSummaries(token),
        api.getPresence(token),
        api.getUsers(token),
        api.getUnreadNotificationCount(token),
        fetchSystemHealth(token),
      ]);

      if (results[0].status === "fulfilled") setOverview(results[0].value);
      if (results[1].status === "fulfilled") setProductivity(results[1].value);
      if (results[2].status === "fulfilled") setAiUsage(results[2].value);
      if (results[3].status === "fulfilled") setSecurity(results[3].value);
      if (results[4].status === "fulfilled") setTasks(results[4].value);
      if (results[5].status === "fulfilled") setDocuments(results[5].value);
      if (results[6].status === "fulfilled") setMeetings(results[6].value);
      if (results[7].status === "fulfilled") setNotifications(results[7].value);
      if (results[8].status === "fulfilled") setSummaries(results[8].value);
      if (results[9].status === "fulfilled") {
        setPresence(results[9].value.users);
        setOnlineCount(results[9].value.online_count);
      }
      if (results[10].status === "fulfilled") setUsers(results[10].value);
      if (results[11].status === "fulfilled") setUnreadCount(results[11].value);
      if (results[12].status === "fulfilled") setSystemHealth(results[12].value);

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed === results.length) {
        setError("Unable to load workspace data");
      }
    } catch {
      setError("Unable to load workspace data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 120_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const mergedPresence = useMemo(() => {
    if (!presenceLive || presence.length === 0) return presence;
    const onlineIds = new Set(wsOnlineUsers.map((u) => u.id));
    return presence.map((user) => ({
      ...user,
      is_online: onlineIds.has(user.id),
      department: user.department ?? wsOnlineUsers.find((w) => w.id === user.id)?.department,
    }));
  }, [presence, wsOnlineUsers, presenceLive]);

  const mergedOnlineCount = presenceLive ? wsOnlineCount : onlineCount;

  const mergedSystemHealth = useMemo<SystemHealth>(
    () => ({
      ...systemHealth,
      websocket: presenceLive ? "operational" : systemHealth.websocket,
    }),
    [systemHealth, presenceLive]
  );

  const value = useMemo<DashboardData>(
    () => ({
      loading,
      error,
      overview,
      productivity,
      aiUsage,
      security,
      tasks,
      documents,
      meetings,
      notifications,
      summaries,
      presence: mergedPresence,
      onlineCount: mergedOnlineCount,
      users,
      unreadCount,
      systemHealth: mergedSystemHealth,
      presenceLive,
      refresh,
    }),
    [
      loading,
      error,
      overview,
      productivity,
      aiUsage,
      security,
      tasks,
      documents,
      meetings,
      notifications,
      summaries,
      mergedPresence,
      mergedOnlineCount,
      users,
      unreadCount,
      mergedSystemHealth,
      presenceLive,
      refresh,
    ]
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData(): DashboardData {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }
  return ctx;
}
