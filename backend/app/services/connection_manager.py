from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """Tracks WebSocket connections, online users, and typing state per channel."""

    def __init__(self) -> None:
        self.active_connections: dict[int, dict[int, WebSocket]] = {}
        self.online_users: dict[int, dict[int, dict[str, Any]]] = {}
        self.workspace_online: dict[int, dict[str, Any]] = {}
        self.presence_connections: dict[int, WebSocket] = {}
        self.typing_users: dict[int, dict[int, bool]] = {}
        self.last_seen_cache: dict[int, datetime] = {}

    async def connect(
        self,
        websocket: WebSocket,
        channel_id: int,
        user_id: int,
        user_info: dict[str, Any],
    ) -> None:
        await websocket.accept()

        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = {}
            self.online_users[channel_id] = {}
            self.typing_users[channel_id] = {}

        user_info = {**user_info, "active_channel": f"channel-{channel_id}"}
        self.active_connections[channel_id][user_id] = websocket
        self.online_users[channel_id][user_id] = user_info
        self.workspace_online[user_id] = user_info
        self.last_seen_cache.pop(user_id, None)

    def disconnect(self, channel_id: int, user_id: int) -> None:
        if channel_id in self.active_connections:
            self.active_connections[channel_id].pop(user_id, None)
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]

        if channel_id in self.online_users:
            self.online_users[channel_id].pop(user_id, None)
            if not self.online_users[channel_id]:
                del self.online_users[channel_id]

        if channel_id in self.typing_users:
            self.typing_users[channel_id].pop(user_id, None)
            if not self.typing_users[channel_id]:
                del self.typing_users[channel_id]

        if not self.is_user_online_anywhere(user_id) and user_id not in self.presence_connections:
            self.workspace_online.pop(user_id, None)
            self.last_seen_cache[user_id] = datetime.now(timezone.utc)

    def is_user_online_anywhere(self, user_id: int) -> bool:
        if user_id in self.presence_connections:
            return True
        for users in self.online_users.values():
            if user_id in users:
                return True
        return False

    async def connect_presence(self, websocket: WebSocket, user_id: int, user_info: dict[str, Any]) -> None:
        await websocket.accept()
        self.presence_connections[user_id] = websocket
        self.workspace_online[user_id] = user_info
        self.last_seen_cache.pop(user_id, None)

    def disconnect_presence(self, user_id: int) -> None:
        self.presence_connections.pop(user_id, None)
        if not self.is_user_online_anywhere(user_id):
            self.workspace_online.pop(user_id, None)
            self.last_seen_cache[user_id] = datetime.now(timezone.utc)

    def get_last_seen(self, user_id: int) -> datetime | None:
        return self.last_seen_cache.get(user_id)

    def get_online_users(self, channel_id: int) -> list[dict[str, Any]]:
        return list(self.online_users.get(channel_id, {}).values())

    def get_workspace_online_users(self) -> list[dict[str, Any]]:
        return list(self.workspace_online.values())

    def get_workspace_online_ids(self) -> set[int]:
        return set(self.workspace_online.keys())

    async def send_personal(self, websocket: WebSocket, event: dict[str, Any]) -> None:
        await websocket.send_json(event)

    async def broadcast(self, channel_id: int, event: dict[str, Any], exclude_user_id: int | None = None) -> None:
        connections = self.active_connections.get(channel_id, {})
        for user_id, websocket in list(connections.items()):
            if exclude_user_id is not None and user_id == exclude_user_id:
                continue
            try:
                await websocket.send_json(event)
            except Exception:
                self.disconnect(channel_id, user_id)

    async def broadcast_all(self, event: dict[str, Any]) -> None:
        for channel_id in list(self.active_connections.keys()):
            await self.broadcast(channel_id, event)

    async def broadcast_presence(self, channel_id: int) -> None:
        await self.broadcast(
            channel_id,
            {
                "type": "presence",
                "online_users": self.get_online_users(channel_id),
            },
        )

    async def broadcast_workspace_presence(self) -> None:
        payload = {
            "type": "workspace_presence",
            "online_users": self.get_workspace_online_users(),
            "online_count": len(self.workspace_online),
        }
        await self.broadcast_all(payload)
        for user_id, websocket in list(self.presence_connections.items()):
            try:
                await websocket.send_json(payload)
            except Exception:
                self.disconnect_presence(user_id)

    async def send_initial_presence(self, websocket: WebSocket, channel_id: int) -> None:
        await self.send_personal(
            websocket,
            {
                "type": "presence",
                "online_users": self.get_online_users(channel_id),
            },
        )
        await self.send_personal(
            websocket,
            {
                "type": "workspace_presence",
                "online_users": self.get_workspace_online_users(),
                "online_count": len(self.workspace_online),
            },
        )

    async def broadcast_typing(
        self,
        channel_id: int,
        user_info: dict[str, Any],
        is_typing: bool,
        exclude_user_id: int | None = None,
    ) -> None:
        if channel_id not in self.typing_users:
            self.typing_users[channel_id] = {}

        if is_typing:
            self.typing_users[channel_id][user_info["id"]] = True
        else:
            self.typing_users[channel_id].pop(user_info["id"], None)

        await self.broadcast(
            channel_id,
            {
                "type": "typing",
                "user": user_info,
                "is_typing": is_typing,
            },
            exclude_user_id=exclude_user_id,
        )

    async def broadcast_message(self, channel_id: int, message: dict[str, Any]) -> None:
        await self.broadcast(
            channel_id,
            {
                "type": "message",
                "message": message,
            },
        )


manager = ConnectionManager()
