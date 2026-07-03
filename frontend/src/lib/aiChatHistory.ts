import type { AIMessage } from "../components/ai/AIMessageBubble";

const STORAGE_KEY = "aether_ai_chat_history";
const MAX_CONVERSATIONS = 20;
const MAX_MESSAGES_PER_SESSION = 100;

export interface AIChatSession {
  id: string;
  title: string;
  preview: string;
  mode: string;
  updatedAt: string;
  messages: StoredAIMessage[];
}

export interface StoredAIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

function loadSessions(): AIChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AIChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: AIChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_CONVERSATIONS)));
  } catch {
    /* storage full or unavailable */
  }
}

function deriveTitle(messages: AIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "AI Conversation";
  return firstUser.content.length > 48 ? `${firstUser.content.slice(0, 48)}…` : firstUser.content;
}

function derivePreview(messages: AIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "assistant" || m.role === "user");
  if (!last) return "New conversation";
  return last.content.length > 80 ? `${last.content.slice(0, 80)}…` : last.content;
}

export function serializeMessages(messages: AIMessage[]): StoredAIMessage[] {
  return messages.slice(-MAX_MESSAGES_PER_SESSION).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp.toISOString(),
    isFallback: m.isFallback,
  }));
}

export function deserializeMessages(stored: StoredAIMessage[]): AIMessage[] {
  return stored.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
    isFallback: m.isFallback,
  }));
}

export function persistAIConversation(messages: AIMessage[], mode: string, sessionId?: string): string {
  if (messages.length === 0) return sessionId ?? "";

  const sessions = loadSessions();
  const id = sessionId ?? `session-${Date.now()}`;
  const existingIndex = sessions.findIndex((s) => s.id === id);
  const session: AIChatSession = {
    id,
    title: deriveTitle(messages),
    preview: derivePreview(messages),
    mode,
    updatedAt: new Date().toISOString(),
    messages: serializeMessages(messages),
  };

  if (existingIndex >= 0) {
    sessions.splice(existingIndex, 1);
  }
  sessions.unshift(session);
  saveSessions(sessions);
  return id;
}

export function getRecentAIChats(limit = 5): AIChatSession[] {
  return loadSessions()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function getAIChatSession(sessionId: string): AIChatSession | null {
  return loadSessions().find((s) => s.id === sessionId) ?? null;
}

export function clearAIChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
