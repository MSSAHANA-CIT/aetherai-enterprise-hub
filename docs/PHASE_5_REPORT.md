# Phase 5 Report — Real-Time WebSocket Chat + Presence

## Phase Objective

Upgrade Team Chat from REST-only messaging to real-time enterprise chat using FastAPI WebSockets. Deliver live messages without refresh, typing indicators, online presence, connection status, and a premium chat UX while keeping all existing REST chat APIs working.

## Files Created

### Backend
| File | Purpose |
|------|---------|
| `backend/app/services/connection_manager.py` | `ConnectionManager` — tracks WebSocket connections, online users, typing state, and broadcasts events per channel |
| `backend/app/api/routes/websocket_chat.py` | WebSocket endpoint with JWT validation, message persistence, and event handling |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/hooks/useChatSocket.ts` | React hook for WebSocket connection, reconnection, presence, typing, and message events |

### Documentation
| File | Purpose |
|------|---------|
| `docs/PHASE_5_REPORT.md` | This report |

## Files Modified

| File | Changes |
|------|---------|
| `backend/app/main.py` | Registered WebSocket router; added websocket path to root API info |
| `frontend/src/pages/TeamChat.tsx` | Integrated `useChatSocket`; WebSocket-first send with REST fallback; deduplicated incoming messages |
| `frontend/src/components/chat/ChatLayout.tsx` | Passes connection status, presence, typing, and live glow indicator |
| `frontend/src/components/chat/ChatHeader.tsx` | Live/Connecting/Offline status pill, online count, reconnect notice |
| `frontend/src/components/chat/MessageList.tsx` | Typing indicator UI, auto-scroll on new messages and typing |
| `frontend/src/components/chat/MessageComposer.tsx` | Typing events with 1s idle timeout; Enter/Shift+Enter behavior |
| `frontend/src/lib/api.ts` | Exported `WS_BASE_URL` for WebSocket connections |
| `README.md` | Added Phase 5 completion summary |

## WebSocket Architecture

```
Browser A ──┐
            ├── WebSocket ──► /ws/chat/{channel_id}?token=JWT
Browser B ──┘                        │
                                     ▼
                          websocket_chat.py (JWT validate)
                                     │
                                     ▼
                          ConnectionManager (in-memory)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              broadcast         broadcast         broadcast
              message           typing            presence
                    │                │                │
                    └────────────────┴────────────────┘
                                     │
                                     ▼
                          All connected clients in channel
```

- WebSocket endpoint is **not** under `/api` prefix: `ws://localhost:8000/ws/chat/{channel_id}?token={JWT}`
- JWT is validated on connect using the same `decode_access_token` logic as REST auth
- Invalid or missing tokens are rejected with WebSocket close code `1008` (policy violation)
- Messages received over WebSocket are saved to SQLite via SQLAlchemy, then broadcast to all channel subscribers

## Connection Manager Design

`ConnectionManager` maintains three in-memory maps keyed by `channel_id`:

| Map | Structure | Purpose |
|-----|-----------|---------|
| `active_connections` | `channel_id → {user_id → WebSocket}` | Live socket handles for broadcast |
| `online_users` | `channel_id → {user_id → user_info}` | Presence roster |
| `typing_users` | `channel_id → {user_id → bool}` | Ephemeral typing state |

Key methods:
- `connect()` — accept socket, register user
- `disconnect()` — remove user and clean up empty channels
- `broadcast()` — send JSON event to all users in channel (optional exclude)
- `broadcast_presence()` — push updated `online_users` list
- `broadcast_typing()` — push typing start/stop events
- `broadcast_message()` — push saved message payload

On disconnect, stale sockets are cleaned up if send fails.

## Events Supported

### Client → Server

| Type | Payload | Action |
|------|---------|--------|
| `message` | `{ "type": "message", "content": "Hello team" }` | Save to DB, broadcast to channel |
| `typing` | `{ "type": "typing", "is_typing": true }` | Broadcast typing indicator (excludes sender) |

### Server → Client

| Type | Payload | When |
|------|---------|------|
| `message` | `{ "type": "message", "message": {...} }` | New message saved/broadcast |
| `typing` | `{ "type": "typing", "user": {...}, "is_typing": true }` | User starts/stops typing |
| `presence` | `{ "type": "presence", "online_users": [...] }` | Join, leave, or initial connect |
| `user_joined` | `{ "type": "user_joined", "user": {...} }` | User connects to channel |
| `user_left` | `{ "type": "user_left", "user": {...} }` | User disconnects from channel |
| `error` | `{ "type": "error", "detail": "..." }` | Malformed client event |

## Frontend Socket Hook

`useChatSocket` (`frontend/src/hooks/useChatSocket.ts`):

- Connects when `channelId` and `token` are available
- Reads token from auth context (stored in `localStorage` as `access_token`)
- URL: `ws://localhost:8000/ws/chat/{channelId}?token={token}`
- Exposes `connectionStatus`: `live` | `connecting` | `offline`
- Auto-reconnects with exponential backoff (1s → 10s max)
- Deduplicates messages by `id` in parent `TeamChat` handler
- `sendMessage()` returns `false` if socket unavailable (triggers REST fallback)
- `sendTyping(true/false)` emits typing events

## Testing Steps

1. **Start backend:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser 1: http://localhost:5173/chat (login/register)
4. Open browser 2 (incognito): register/login as another user
5. Both users open the same channel (e.g. `general`)
6. Confirm **Live** pill and online count in chat header
7. Send message from browser 1 → appears instantly in browser 2
8. Type in browser 1 → typing indicator appears in browser 2
9. Close browser 1 → online count decreases in browser 2
10. Stop backend → header shows **Offline** and auto-reconnect message
11. Restart backend → connection restores automatically

### REST fallback test
- With backend running but WebSocket blocked, send a message
- Message should still send via `POST /api/chat/channels/{id}/messages`

## Limitations

- **In-memory presence** — online users and typing state are lost on server restart; not suitable for multi-instance deployment without Redis
- **No message pagination** — full message history loaded on channel select (same as Phase 4)
- **No read receipts** — unread counts remain hardcoded mock values
- **No channel membership** — any authenticated user can join any channel WebSocket
- **Single-server only** — broadcasts do not cross multiple Uvicorn workers
- **No message edit/delete** over WebSocket
- **Typing state** is not persisted; cleared on disconnect

## Next Phase Recommendation

**Phase 6 — AI Assistant Integration + Smart Summaries**

- Wire the "Summarize" and "AI rewrite" buttons in chat to a backend AI endpoint
- Add channel/thread summarization using conversation history
- Implement `@mention` notifications
- Add Redis pub/sub for horizontal WebSocket scaling
- Persist read state and real unread counts
- Optional: file attachments and rich message types
