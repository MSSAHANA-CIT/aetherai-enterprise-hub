from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User, resolve_department
from app.services.connection_manager import manager

router = APIRouter(prefix="/presence", tags=["Presence"])


def _format_last_seen(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None

    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    delta = now - dt
    seconds = int(delta.total_seconds())

    if seconds < 60:
        return "Just now"
    if seconds < 3600:
        minutes = seconds // 60
        return f"{minutes}m ago"
    if seconds < 86400:
        hours = seconds // 3600
        return f"{hours}h ago"
    days = seconds // 86400
    return f"{days}d ago"


@router.get("")
def get_presence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _build_presence_payload(current_user, db)


@router.get("/users")
def get_presence_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _build_presence_payload(current_user, db)


@router.get("/channel/{channel_id}")
def get_channel_presence(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    del current_user

    channel_users = manager.online_users.get(channel_id, {})
    online_user_ids = set(channel_users.keys())

    all_users = (
        db.query(User)
        .filter(User.is_active.is_(True))
        .order_by(User.full_name)
        .all()
    )

    presence_list = []
    for user in all_users:
        is_online = user.id in online_user_ids
        last_seen_dt = None if is_online else (manager.get_last_seen(user.id) or user.last_seen_at)
        presence_list.append(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "company_name": user.company_name,
                "department": resolve_department(user),
                "is_online": is_online,
                "active_channel_id": channel_id if is_online else None,
                "active_channel": f"channel-{channel_id}" if is_online else None,
                "last_seen": None if is_online else _format_last_seen(last_seen_dt),
            }
        )

    online_count = sum(1 for entry in presence_list if entry["is_online"])

    return {
        "status": "success",
        "message": "Channel presence retrieved",
        "data": {
            "channel_id": channel_id,
            "online_count": online_count,
            "total_users": len(presence_list),
            "users": presence_list,
        },
    }


def _build_presence_payload(current_user: User, db: Session):
    del current_user

    online_user_ids = manager.get_workspace_online_ids()
    channel_map: dict[int, int] = {}

    for channel_id, users in manager.online_users.items():
        for user_id in users:
            channel_map[user_id] = channel_id

    all_users = (
        db.query(User)
        .filter(User.is_active.is_(True))
        .order_by(User.full_name)
        .all()
    )

    presence_list = []
    for user in all_users:
        is_online = user.id in online_user_ids
        last_seen_dt = None if is_online else (manager.get_last_seen(user.id) or user.last_seen_at)
        presence_list.append(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "company_name": user.company_name,
                "department": resolve_department(user),
                "is_online": is_online,
                "active_channel_id": channel_map.get(user.id),
                "active_channel": (
                    f"channel-{channel_map[user.id]}" if user.id in channel_map else None
                ),
                "last_seen": None if is_online else _format_last_seen(last_seen_dt),
            }
        )

    online_count = sum(1 for entry in presence_list if entry["is_online"])

    return {
        "status": "success",
        "message": "Presence retrieved",
        "data": {
            "online_count": online_count,
            "total_users": len(presence_list),
            "users": presence_list,
        },
    }
