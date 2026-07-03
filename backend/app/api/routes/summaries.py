from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.auth import get_current_user
from app.database import get_db
from app.models.chat import ChatChannel, ChatMessage
from app.models.summary import MeetingSummary
from app.models.user import User
from app.schemas.summary import (
    ActionItemResponse,
    SummaryCreateResponse,
    SummaryDetailResponse,
    SummaryListResponse,
    SummaryResponse,
)
from app.services.ai_service import generate_meeting_summary_from_messages
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

router = APIRouter(prefix="/summaries", tags=["Summaries"])

MESSAGE_LIMIT = 100


def _format_messages_for_ai(messages: list[ChatMessage]) -> str:
    lines: list[str] = []
    for message in messages:
        sender_name = message.sender.full_name if message.sender else "Unknown"
        timestamp = message.created_at.isoformat() if isinstance(message.created_at, datetime) else str(message.created_at)
        lines.append(f"[{timestamp}] {sender_name}: {message.content}")
    return "\n".join(lines)


def _build_summary_response(summary: MeetingSummary) -> SummaryResponse:
    action_items = [
        ActionItemResponse(
            task=str(item.get("task", "")),
            owner=str(item.get("owner", "")),
            deadline=str(item.get("deadline", "")),
        )
        for item in (summary.action_items or [])
        if isinstance(item, dict) and str(item.get("task", "")).strip()
    ]

    decisions = [str(item).strip() for item in (summary.decisions or []) if str(item).strip()]

    return SummaryResponse(
        id=summary.id,
        channel_id=summary.channel_id,
        created_by=summary.created_by,
        title=summary.title,
        summary_text=summary.summary_text,
        decisions=decisions,
        action_items=action_items,
        created_at=summary.created_at,
        channel=summary.channel,
        creator=summary.creator,
    )


def _get_accessible_summary(summary_id: int, current_user: User, db: Session) -> MeetingSummary:
    summary = (
        db.query(MeetingSummary)
        .options(
            joinedload(MeetingSummary.channel),
            joinedload(MeetingSummary.creator),
        )
        .filter(MeetingSummary.id == summary_id)
        .first()
    )
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")

    creator = summary.creator
    if creator is None or creator.company_name != current_user.company_name:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return summary


@router.post("/channel/{channel_id}", response_model=SummaryCreateResponse, status_code=status.HTTP_201_CREATED)
def create_channel_summary(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SummaryCreateResponse:
    channel = db.query(ChatChannel).filter(ChatChannel.id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    messages = (
        db.query(ChatMessage)
        .options(joinedload(ChatMessage.sender))
        .filter(ChatMessage.channel_id == channel_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(MESSAGE_LIMIT)
        .all()
    )
    messages.reverse()

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No messages found in this channel to summarize",
        )

    messages_text = _format_messages_for_ai(messages)
    ai_result = generate_meeting_summary_from_messages(messages_text)

    summary = MeetingSummary(
        channel_id=channel_id,
        created_by=current_user.id,
        title=ai_result["title"],
        summary_text=ai_result["summary_text"],
        decisions=ai_result["decisions"],
        action_items=ai_result["action_items"],
    )
    db.add(summary)
    db.flush()

    log_action(
        db,
        actor_id=current_user.id,
        action="ai_summary_generated",
        entity_type="summary",
        entity_id=summary.id,
        metadata={"title": summary.title, "channel_id": channel_id, "summary_type": "meeting"},
    )
    create_notification(
        db,
        user_id=current_user.id,
        title="Meeting summary generated",
        message=f'AI summary "{summary.title}" is ready to review.',
        notification_type="ai",
    )
    db.commit()
    db.refresh(summary)

    summary = (
        db.query(MeetingSummary)
        .options(
            joinedload(MeetingSummary.channel),
            joinedload(MeetingSummary.creator),
        )
        .filter(MeetingSummary.id == summary.id)
        .first()
    )

    return SummaryCreateResponse(data=_build_summary_response(summary))


@router.get("", response_model=SummaryListResponse)
def list_summaries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SummaryListResponse:
    summaries = (
        db.query(MeetingSummary)
        .join(User, MeetingSummary.created_by == User.id)
        .options(
            joinedload(MeetingSummary.channel),
            joinedload(MeetingSummary.creator),
        )
        .filter(User.company_name == current_user.company_name)
        .order_by(MeetingSummary.created_at.desc())
        .all()
    )

    return SummaryListResponse(data=[_build_summary_response(summary) for summary in summaries])


@router.get("/{summary_id}", response_model=SummaryDetailResponse)
def get_summary(
    summary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SummaryDetailResponse:
    summary = _get_accessible_summary(summary_id, current_user, db)
    return SummaryDetailResponse(data=_build_summary_response(summary))
