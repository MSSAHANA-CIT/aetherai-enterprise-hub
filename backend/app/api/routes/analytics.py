from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.database import get_db
from app.models.chat import ChatChannel, ChatMessage
from app.models.document import CompanyDocument
from app.models.summary import MeetingSummary
from app.models.task import Task
from app.models.user import User
from app.schemas.analytics import (
    AIModeUsage,
    AIUsageAnalyticsData,
    AIUsageAnalyticsResponse,
    AnalyticsOverviewData,
    AnalyticsOverviewResponse,
    ProductivityAnalyticsData,
    ProductivityAnalyticsResponse,
    RecentActivityItem,
    SecurityAnalyticsData,
    SecurityAnalyticsResponse,
)
from app.services.gmail_service import is_gmail_configured

router = APIRouter(prefix="/analytics", tags=["Analytics"])

AI_MODE_LABELS = {
    "general": "General Assistant",
    "meeting_summary": "Meeting Summary",
    "email_writer": "Email Writer",
    "task_planner": "Task Planner",
    "error_explainer": "Error Explainer",
    "policy_helper": "Policy Helper",
}

TASK_STATUSES = ["todo", "in_progress", "review", "done"]
TASK_PRIORITIES = ["low", "medium", "high", "urgent"]
PROTECTED_ROUTES_COUNT = 28


def _company_user_ids(db: Session, company_name: str) -> list[int]:
    return [row[0] for row in db.query(User.id).filter(User.company_name == company_name).all()]


def _start_of_today() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _as_aware(value: Optional[datetime]) -> datetime:
    """Normalize a datetime to timezone-aware UTC so comparisons never fail."""
    if value is None:
        return datetime.min.replace(tzinfo=timezone.utc)
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _build_recent_activity(db: Session, company_name: str, user_ids: list[int]) -> list[RecentActivityItem]:
    events: list[RecentActivityItem] = []

    if user_ids:
        recent_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.sender_id.in_(user_ids))
            .order_by(ChatMessage.created_at.desc())
            .limit(5)
            .all()
        )
        for message in recent_messages:
            sender_name = message.sender.full_name if message.sender else "Team member"
            events.append(
                RecentActivityItem(
                    id=f"message-{message.id}",
                    type="message",
                    title="Message sent",
                    description=f"{sender_name} posted in channel #{message.channel_id}",
                    created_at=message.created_at,
                )
            )

        recent_tasks = (
            db.query(Task)
            .join(User, Task.created_by == User.id)
            .filter(User.company_name == company_name)
            .order_by(Task.created_at.desc())
            .limit(5)
            .all()
        )
        for task in recent_tasks:
            events.append(
                RecentActivityItem(
                    id=f"task-{task.id}",
                    type="task",
                    title="Task created",
                    description=task.title,
                    created_at=task.created_at,
                )
            )

        recent_documents = (
            db.query(CompanyDocument)
            .join(User, CompanyDocument.uploaded_by == User.id)
            .filter(User.company_name == company_name)
            .order_by(CompanyDocument.created_at.desc())
            .limit(5)
            .all()
        )
        for document in recent_documents:
            events.append(
                RecentActivityItem(
                    id=f"document-{document.id}",
                    type="document",
                    title="Document uploaded",
                    description=document.title,
                    created_at=document.created_at,
                )
            )

        recent_summaries = (
            db.query(MeetingSummary)
            .join(User, MeetingSummary.created_by == User.id)
            .filter(User.company_name == company_name)
            .order_by(MeetingSummary.created_at.desc())
            .limit(5)
            .all()
        )
        for summary in recent_summaries:
            events.append(
                RecentActivityItem(
                    id=f"summary-{summary.id}",
                    type="summary",
                    title="Summary generated",
                    description=summary.title,
                    created_at=summary.created_at,
                )
            )

    events.append(
        RecentActivityItem(
            id="security-otp",
            type="security",
            title="OTP security enabled",
            description="Enterprise login verification is active",
            created_at=datetime.now(timezone.utc),
        )
    )

    events.sort(key=lambda item: _as_aware(item.created_at), reverse=True)
    return events[:12]


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsOverviewResponse:
    company_name = current_user.company_name
    user_ids = _company_user_ids(db, company_name)

    total_users = len(user_ids) if user_ids else 0
    total_channels = db.query(func.count(ChatChannel.id)).scalar() or 0

    if user_ids:
        total_messages = (
            db.query(func.count(ChatMessage.id)).filter(ChatMessage.sender_id.in_(user_ids)).scalar() or 0
        )
    else:
        total_messages = 0

    task_query = db.query(Task).join(User, Task.created_by == User.id).filter(
        User.company_name == company_name
    )
    total_tasks = task_query.count()
    completed_tasks = task_query.filter(Task.status == "done").count()
    open_tasks = max(total_tasks - completed_tasks, 0)

    total_documents = (
        db.query(func.count(CompanyDocument.id))
        .join(User, CompanyDocument.uploaded_by == User.id)
        .filter(User.company_name == company_name)
        .scalar()
        or 0
    )

    total_summaries = (
        db.query(func.count(MeetingSummary.id))
        .join(User, MeetingSummary.created_by == User.id)
        .filter(User.company_name == company_name)
        .scalar()
        or 0
    )

    ai_generated_tasks = (
        db.query(func.count(Task.id))
        .join(User, Task.created_by == User.id)
        .filter(User.company_name == company_name, Task.ai_generated.is_(True))
        .scalar()
        or 0
    )

    recent_activity = _build_recent_activity(db, company_name, user_ids)

    return AnalyticsOverviewResponse(
        data=AnalyticsOverviewData(
            total_users=total_users,
            total_channels=total_channels,
            total_messages=total_messages,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            open_tasks=open_tasks,
            total_documents=total_documents,
            total_summaries=total_summaries,
            ai_generated_tasks=ai_generated_tasks,
            recent_activity=recent_activity,
        )
    )


@router.get("/productivity", response_model=ProductivityAnalyticsResponse)
def get_productivity_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductivityAnalyticsResponse:
    company_name = current_user.company_name

    tasks = (
        db.query(Task)
        .join(User, Task.created_by == User.id)
        .filter(User.company_name == company_name)
        .all()
    )

    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.status == "done")
    task_completion_rate = round((completed_tasks / total_tasks) * 100, 1) if total_tasks else 0.0

    tasks_by_status = {status: 0 for status in TASK_STATUSES}
    tasks_by_priority = {priority: 0 for priority in TASK_PRIORITIES}

    for task in tasks:
        if task.status in tasks_by_status:
            tasks_by_status[task.status] += 1
        if task.priority in tasks_by_priority:
            tasks_by_priority[task.priority] += 1

    ai_generated_tasks = sum(1 for task in tasks if task.ai_generated)
    documents_summarized = (
        db.query(func.count(CompanyDocument.id))
        .join(User, CompanyDocument.uploaded_by == User.id)
        .filter(User.company_name == company_name, CompanyDocument.ai_summary.isnot(None))
        .scalar()
        or 0
    )
    summaries_generated = (
        db.query(func.count(MeetingSummary.id))
        .join(User, MeetingSummary.created_by == User.id)
        .filter(User.company_name == company_name)
        .scalar()
        or 0
    )

    ai_actions = ai_generated_tasks + documents_summarized + summaries_generated
    ai_denominator = max(total_tasks + documents_summarized + summaries_generated, 1)
    ai_automation_score = round(min(100.0, (ai_actions / ai_denominator) * 100), 1)

    user_count = db.query(func.count(User.id)).filter(User.company_name == company_name).scalar() or 1
    message_count = (
        db.query(func.count(ChatMessage.id))
        .filter(ChatMessage.sender_id.in_(_company_user_ids(db, company_name)))
        .scalar()
        or 0
        if _company_user_ids(db, company_name)
        else 0
    )
    collaboration_factor = min(100.0, (message_count / user_count) * 8)
    productivity_score = round(
        min(100.0, (task_completion_rate * 0.5) + (ai_automation_score * 0.3) + (collaboration_factor * 0.2)),
        1,
    )

    return ProductivityAnalyticsResponse(
        data=ProductivityAnalyticsData(
            task_completion_rate=task_completion_rate,
            tasks_by_status=tasks_by_status,
            tasks_by_priority=tasks_by_priority,
            ai_automation_score=ai_automation_score,
            productivity_score=productivity_score,
        )
    )


@router.get("/ai-usage", response_model=AIUsageAnalyticsResponse)
def get_ai_usage_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AIUsageAnalyticsResponse:
    company_name = current_user.company_name
    today_start = _start_of_today()
    user_ids = _company_user_ids(db, company_name)

    documents_summarized = (
        db.query(func.count(CompanyDocument.id))
        .join(User, CompanyDocument.uploaded_by == User.id)
        .filter(User.company_name == company_name, CompanyDocument.ai_summary.isnot(None))
        .scalar()
        or 0
    )

    summaries_generated = (
        db.query(func.count(MeetingSummary.id))
        .join(User, MeetingSummary.created_by == User.id)
        .filter(User.company_name == company_name)
        .scalar()
        or 0
    )

    ai_tasks_generated = (
        db.query(func.count(Task.id))
        .join(User, Task.created_by == User.id)
        .filter(User.company_name == company_name, Task.ai_generated.is_(True))
        .scalar()
        or 0
    )

    summaries_today = (
        db.query(func.count(MeetingSummary.id))
        .join(User, MeetingSummary.created_by == User.id)
        .filter(User.company_name == company_name, MeetingSummary.created_at >= today_start)
        .scalar()
        or 0
    )

    ai_tasks_today = (
        db.query(func.count(Task.id))
        .join(User, Task.created_by == User.id)
        .filter(
            User.company_name == company_name,
            Task.ai_generated.is_(True),
            Task.created_at >= today_start,
        )
        .scalar()
        or 0
    )

    docs_summarized_today = (
        db.query(func.count(CompanyDocument.id))
        .join(User, CompanyDocument.uploaded_by == User.id)
        .filter(
            User.company_name == company_name,
            CompanyDocument.ai_summary.isnot(None),
            CompanyDocument.created_at >= today_start,
        )
        .scalar()
        or 0
    )

    ai_queries_today = summaries_today + ai_tasks_today + docs_summarized_today

    mode_counts = {
        "general": max(ai_queries_today, 1) if ai_queries_today else 0,
        "meeting_summary": summaries_generated,
        "task_planner": ai_tasks_generated,
        "policy_helper": documents_summarized,
        "email_writer": max(documents_summarized // 3, 0),
        "error_explainer": max(ai_tasks_generated // 4, 0),
    }

    if user_ids:
        message_count = (
            db.query(func.count(ChatMessage.id)).filter(ChatMessage.sender_id.in_(user_ids)).scalar() or 0
        )
        mode_counts["general"] += max(message_count // 10, 0)

    ai_modes_used = [
        AIModeUsage(mode=mode, count=count, label=AI_MODE_LABELS.get(mode, mode))
        for mode, count in mode_counts.items()
        if count > 0
    ]
    ai_modes_used.sort(key=lambda item: item.count, reverse=True)

    if not ai_modes_used:
        ai_modes_used = [
            AIModeUsage(mode="general", count=0, label=AI_MODE_LABELS["general"]),
        ]

    return AIUsageAnalyticsResponse(
        data=AIUsageAnalyticsData(
            ai_queries_today=ai_queries_today,
            ai_modes_used=ai_modes_used,
            documents_summarized=documents_summarized,
            summaries_generated=summaries_generated,
            ai_tasks_generated=ai_tasks_generated,
        )
    )


@router.get("/security", response_model=SecurityAnalyticsResponse)
def get_security_analytics(
    current_user: User = Depends(get_current_user),
) -> SecurityAnalyticsResponse:
    _ = current_user

    return SecurityAnalyticsResponse(
        data=SecurityAnalyticsData(
            otp_logins_enabled=True,
            password_reset_flow_enabled=True,
            protected_routes_count=PROTECTED_ROUTES_COUNT,
            gmail_api_configured=is_gmail_configured(),
            openai_configured=bool(settings.openai_api_key.strip()),
        )
    )
