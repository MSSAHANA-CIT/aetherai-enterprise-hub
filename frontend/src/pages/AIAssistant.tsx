import { useCallback, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, sendAIMessage, type AIMode } from "../lib/api";
import {
  deserializeMessages,
  getAIChatSession,
  persistAIConversation,
} from "../lib/aiChatHistory";
import AIAssistantLayout from "../components/ai/AIAssistantLayout";
import type { AIMessage } from "../components/ai/AIMessageBubble";
import { AI_PROMPT_CARDS } from "../components/ai/AIPromptCards";

const FALLBACK_MARKER = "OpenAI API key is not configured";

function createMessageId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getModeForPrompt(prompt: string): AIMode | null {
  const card = AI_PROMPT_CARDS.find((item) => item.prompt === prompt);
  if (!card) return null;

  switch (card.id) {
    case "engineering-updates":
    case "meeting-actions":
      return "meeting_summary";
    case "client-email":
      return "email_writer";
    case "project-tasks":
      return "task_planner";
    case "error-log":
      return "error_explainer";
    default:
      return "general";
  }
}

export default function AIAssistant() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AIMode>("general");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [initialPromptHandled, setInitialPromptHandled] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userName = user?.name ?? "You";
  const userInitials = user?.initials ?? "U";

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/ai" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const sendMessage = useCallback(
    async (message: string, overrideMode?: AIMode) => {
      if (!token || !message.trim()) return;

      const activeMode = overrideMode ?? mode;
      const userMessage: AIMessage = {
        id: createMessageId(),
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const result = await sendAIMessage(token, message.trim(), activeMode);
        const assistantMessage: AIMessage = {
          id: createMessageId(),
          role: "assistant",
          content: result.data.response,
          timestamp: new Date(),
          isFallback: result.data.response.includes(FALLBACK_MARKER),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (handleAuthError(err)) return;

        if (err instanceof ApiError && err.status === 0) {
          setError("Unable to reach the AI service. Please check that the backend is running.");
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to generate AI response.");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, mode, handleAuthError]
  );

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      const suggestedMode = getModeForPrompt(prompt);
      if (suggestedMode) {
        setMode(suggestedMode);
      }
      void sendMessage(prompt, suggestedMode ?? mode);
    },
    [mode, sendMessage]
  );

  useEffect(() => {
    const state = location.state as { initialPrompt?: string; resumeSessionId?: string; mode?: AIMode } | null;
    const resumeId = state?.resumeSessionId;
    if (resumeId && !sessionId) {
      const session = getAIChatSession(resumeId);
      if (session) {
        setMessages(deserializeMessages(session.messages));
        setSessionId(session.id);
        if (session.mode) setMode(session.mode as AIMode);
      }
    }
  }, [location.state, sessionId]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const id = persistAIConversation(messages, mode, sessionId);
      setSessionId((prev) => prev ?? id);
    }, 400);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [messages, mode, sessionId]);

  useEffect(() => {
    const initialPrompt = (location.state as { initialPrompt?: string; mode?: AIMode } | null)?.initialPrompt;
    const stateMode = (location.state as { mode?: AIMode } | null)?.mode;
    if (!initialPrompt || initialPromptHandled || !token) return;

    setInitialPromptHandled(true);
    setPromptDraft(initialPrompt);
    const suggestedMode = stateMode ?? getModeForPrompt(initialPrompt);
    if (suggestedMode) setMode(suggestedMode);
    void sendMessage(initialPrompt, suggestedMode ?? mode);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, initialPromptHandled, token, sendMessage, mode, navigate, location.pathname]);

  return (
    <AIAssistantLayout
      mode={mode}
      messages={messages}
      loading={loading}
      error={error}
      onModeChange={setMode}
      onSend={sendMessage}
      onSelectPrompt={handleSelectPrompt}
      promptDraft={promptDraft}
      onPromptDraftConsumed={() => setPromptDraft("")}
      userName={userName}
      userInitials={userInitials}
    />
  );
}
