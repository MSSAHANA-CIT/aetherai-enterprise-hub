import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useComingSoon } from "../context/ComingSoonContext";
import { useChatSocket, type OnlineUser } from "../hooks/useChatSocket";
import { ApiError, api, sendAIMessage, type ApiChannel, type ApiMessage, type PresenceUser } from "../lib/api";
import ChatLayout, { ChatLayoutSkeleton } from "../components/chat/ChatLayout";

const PRESENCE_POLL_MS = 5000;

function mergePresenceUsers(
  apiUsers: PresenceUser[],
  workspaceOnline: OnlineUser[]
): PresenceUser[] {
  const onlineIds = new Set(workspaceOnline.map((user) => user.id));
  const channelByUser = new Map(
    workspaceOnline.map((user) => [user.id, user.active_channel ?? null])
  );

  const merged = apiUsers.map((user) => {
    const isOnline = onlineIds.has(user.id) || user.is_online;
    return {
      ...user,
      is_online: isOnline,
      active_channel: channelByUser.get(user.id) ?? user.active_channel,
      last_seen: isOnline ? null : user.last_seen,
    };
  });

  return merged.sort((a, b) => {
    if (a.is_online !== b.is_online) {
      return a.is_online ? -1 : 1;
    }
    return a.full_name.localeCompare(b.full_name);
  });
}

function filterMessages(messages: ApiMessage[], query: string): ApiMessage[] {
  const q = query.trim().toLowerCase();
  if (!q) return messages;
  return messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(q) ||
      msg.sender.full_name.toLowerCase().includes(q) ||
      msg.sender.role.toLowerCase().includes(q)
  );
}

export default function TeamChat() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { openComingSoon } = useComingSoon();

  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [dmChannels, setDmChannels] = useState<ApiChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ApiChannel | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ApiMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingPinned, setLoadingPinned] = useState(false);
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [messagingUserId, setMessagingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [workspaceOnlineUsers, setWorkspaceOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeThread, setActiveThread] = useState<ApiMessage | null>(null);
  const [aiInsights, setAiInsights] = useState<{
    health: string;
    actionItems: string[];
    decisions: string[];
    loading?: boolean;
  }>({
    health: "Active collaboration with steady engagement.",
    actionItems: ["Review open threads", "Follow up on pending decisions"],
    decisions: ["No formal decisions detected yet"],
  });

  const selectedChannelRef = useRef<ApiChannel | null>(null);
  selectedChannelRef.current = selectedChannel;

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/chat" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const refreshDms = useCallback(async () => {
    if (!token) return;
    const conversations = await api.getDmConversations(token);
    setDmChannels(conversations);
    return conversations;
  }, [token]);

  const handleIncomingMessage = useCallback((message: ApiMessage) => {
    if (message.parent_message_id) return;

    setMessages((prev) => {
      const withoutOptimistic = prev.filter(
        (item) => !(item.id < 0 && item.content === message.content && item.sender.id === message.sender.id)
      );
      if (withoutOptimistic.some((item) => item.id === message.id)) {
        return withoutOptimistic;
      }
      return [...withoutOptimistic, message];
    });

    if (selectedChannelRef.current?.channel_type === "dm") {
      void refreshDms();
    }
  }, [refreshDms]);

  const handleWorkspacePresence = useCallback((users: OnlineUser[]) => {
    setWorkspaceOnlineUsers(users);
  }, []);

  const {
    connectionStatus,
    onlineUsers,
    workspaceOnlineUsers: socketWorkspaceUsers,
    typingUsers,
    socketError,
    isConnected,
    sendMessage: sendSocketMessage,
    sendTyping,
  } = useChatSocket({
    channelId: selectedChannel?.id ?? null,
    token,
    onMessage: handleIncomingMessage,
    onWorkspacePresence: handleWorkspacePresence,
    enabled: Boolean(token && selectedChannel),
  });

  const displayPresenceUsers = useMemo(
    () => mergePresenceUsers(presenceUsers, workspaceOnlineUsers.length > 0 ? workspaceOnlineUsers : socketWorkspaceUsers),
    [presenceUsers, workspaceOnlineUsers, socketWorkspaceUsers]
  );

  const senderOnlineMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (const u of displayPresenceUsers) {
      map[u.id] = u.is_online;
    }
    return map;
  }, [displayPresenceUsers]);

  const filteredMessages = useMemo(
    () => filterMessages(messages, searchQuery),
    [messages, searchQuery]
  );

  const loadPresence = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getPresenceUsers(token);
      setPresenceUsers(response.users);
    } catch {
      // Keep last known presence
    }
  }, [token]);

  const loadPinned = useCallback(async () => {
    if (!token || !selectedChannel) return;
    setLoadingPinned(true);
    try {
      const pinned = await api.getPinnedMessages(token, selectedChannel.id);
      setPinnedMessages(pinned);
    } catch {
      setPinnedMessages([]);
    } finally {
      setLoadingPinned(false);
    }
  }, [token, selectedChannel]);

  const refreshChannels = useCallback(async () => {
    if (!token) return;
    const updatedChannels = await api.getChannels(token);
    setChannels(updatedChannels);
    await refreshDms();
  }, [token, refreshDms]);

  const loadAiInsights = useCallback(async () => {
    if (!token || !selectedChannel || selectedChannel.channel_type === "dm") return;

    const recentText = messages
      .slice(-20)
      .map((m) => `${m.sender.full_name}: ${m.content}`)
      .join("\n");

    if (!recentText.trim()) return;

    setAiInsights((prev) => ({ ...prev, loading: true }));
    try {
      const result = await sendAIMessage(
        token,
        `Analyze this team chat conversation and respond in JSON format with keys: health (one sentence), actionItems (array of strings), decisions (array of strings).\n\n${recentText}`,
        "general"
      );
      const text = result.data.response;
      try {
        const parsed = JSON.parse(text) as { health?: string; actionItems?: string[]; decisions?: string[] };
        setAiInsights({
          health: parsed.health ?? "Active collaboration.",
          actionItems: parsed.actionItems ?? ["Review open threads"],
          decisions: parsed.decisions ?? ["No formal decisions yet"],
          loading: false,
        });
      } catch {
        setAiInsights({
          health: text.slice(0, 200),
          actionItems: ["Review conversation highlights"],
          decisions: ["See AI summary for details"],
          loading: false,
        });
      }
    } catch {
      setAiInsights((prev) => ({ ...prev, loading: false }));
    }
  }, [token, selectedChannel, messages]);

  useEffect(() => {
    if (!token) return;

    const loadChannels = async () => {
      setLoadingChannels(true);
      setError(null);

      try {
        const [teamChannels, conversations] = await Promise.all([
          api.getChannels(token),
          api.getDmConversations(token),
        ]);
        setChannels(teamChannels);
        setDmChannels(conversations);

        const general = teamChannels.find((c) => c.name === "general") ?? teamChannels[0] ?? null;
        setSelectedChannel(general);
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to load channels");
        }
      } finally {
        setLoadingChannels(false);
      }
    };

    void loadChannels();
  }, [token, handleAuthError]);

  useEffect(() => {
    if (!token) return;
    void loadPresence();
    const interval = setInterval(() => void loadPresence(), PRESENCE_POLL_MS);
    return () => clearInterval(interval);
  }, [token, loadPresence]);

  useEffect(() => {
    if (!token || !selectedChannel) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      setSearchQuery("");
      setActiveThread(null);

      try {
        const data = await api.getMessages(token, selectedChannel.id);
        setMessages(data);
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to load messages");
          setMessages([]);
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    void loadMessages();
    void loadPinned();
  }, [token, selectedChannel, handleAuthError, loadPinned]);

  useEffect(() => {
    if (messages.length > 5) {
      void loadAiInsights();
    }
  }, [messages.length, selectedChannel?.id, loadAiInsights]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("chat-search-input")?.focus();
      }
      if (e.key === "Escape") {
        setActiveThread(null);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectChannel = (channel: ApiChannel) => {
    setSelectedChannel(channel);
    setMessages([]);
  };

  const handleMessageUser = useCallback(
    async (userId: number) => {
      if (!token || String(userId) === user?.id) return;

      setMessagingUserId(userId);
      setError(null);

      try {
        const dmChannel = await api.startDm(token, userId);
        const conversations = await refreshDms();
        const latestChannel = conversations?.find((item) => item.id === dmChannel.id) ?? dmChannel;
        setSelectedChannel(latestChannel);
        setMessages([]);
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof ApiError ? err.message : "Failed to start conversation");
        }
      } finally {
        setMessagingUserId(null);
      }
    },
    [token, user?.id, refreshDms, handleAuthError]
  );

  const handleSendMessage = async (content: string, parentMessageId?: number) => {
    if (!token || !selectedChannel || !user) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);

    const optimisticId = -Date.now();
    const optimisticMessage: ApiMessage = {
      id: optimisticId,
      content: trimmed,
      message_type: "text",
      created_at: new Date().toISOString(),
      parent_message_id: parentMessageId ?? null,
      sender: {
        id: Number(user.id),
        full_name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    if (!parentMessageId) {
      setMessages((prev) => [...prev, optimisticMessage]);
    }

    try {
      if (isConnected && !parentMessageId) {
        const sent = sendSocketMessage(trimmed);
        if (sent) {
          sendTyping(false);
          void refreshChannels();
          return;
        }
      }

      const saved = await api.sendMessage(token, selectedChannel.id, trimmed, "text", parentMessageId);
      if (!parentMessageId) {
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((item) => item.id !== optimisticId);
          if (withoutOptimistic.some((item) => item.id === saved.id)) {
            return withoutOptimistic;
          }
          return [...withoutOptimistic, saved];
        });
      }
      await refreshChannels();
    } catch (err) {
      if (!parentMessageId) {
        setMessages((prev) => prev.filter((item) => item.id !== optimisticId));
      }
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to send message");
      }
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (content: string, parentMessageId: number) => {
    await handleSendMessage(content, parentMessageId);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === parentMessageId
          ? { ...msg, reply_count: (msg.reply_count ?? 0) + 1 }
          : msg
      )
    );
  };

  const handleSendFile = async (file: File, caption?: string) => {
    if (!token || !selectedChannel) return;

    setSending(true);
    setError(null);

    try {
      const saved = await api.uploadChatAttachment(token, selectedChannel.id, file, caption);
      setMessages((prev) => {
        if (prev.some((item) => item.id === saved.id)) {
          return prev;
        }
        return [...prev, saved];
      });
      await refreshChannels();
      if (selectedChannel.channel_type === "dm") {
        await refreshDms();
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to upload file");
      }
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleSummarize = async () => {
    if (!token || !selectedChannel || selectedChannel.channel_type === "dm") return;

    setSummarizing(true);
    setError(null);

    try {
      const summary = await api.generateChannelSummary(token, selectedChannel.id);
      navigate(`/summaries?summary=${summary.id}`);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to generate summary");
      }
    } finally {
      setSummarizing(false);
    }
  };

  const handleCreateTasks = () => {
    openComingSoon({
      title: "Create Tasks from Conversation",
      description: "AI will extract action items from this channel and create tasks automatically.",
      feature: "Team Chat",
    });
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    if (!token) return;

    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const existingGroup = message.reactions?.find((r) => r.emoji === emoji && r.reacted_by_me);

    try {
      if (existingGroup?.my_reaction_id) {
        await api.removeMessageReaction(token, messageId, existingGroup.my_reaction_id);
        updateMessageReactions(messageId, emoji, false);
      } else {
        const created = await api.addMessageReaction(token, messageId, emoji);
        updateMessageReactions(messageId, emoji, true, created.id);
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update reaction");
      }
    }
  };

  const updateMessageReactions = (messageId: number, emoji: string, add: boolean, reactionId?: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const reactions = [...(msg.reactions ?? [])];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (add) {
          if (idx >= 0) {
            reactions[idx] = {
              ...reactions[idx],
              count: reactions[idx].count + 1,
              reacted_by_me: true,
              my_reaction_id: reactionId ?? reactions[idx].my_reaction_id,
              user_ids: [...reactions[idx].user_ids, Number(user?.id)],
            };
          } else {
            reactions.push({
              emoji,
              count: 1,
              reacted_by_me: true,
              my_reaction_id: reactionId ?? null,
              user_ids: [Number(user?.id)],
            });
          }
        } else if (idx >= 0) {
          const nextCount = reactions[idx].count - 1;
          if (nextCount <= 0) {
            reactions.splice(idx, 1);
          } else {
            reactions[idx] = {
              ...reactions[idx],
              count: nextCount,
              reacted_by_me: false,
              my_reaction_id: null,
              user_ids: reactions[idx].user_ids.filter((id) => id !== Number(user?.id)),
            };
          }
        }
        return { ...msg, reactions };
      })
    );
  };

  const handlePinMessage = async (messageId: number) => {
    if (!token) return;
    try {
      const updated = await api.togglePinMessage(token, messageId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, is_pinned: updated.is_pinned } : msg))
      );
      void loadPinned();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to pin message");
      }
    }
  };

  if (loadingChannels) {
    return <ChatLayoutSkeleton />;
  }

  return (
    <ChatLayout
      channels={channels}
      dmChannels={dmChannels}
      selectedChannel={selectedChannel}
      messages={messages}
      filteredMessages={filteredMessages}
      searchQuery={searchQuery}
      currentUserId={user?.id ?? ""}
      currentUserName={user?.name ?? ""}
      loading={loadingMessages}
      sending={sending}
      error={error}
      connectionStatus={connectionStatus}
      onlineUsers={onlineUsers}
      presenceUsers={displayPresenceUsers}
      workspaceOnlineCount={displayPresenceUsers.filter((u) => u.is_online).length}
      typingUsers={typingUsers}
      socketError={socketError}
      messagingUserId={messagingUserId}
      token={token}
      pinnedMessages={pinnedMessages}
      loadingPinned={loadingPinned}
      activeThread={activeThread}
      aiInsights={aiInsights}
      onSelectChannel={handleSelectChannel}
      onMessageUser={(userId) => void handleMessageUser(userId)}
      onSendMessage={(content) => handleSendMessage(content)}
      onSendReply={handleSendReply}
      onSendFile={handleSendFile}
      onTyping={sendTyping}
      onSummarize={() => void handleSummarize()}
      onCreateTasks={handleCreateTasks}
      onSearchChange={setSearchQuery}
      onToggleReaction={(id, emoji) => void handleToggleReaction(id, emoji)}
      onPinMessage={(id) => void handlePinMessage(id)}
      onOpenThread={setActiveThread}
      onCloseThread={() => setActiveThread(null)}
      summarizing={summarizing}
      senderOnlineMap={senderOnlineMap}
    />
  );
}
