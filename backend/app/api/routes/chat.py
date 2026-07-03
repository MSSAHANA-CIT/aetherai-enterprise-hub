from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.routes.auth import get_current_user
from app.database import get_db
from app.models.chat import ChatChannel, ChatMessage, DmParticipant, MessageReaction
from app.models.user import User
from app.schemas.chat import (
    ChannelCreate,
    ChannelResponse,
    MessageAttachmentResponse,
    MessageCreate,
    MessageResponse,
    ReactionCreate,
    ReactionGroupResponse,
    ReactionResponse,
    SenderResponse,
)
from app.services.chat_attachment_service import get_attachment_path, save_chat_attachment
from app.services.connection_manager import manager

router = APIRouter(prefix="/chat", tags=["Chat"])

DEFAULT_CHANNELS = [
    {
        "name": "general",
        "description": "Company-wide announcements and team updates",
        "channel_type": "team",
    },
    {
        "name": "engineering",
        "description": "Technical discussions, code reviews, and deployments",
        "channel_type": "team",
    },
    {
        "name": "product",
        "description": "Product roadmap, features, and user feedback",
        "channel_type": "team",
    },
    {
        "name": "support",
        "description": "Customer support coordination and escalations",
        "channel_type": "team",
    },
    {
        "name": "leadership",
        "description": "Executive updates and strategic planning",
        "channel_type": "team",
    },
    {
        "name": "announcements",
        "description": "Company-wide announcements and important updates",
        "channel_type": "team",
    },
    {
        "name": "incidents",
        "description": "Incident response, outages, and on-call coordination",
        "channel_type": "team",
    },
]

SAMPLE_MESSAGES = [
    "Welcome to AetherAI Enterprise Hub! This is your team workspace for collaboration.",
    "Reminder: Q3 planning sync is scheduled for Friday at 10 AM.",
    "The new deployment pipeline is live. Please review the engineering checklist.",
    "AI assistant summaries are now available for all standup meetings.",
]

CHANNEL_UNREAD_COUNTS = {
    "general": 0,
    "engineering": 2,
    "product": 1,
    "support": 0,
    "leadership": 0,
    "announcements": 0,
    "incidents": 0,
}


def _ensure_default_channels(db: Session) -> list[ChatChannel]:
    existing = {
        channel.name: channel
        for channel in db.query(ChatChannel).filter(ChatChannel.channel_type == "team").all()
    }
    created: list[ChatChannel] = []
    for data in DEFAULT_CHANNELS:
        if data["name"] not in existing:
            channel = ChatChannel(**data)
            db.add(channel)
            created.append(channel)
    if created:
        db.commit()
        for channel in created:
            db.refresh(channel)
    return list(existing.values()) + created


def _format_last_activity(timestamp: Optional[datetime]) -> Optional[str]:
    if timestamp is None:
        return None

    now = datetime.now(timezone.utc)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)

    delta = now - timestamp
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


def _dm_channel_name(user_a: int, user_b: int) -> str:
    low, high = sorted([user_a, user_b])
    return f"dm-{low}-{high}"


def _find_dm_channel(db: Session, user_a: int, user_b: int) -> Optional[ChatChannel]:
    channels_for_a = (
        select(DmParticipant.channel_id).where(DmParticipant.user_id == user_a).scalar_subquery()
    )
    channels_for_b = (
        select(DmParticipant.channel_id).where(DmParticipant.user_id == user_b).scalar_subquery()
    )

    return (
        db.query(ChatChannel)
        .filter(
            ChatChannel.channel_type == "dm",
            ChatChannel.id.in_(channels_for_a),
            ChatChannel.id.in_(channels_for_b),
        )
        .first()
    )


def _get_or_create_dm(db: Session, user_a: int, user_b: int) -> ChatChannel:
    existing = _find_dm_channel(db, user_a, user_b)
    if existing:
        return existing

    channel = ChatChannel(
        name=_dm_channel_name(user_a, user_b),
        description="Direct message",
        channel_type="dm",
    )
    db.add(channel)
    db.flush()

    for user_id in (user_a, user_b):
        db.add(DmParticipant(channel_id=channel.id, user_id=user_id))

    db.commit()
    db.refresh(channel)
    return channel


def _get_dm_peer(db: Session, channel: ChatChannel, current_user_id: int) -> Optional[User]:
    participant = (
        db.query(DmParticipant)
        .options(joinedload(DmParticipant.user))
        .filter(
            DmParticipant.channel_id == channel.id,
            DmParticipant.user_id != current_user_id,
        )
        .first()
    )
    return participant.user if participant else None


def _assert_channel_access(db: Session, user: User, channel: ChatChannel) -> None:
    if channel.channel_type != "dm":
        return

    participant = (
        db.query(DmParticipant)
        .filter(
            DmParticipant.channel_id == channel.id,
            DmParticipant.user_id == user.id,
        )
        .first()
    )
    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this conversation",
        )


def _seed_channels(db: Session) -> list[ChatChannel]:
    channels: list[ChatChannel] = []
    for data in DEFAULT_CHANNELS:
        channel = ChatChannel(**data)
        db.add(channel)
        channels.append(channel)
    db.commit()
    for channel in channels:
        db.refresh(channel)
    return channels


def _seed_general_messages(db: Session, channel: ChatChannel) -> None:
    users = db.query(User).order_by(User.id).limit(4).all()
    if not users:
        return

    for index, content in enumerate(SAMPLE_MESSAGES):
        sender = users[index % len(users)]
        message = ChatMessage(
            channel_id=channel.id,
            sender_id=sender.id,
            content=content,
            message_type="text",
        )
        db.add(message)
    db.commit()


def _build_channel_response(
    channel: ChatChannel,
    db: Session,
    current_user_id: Optional[int] = None,
) -> ChannelResponse:
    latest_message = (
        db.query(ChatMessage)
        .filter(ChatMessage.channel_id == channel.id)
        .order_by(ChatMessage.created_at.desc())
        .first()
    )

    last_activity = _format_last_activity(latest_message.created_at if latest_message else channel.created_at)
    unread_count = 0 if channel.channel_type == "dm" else CHANNEL_UNREAD_COUNTS.get(channel.name, 0)

    peer = None
    if channel.channel_type == "dm" and current_user_id is not None:
        peer_user = _get_dm_peer(db, channel, current_user_id)
        if peer_user:
            peer = SenderResponse.model_validate(peer_user)

    preview = None
    if latest_message:
        preview = _message_preview(latest_message)

    return ChannelResponse(
        id=channel.id,
        name=channel.name,
        description=channel.description,
        channel_type=channel.channel_type,
        created_at=channel.created_at,
        last_activity=last_activity,
        unread_count=unread_count,
        peer=peer,
        last_message_preview=preview,
    )


def _message_preview(message: ChatMessage) -> str:
    if message.message_type == "image":
        label = "📷 Photo"
    elif message.message_type == "video":
        label = "🎬 Video"
    elif message.message_type == "audio":
        label = "🎵 Audio"
    elif message.message_type == "file":
        label = f"📎 {message.attachment_file_name or 'File'}"
    else:
        label = message.content

    if message.message_type != "text" and message.content.strip():
        caption = message.content.strip()
        if len(caption) <= 60:
            return f"{label} — {caption}"
        return f"{label} — {caption[:57]}..."

    if len(label) <= 80:
        return label
    return f"{label[:77]}..."


def _build_reaction_groups(message: ChatMessage, current_user_id: Optional[int] = None) -> list[ReactionGroupResponse]:
    grouped: dict[str, list[tuple[int, int]]] = {}
    for reaction in message.reactions:
        grouped.setdefault(reaction.emoji, []).append((reaction.user_id, reaction.id))

    result = []
    for emoji, entries in sorted(grouped.items()):
        user_ids = [user_id for user_id, _ in entries]
        my_reaction_id = None
        if current_user_id:
            for user_id, reaction_id in entries:
                if user_id == current_user_id:
                    my_reaction_id = reaction_id
                    break
        result.append(
            ReactionGroupResponse(
                emoji=emoji,
                count=len(user_ids),
                user_ids=user_ids,
                reacted_by_me=current_user_id in user_ids if current_user_id else False,
                my_reaction_id=my_reaction_id,
            )
        )
    return result


def _reply_count(db: Session, message_id: int) -> int:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.parent_message_id == message_id)
        .count()
    )


def _build_message_response(
    message: ChatMessage,
    db: Optional[Session] = None,
    current_user_id: Optional[int] = None,
) -> MessageResponse:
    attachment = None
    if message.attachment_stored_name and message.attachment_file_name:
        attachment = MessageAttachmentResponse(
            file_name=message.attachment_file_name,
            mime_type=message.attachment_mime_type or "application/octet-stream",
            file_size=message.attachment_size or 0,
            url=f"/api/chat/attachments/{message.id}/file",
        )

    reply_count = len(message.replies) if message.replies else (db and _reply_count(db, message.id)) or 0

    return MessageResponse(
        id=message.id,
        content=message.content,
        message_type=message.message_type,
        created_at=message.created_at,
        sender=SenderResponse.model_validate(message.sender),
        attachment=attachment,
        parent_message_id=message.parent_message_id,
        is_pinned=bool(message.is_pinned),
        reply_count=reply_count,
        reactions=_build_reaction_groups(message, current_user_id),
    )


async def _broadcast_chat_message(
    channel_id: int,
    message: ChatMessage,
    db: Session,
    current_user_id: Optional[int] = None,
) -> None:
    await manager.broadcast_message(
        channel_id,
        _build_message_response(message, db, current_user_id).model_dump(mode="json"),
    )


@router.get("/channels", response_model=list[ChannelResponse])
def list_channels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ChannelResponse]:
    del current_user

    channels = (
        db.query(ChatChannel)
        .filter(ChatChannel.channel_type == "team")
        .order_by(ChatChannel.name)
        .all()
    )
    if not channels:
        channels = _seed_channels(db)
    else:
        channels = _ensure_default_channels(db)
        channels = (
            db.query(ChatChannel)
            .filter(ChatChannel.channel_type == "team")
            .order_by(ChatChannel.name)
            .all()
        )

    return [_build_channel_response(channel, db) for channel in channels]


@router.get("/dms", response_model=list[ChannelResponse])
def list_dm_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ChannelResponse]:
    participant_channel_ids = [
        row[0]
        for row in db.query(DmParticipant.channel_id)
        .filter(DmParticipant.user_id == current_user.id)
        .all()
    ]

    if not participant_channel_ids:
        return []

    channels = (
        db.query(ChatChannel)
        .filter(ChatChannel.id.in_(participant_channel_ids), ChatChannel.channel_type == "dm")
        .all()
    )

    channels.sort(
        key=lambda ch: (
            db.query(ChatMessage.created_at)
            .filter(ChatMessage.channel_id == ch.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
            .scalar()
            or ch.created_at
        ),
        reverse=True,
    )

    return [_build_channel_response(channel, db, current_user.id) for channel in channels]


@router.post("/dms/{user_id}", response_model=ChannelResponse, status_code=status.HTTP_200_OK)
def start_dm_conversation(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChannelResponse:
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot start a direct message with yourself",
        )

    other_user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if other_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    channel = _get_or_create_dm(db, current_user.id, user_id)
    return _build_channel_response(channel, db, current_user.id)


@router.post("/channels", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
def create_channel(
    payload: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChannelResponse:
    del current_user

    name = payload.name.strip().lower()
    existing = db.query(ChatChannel).filter(func.lower(ChatChannel.name) == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Channel name already exists",
        )

    channel = ChatChannel(
        name=name,
        description=payload.description.strip(),
        channel_type=payload.channel_type.strip() or "team",
    )
    db.add(channel)
    db.commit()
    db.refresh(channel)

    return _build_channel_response(channel, db)


@router.get("/channels/{channel_id}/messages", response_model=list[MessageResponse])
def list_messages(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageResponse]:
    channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    messages = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(
            ChatMessage.channel_id == channel_id,
            ChatMessage.parent_message_id.is_(None),
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    if not messages and channel.name == "general":
        _seed_general_messages(db, channel)
        messages = (
            db.query(ChatMessage)
            .options(
                joinedload(ChatMessage.sender),
                joinedload(ChatMessage.reactions),
                joinedload(ChatMessage.replies),
            )
            .filter(
                ChatMessage.channel_id == channel_id,
                ChatMessage.parent_message_id.is_(None),
            )
            .order_by(ChatMessage.created_at.asc())
            .all()
        )

    return [_build_message_response(message, db, current_user.id) for message in messages]


@router.post(
    "/channels/{channel_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_message(
    channel_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content is required")

    parent_message_id = payload.parent_message_id
    if parent_message_id is not None:
        parent = (
            db.query(ChatMessage)
            .filter(ChatMessage.id == parent_message_id, ChatMessage.channel_id == channel_id)
            .first()
        )
        if parent is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent message not found")

    message = ChatMessage(
        channel_id=channel_id,
        sender_id=current_user.id,
        content=content,
        message_type=payload.message_type.strip() or "text",
        parent_message_id=parent_message_id,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    message = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(ChatMessage.id == message.id)
        .first()
    )

    return _build_message_response(message, db, current_user.id)


@router.post(
    "/channels/{channel_id}/attachments",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_chat_attachment(
    channel_id: int,
    file: UploadFile = File(...),
    caption: str = Form(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    stored_name, _file_path, mime_type, file_size, message_type = await save_chat_attachment(file)
    display_content = caption.strip() or file.filename or "Shared a file"

    message = ChatMessage(
        channel_id=channel_id,
        sender_id=current_user.id,
        content=display_content,
        message_type=message_type,
        attachment_file_name=file.filename,
        attachment_stored_name=stored_name,
        attachment_mime_type=mime_type,
        attachment_size=file_size,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    message = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(ChatMessage.id == message.id)
        .first()
    )

    if message is not None:
        await _broadcast_chat_message(channel_id, message, db, current_user.id)

    return _build_message_response(message, db, current_user.id)


@router.get("/messages/{message_id}/replies", response_model=list[MessageResponse])
def list_message_replies(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageResponse]:
    parent = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if parent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    channel = db.query(ChatChannel).filter(ChatChannel.id == parent.channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    replies = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(ChatMessage.parent_message_id == message_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return [_build_message_response(reply, db, current_user.id) for reply in replies]


@router.get("/channels/{channel_id}/pinned", response_model=list[MessageResponse])
def list_pinned_messages(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageResponse]:
    channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    pinned = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(ChatMessage.channel_id == channel_id, ChatMessage.is_pinned.is_(True))
        .order_by(ChatMessage.created_at.desc())
        .all()
    )

    return [_build_message_response(message, db, current_user.id) for message in pinned]


@router.put("/messages/{message_id}/pin", response_model=MessageResponse)
def toggle_pin_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    channel = db.query(ChatChannel).filter(ChatChannel.id == message.channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    message.is_pinned = not message.is_pinned
    db.commit()
    db.refresh(message)

    message = (
        db.query(ChatMessage)
        .options(
            joinedload(ChatMessage.sender),
            joinedload(ChatMessage.reactions),
            joinedload(ChatMessage.replies),
        )
        .filter(ChatMessage.id == message.id)
        .first()
    )

    return _build_message_response(message, db, current_user.id)


@router.post(
    "/messages/{message_id}/reactions",
    response_model=ReactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_message_reaction(
    message_id: int,
    payload: ReactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReactionResponse:
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    channel = db.query(ChatChannel).filter(ChatChannel.id == message.channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    emoji = payload.emoji.strip()
    existing = (
        db.query(MessageReaction)
        .filter(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == current_user.id,
            MessageReaction.emoji == emoji,
        )
        .first()
    )
    if existing:
        return ReactionResponse.model_validate(existing)

    reaction = MessageReaction(message_id=message_id, user_id=current_user.id, emoji=emoji)
    db.add(reaction)
    db.commit()
    db.refresh(reaction)

    return ReactionResponse.model_validate(reaction)


@router.delete("/messages/{message_id}/reactions/{reaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_message_reaction(
    message_id: int,
    reaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    reaction = (
        db.query(MessageReaction)
        .filter(
            MessageReaction.id == reaction_id,
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == current_user.id,
        )
        .first()
    )
    if reaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reaction not found")

    db.delete(reaction)
    db.commit()


@router.get("/attachments/{message_id}/file")
def download_chat_attachment(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    message = (
        db.query(ChatMessage)
        .options(joinedload(ChatMessage.sender))
        .filter(ChatMessage.id == message_id)
        .first()
    )
    if message is None or not message.attachment_stored_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    channel = db.query(ChatChannel).filter(ChatChannel.id == message.channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    _assert_channel_access(db, current_user, channel)

    file_path = get_attachment_path(message.attachment_stored_name)
    return FileResponse(
        path=str(file_path),
        media_type=message.attachment_mime_type or "application/octet-stream",
        filename=message.attachment_file_name or "download",
    )
