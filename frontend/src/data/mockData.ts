import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  CheckSquare,
  BookOpen,
  Video,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  online: boolean;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  assignee: string;
}

export interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export interface KnowledgeResult {
  id: string;
  title: string;
  type: string;
  updated: string;
}

export interface ActivityItem {
  id: string;
  type: "document" | "ai" | "task" | "meeting";
  title: string;
  description: string;
  time: string;
}

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  role: string;
  email: string;
  company?: string;
  initials: string;
  avatarColor: string;
}

export const demoUser: UserProfile & { id: string; company: string } = {
  id: "demo-user-001",
  name: "Monish",
  role: "Engineering Lead",
  email: "monish@aetherai.com",
  company: "AetherAI",
  initials: "MT",
  avatarColor: "from-aether-500 to-purple-600",
};

export const currentUser: UserProfile = demoUser;

export interface AuthFeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: "Bot" | "MessageSquare" | "CheckSquare" | "BookOpen" | "Shield" | "BarChart3";
  gradient: string;
  position: string;
}

export const authFeatureHighlights: AuthFeatureHighlight[] = [
  {
    id: "ai",
    title: "AI Assistant",
    description: "Context-aware copilot for every workflow",
    icon: "Bot",
    gradient: "from-aether-500 to-indigo-500",
    position: "top-0 left-0",
  },
  {
    id: "chat",
    title: "Team Chat",
    description: "Real-time collaboration across departments",
    icon: "MessageSquare",
    gradient: "from-blue-500 to-cyan-500",
    position: "top-8 right-0",
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Kanban boards with AI prioritization",
    icon: "CheckSquare",
    gradient: "from-emerald-500 to-teal-500",
    position: "top-36 left-8",
  },
  {
    id: "knowledge",
    title: "Knowledge Base",
    description: "Enterprise search across all documents",
    icon: "BookOpen",
    gradient: "from-purple-500 to-pink-500",
    position: "top-44 right-6",
  },
  {
    id: "security",
    title: "Security",
    description: "SOC 2 ready with role-based access",
    icon: "Shield",
    gradient: "from-amber-500 to-orange-500",
    position: "bottom-16 left-0",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Productivity insights and team metrics",
    icon: "BarChart3",
    gradient: "from-rose-500 to-red-500",
    position: "bottom-8 right-4",
  },
];

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "ai", label: "AI Assistant", icon: Bot, href: "/ai" },
  { id: "chat", label: "Team Chat", icon: MessageSquare, href: "/chat" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen, href: "/knowledge" },
  { id: "meetings", label: "Meetings", icon: Video, href: "/meetings" },
  { id: "summaries", label: "Summaries", icon: FileText, href: "/summaries", managerOnly: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics", managerOnly: true },
  { id: "admin", label: "Admin", icon: Settings, href: "/admin/users", adminOnly: true },
  { id: "audit-logs", label: "Audit Logs", icon: ClipboardList, href: "/admin/audit-logs", adminOnly: true },
];

export const metrics: Metric[] = [
  { id: "employees", label: "Active Employees", value: "142", change: "+8%", trend: "up" },
  { id: "ai-queries", label: "AI Queries Today", value: "1,847", change: "+34%", trend: "up" },
  { id: "tasks", label: "Open Tasks", value: "38", change: "-12%", trend: "down" },
  { id: "documents", label: "Documents Analyzed", value: "256", change: "+19%", trend: "up" },
];

export const aiSuggestedPrompts = [
  "Summarize today's team updates",
  "Draft a client email",
  "Explain this error log",
  "Create a project plan",
];

export const chatMessages: ChatMessage[] = [
  {
    id: "1",
    user: "Priya",
    message: "Can someone review the deployment checklist?",
    time: "9:42 AM",
    online: true,
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    id: "2",
    user: "Arjun",
    message: "AI summary looks good for the morning standup.",
    time: "9:45 AM",
    online: true,
    avatarColor: "from-blue-500 to-cyan-600",
  },
  {
    id: "3",
    user: "Sahana",
    message: "I uploaded the new policy document.",
    time: "9:51 AM",
    online: true,
    avatarColor: "from-emerald-500 to-teal-600",
  },
];

export const taskColumns: TaskColumn[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "t1", title: "Review deployment checklist", priority: "high", assignee: "Priya" },
      { id: "t2", title: "Update API documentation", priority: "medium", assignee: "Arjun" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      { id: "t3", title: "Q3 roadmap finalization", priority: "high", assignee: "Sahana" },
      { id: "t4", title: "Security audit prep", priority: "medium", assignee: "Monish" },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      { id: "t5", title: "Morning standup summary", priority: "low", assignee: "AI" },
      { id: "t6", title: "Policy document upload", priority: "low", assignee: "Sahana" },
    ],
  },
];

export const knowledgeResults: KnowledgeResult[] = [
  { id: "k1", title: "VPN Setup Guide", type: "IT Policy", updated: "2 days ago" },
  { id: "k2", title: "Deployment Checklist", type: "Engineering", updated: "Today" },
  { id: "k3", title: "Leave Policy", type: "HR", updated: "1 week ago" },
  { id: "k4", title: "Incident Response SOP", type: "Security", updated: "3 days ago" },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "a1",
    type: "document",
    title: "Document uploaded",
    description: "Sahana uploaded Leave Policy v2.1",
    time: "12 min ago",
  },
  {
    id: "a2",
    type: "ai",
    title: "AI summary generated",
    description: "Morning standup summary ready for review",
    time: "28 min ago",
  },
  {
    id: "a3",
    type: "task",
    title: "Task completed",
    description: "Arjun marked Security audit prep as done",
    time: "1 hr ago",
  },
  {
    id: "a4",
    type: "meeting",
    title: "Meeting note created",
    description: "Product sync notes shared with team",
    time: "2 hrs ago",
  },
];

export const analyticsMetrics: AnalyticsMetric[] = [
  { id: "productivity", label: "Productivity Score", value: 87, max: 100, unit: "%", color: "from-aether-500 to-indigo-400" },
  { id: "automation", label: "AI Automation Usage", value: 72, max: 100, unit: "%", color: "from-purple-500 to-pink-400" },
  { id: "completion", label: "Task Completion", value: 64, max: 100, unit: "%", color: "from-emerald-500 to-teal-400" },
];

export const weeklyChartData = [45, 62, 58, 78, 65, 88, 74];

export const quickActions = [
  { id: "ask-ai", label: "Ask AI", icon: "Bot" as const },
  { id: "start-chat", label: "Start Chat", icon: "MessageSquare" as const },
  { id: "create-task", label: "Create Task", icon: "CheckSquare" as const },
  { id: "upload-doc", label: "Upload Document", icon: "FileText" as const },
];
