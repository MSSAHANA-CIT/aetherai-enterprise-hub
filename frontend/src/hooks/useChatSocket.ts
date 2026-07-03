import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL, type ApiMessage, type ApiSender } from "../lib/api";

export type ConnectionStatus = "live" | "connecting" | "offline";

export interface OnlineUser extends ApiSender {
  active_channel?: string;
}

export interface TypingUser extends ApiSender {}

interface UseChatSocketOptions {
  channelId: number | null;
  token: string | null;
  onMessage: (message: ApiMessage) => void;
  onWorkspacePresence?: (users: OnlineUser[]) => void;
  enabled?: boolean;
}

interface ServerMessageEvent {
  type: "message";
  message: ApiMessage;
}

interface ServerTypingEvent {
  type: "typing";
  user: TypingUser;
  is_typing: boolean;
}

interface ServerPresenceEvent {
  type: "presence";
  online_users: OnlineUser[];
}

interface ServerWorkspacePresenceEvent {
  type: "workspace_presence";
  online_users: OnlineUser[];
  online_count: number;
}

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;
const HEARTBEAT_MS = 25000;

export function useChatSocket({
  channelId,
  token,
  onMessage,
  onWorkspacePresence,
  enabled = true,
}: UseChatSocketOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("offline");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [workspaceOnlineUsers, setWorkspaceOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onMessageRef = useRef(onMessage);
  const onWorkspacePresenceRef = useRef(onWorkspacePresence);
  const typingMapRef = useRef<Map<number, TypingUser>>(new Map());

  onMessageRef.current = onMessage;
  onWorkspacePresenceRef.current = onWorkspacePresence;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_MS);
  }, [clearHeartbeat]);

  const updateTypingUsers = useCallback(() => {
    setTypingUsers(Array.from(typingMapRef.current.values()));
  }, []);

  const handleWorkspacePresence = useCallback((users: OnlineUser[]) => {
    setWorkspaceOnlineUsers(users);
    onWorkspacePresenceRef.current?.(users);
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    clearHeartbeat();
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearReconnectTimer, clearHeartbeat]);

  const connect = useCallback(() => {
    if (!enabled || !channelId || !token) {
      setConnectionStatus("offline");
      return;
    }

    disconnect();
    setConnectionStatus("connecting");
    setSocketError(null);
    typingMapRef.current.clear();
    setTypingUsers([]);

    const url = `${WS_BASE_URL}/ws/chat/${channelId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      setConnectionStatus("live");
      setSocketError(null);
      startHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as
          | ServerMessageEvent
          | ServerTypingEvent
          | ServerPresenceEvent
          | ServerWorkspacePresenceEvent
          | { type: string };

        switch (data.type) {
          case "message":
            onMessageRef.current((data as ServerMessageEvent).message);
            break;

          case "typing": {
            const typingEvent = data as ServerTypingEvent;
            if (typingEvent.is_typing) {
              typingMapRef.current.set(typingEvent.user.id, typingEvent.user);
            } else {
              typingMapRef.current.delete(typingEvent.user.id);
            }
            updateTypingUsers();
            break;
          }

          case "presence":
            setOnlineUsers((data as ServerPresenceEvent).online_users);
            break;

          case "workspace_presence":
            handleWorkspacePresence((data as ServerWorkspacePresenceEvent).online_users);
            break;

          case "pong":
            break;

          default:
            break;
        }
      } catch {
        // Ignore malformed server events
      }
    };

    ws.onerror = () => {
      setSocketError("Connection error");
    };

    ws.onclose = () => {
      wsRef.current = null;
      clearHeartbeat();
      setConnectionStatus("offline");
      typingMapRef.current.clear();
      setTypingUsers([]);

      if (!enabled || !channelId || !token) {
        return;
      }

      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** reconnectAttemptRef.current,
        RECONNECT_MAX_MS
      );
      reconnectAttemptRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [
    channelId,
    token,
    enabled,
    disconnect,
    updateTypingUsers,
    handleWorkspacePresence,
    startHeartbeat,
    clearHeartbeat,
  ]);

  useEffect(() => {
    if (!enabled || !channelId || !token) {
      disconnect();
      setConnectionStatus("offline");
      setOnlineUsers([]);
      setWorkspaceOnlineUsers([]);
      setTypingUsers([]);
      typingMapRef.current.clear();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [channelId, token, enabled, connect, disconnect]);

  const sendMessage = useCallback((content: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    ws.send(
      JSON.stringify({
        type: "message",
        content,
      })
    );
    return true;
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(
      JSON.stringify({
        type: "typing",
        is_typing: isTyping,
      })
    );
  }, []);

  const isConnected = connectionStatus === "live";

  return {
    connectionStatus,
    onlineUsers,
    workspaceOnlineUsers,
    typingUsers,
    socketError,
    isConnected,
    sendMessage,
    sendTyping,
    reconnect: connect,
  };
}
