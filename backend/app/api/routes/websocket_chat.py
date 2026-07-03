import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.chat import _build_message_response
from app.core.security import decode_access_token
from app.database import SessionLocal
from app.models.chat import ChatChannel, ChatMessage, DmParticipant
from app.models.user import User, resolve_department
from app.services.connection_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_user_from_token(db: Session, token: str) -> Optional[User]:
    email = decode_access_token(token)
    if email is None:
        return None

    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active:
        return None

    return user


def _user_info(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": resolve_department(user),
    }


async def _reject_websocket(websocket: WebSocket, reason: str = "Invalid or expired token") -> None:
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=reason)


@router.websocket("/ws/chat/{channel_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    channel_id: int,
    token: str = Query(..., description="JWT access token"),
) -> None:
    db = SessionLocal()
    user: Optional[User] = None
    user_data: dict = {}
    connected = False

    try:
        user = _get_user_from_token(db, token)
        if user is None:
            await websocket.accept()
            await _reject_websocket(websocket)
            return

        channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
        if channel is None:
            await websocket.accept()
            await _reject_websocket(websocket, reason="Channel not found")
            return

        if channel.channel_type == "dm":
            participant = (
                db.query(DmParticipant)
                .filter(
                    DmParticipant.channel_id == channel_id,
                    DmParticipant.user_id == user.id,
                )
                .first()
            )
            if participant is None:
                await websocket.accept()
                await _reject_websocket(websocket, reason="Access denied")
                return

        user_data = _user_info(user)
        await manager.connect(websocket, channel_id, user.id, user_data)
        connected = True

        await manager.send_initial_presence(websocket, channel_id)

        await manager.broadcast(
            channel_id,
            {
                "type": "user_joined",
                "user": user_data,
            },
            exclude_user_id=user.id,
        )
        await manager.broadcast_presence(channel_id)
        await manager.broadcast_workspace_presence()

        while True:
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_personal(
                    websocket,
                    {"type": "error", "detail": "Invalid JSON payload"},
                )
                continue

            if not isinstance(data, dict):
                await manager.send_personal(
                    websocket,
                    {"type": "error", "detail": "Event must be a JSON object"},
                )
                continue

            event_type = data.get("type")

            if event_type == "message":
                content = data.get("content", "")
                if not isinstance(content, str):
                    await manager.send_personal(
                        websocket,
                        {"type": "error", "detail": "Message content must be a string"},
                    )
                    continue

                content = content.strip()
                if not content:
                    await manager.send_personal(
                        websocket,
                        {"type": "error", "detail": "Message content is required"},
                    )
                    continue

                message_type = data.get("message_type", "text")
                if not isinstance(message_type, str):
                    message_type = "text"

                message = ChatMessage(
                    channel_id=channel_id,
                    sender_id=user.id,
                    content=content,
                    message_type=message_type.strip() or "text",
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                message = (
                    db.query(ChatMessage)
                    .options(joinedload(ChatMessage.sender))
                    .filter(ChatMessage.id == message.id)
                    .first()
                )

                if message is None:
                    continue

                message_payload = _build_message_response(message).model_dump(mode="json")
                await manager.broadcast_message(channel_id, message_payload)

            elif event_type == "typing":
                is_typing = data.get("is_typing", False)
                if not isinstance(is_typing, bool):
                    await manager.send_personal(
                        websocket,
                        {"type": "error", "detail": "is_typing must be a boolean"},
                    )
                    continue

                await manager.broadcast_typing(
                    channel_id,
                    user_data,
                    is_typing,
                    exclude_user_id=user.id,
                )

            elif event_type == "ping":
                await manager.send_personal(websocket, {"type": "pong"})

            else:
                await manager.send_personal(
                    websocket,
                    {"type": "error", "detail": f"Unknown event type: {event_type}"},
                )

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("WebSocket error for channel %s", channel_id)
    finally:
        if connected and user is not None:
            manager.disconnect(channel_id, user.id)

            if not manager.is_user_online_anywhere(user.id):
                user.last_seen_at = datetime.now(timezone.utc)
                db.add(user)
                db.commit()

            await manager.broadcast(
                channel_id,
                {
                    "type": "user_left",
                    "user": user_data,
                },
            )
            await manager.broadcast_presence(channel_id)
            await manager.broadcast_workspace_presence()

        db.close()
