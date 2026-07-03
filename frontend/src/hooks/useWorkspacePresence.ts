import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "../lib/api";

export interface WorkspaceOnlineUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  active_channel?: string;
}

interface WorkspacePresenceEvent {
  type: "workspace_presence";
  online_users: WorkspaceOnlineUser[];
  online_count: number;
}

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;

export function useWorkspacePresence(token: string | null, enabled = true) {
  const [onlineUsers, setOnlineUsers] = useState<WorkspaceOnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    if (!enabled || !token) {
      disconnect();
      return;
    }

    disconnect();

    const url = `${WS_BASE_URL}/ws/presence?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WorkspacePresenceEvent;
        if (data.type === "workspace_presence") {
          setOnlineUsers(data.online_users ?? []);
          setOnlineCount(data.online_count ?? data.online_users?.length ?? 0);
        }
      } catch {
        /* ignore malformed payloads */
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      if (!enabled || !token) return;

      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** reconnectAttemptRef.current,
        RECONNECT_MAX_MS
      );
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled, token, disconnect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { onlineUsers, onlineCount, connected };
}
