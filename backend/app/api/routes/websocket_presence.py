import json
import logging
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.api.routes.websocket_chat import _get_user_from_token, _reject_websocket, _user_info
from app.database import SessionLocal
from app.services.connection_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/presence")
async def websocket_presence_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
) -> None:
    db: Session = SessionLocal()
    user_id: Optional[int] = None

    try:
        user = _get_user_from_token(db, token)
        if user is None:
            await _reject_websocket(websocket)
            return

        user_id = user.id
        user_data = _user_info(user)
        await manager.connect_presence(websocket, user_id, user_data)

        await websocket.send_json(
            {
                "type": "workspace_presence",
                "online_users": manager.get_workspace_online_users(),
                "online_count": len(manager.workspace_online),
            }
        )
        await manager.broadcast_workspace_presence()

        while True:
            raw = await websocket.receive_text()
            if raw.strip().lower() in {"ping", '{"type":"ping"}'}:
                await websocket.send_json({"type": "pong"})
                continue
            try:
                payload = json.loads(raw)
                if payload.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.warning("Presence websocket error: %s", exc)
    finally:
        if user_id is not None:
            manager.disconnect_presence(user_id)
            await manager.broadcast_workspace_presence()
        db.close()
