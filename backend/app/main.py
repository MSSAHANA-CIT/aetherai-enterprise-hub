import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.routes import ai, analytics, audit_logs, auth, chat, documents, exports, health, meetings, notifications, presence, summaries, tasks, users, websocket_chat, websocket_presence
from app.core.config import get_database_type, settings
from app.database import Base, engine

logger = logging.getLogger(__name__)
from app.models import AuditLog, CompanyDocument, DmParticipant, LoginOTP, MeetingRecording, MeetingSummary, MessageReaction, Notification, OtpToken, Task  # noqa: F401 — register model metadata


def _run_schema_migrations() -> None:
    """Lightweight migrations for SQLite when Alembic is not used."""
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = {col["name"] for col in inspector.get_columns("users")}
        is_postgres = str(engine.url).startswith("postgresql")
        user_migrations: dict[str, tuple[str, str]] = {
            "full_name": ("VARCHAR(255) NOT NULL DEFAULT ''", "VARCHAR(255) NOT NULL DEFAULT ''"),
            "company_name": ("VARCHAR(255) NOT NULL DEFAULT ''", "VARCHAR(255) NOT NULL DEFAULT ''"),
            "hashed_password": ("VARCHAR(255) NOT NULL DEFAULT ''", "VARCHAR(255) NOT NULL DEFAULT ''"),
            "role": ("VARCHAR(50) NOT NULL DEFAULT 'employee'", "VARCHAR(50) NOT NULL DEFAULT 'employee'"),
            "is_active": ("BOOLEAN NOT NULL DEFAULT 1", "BOOLEAN NOT NULL DEFAULT TRUE"),
            "admin_requested": ("BOOLEAN NOT NULL DEFAULT 0", "BOOLEAN NOT NULL DEFAULT FALSE"),
            "last_seen_at": ("DATETIME", "TIMESTAMP WITH TIME ZONE"),
            "department": ("VARCHAR(255)", "VARCHAR(255)"),
        }
        for column_name, (sqlite_type, pg_type) in user_migrations.items():
            if column_name not in columns:
                column_type = pg_type if is_postgres else sqlite_type
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
                logger.info("Added missing users.%s column", column_name)

    if "meeting_recordings" in inspector.get_table_names():
        meeting_columns = {col["name"] for col in inspector.get_columns("meeting_recordings")}
        meeting_migrations = {
            "scheduled_at": "DATETIME",
            "room": "VARCHAR(255)",
            "participants": "TEXT",
        }
        for column_name, column_type in meeting_migrations.items():
            if column_name not in meeting_columns:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE meeting_recordings ADD COLUMN {column_name} {column_type}"))

    if "chat_messages" in inspector.get_table_names():
        message_columns = {col["name"] for col in inspector.get_columns("chat_messages")}
        migrations = {
            "attachment_file_name": "VARCHAR(255)",
            "attachment_stored_name": "VARCHAR(255)",
            "attachment_mime_type": "VARCHAR(127)",
            "attachment_size": "INTEGER",
            "parent_message_id": "INTEGER",
            "is_pinned": "BOOLEAN DEFAULT 0",
        }
        for column_name, column_type in migrations.items():
            if column_name not in message_columns:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE chat_messages ADD COLUMN {column_name} {column_type}"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)
    logger.info("Environment: %s", settings.environment)
    logger.info("Database type: %s", get_database_type(settings.database_url))
    Base.metadata.create_all(bind=engine)
    _run_schema_migrations()
    Path("uploads/meetings").mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered enterprise collaboration platform API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(ai.router, prefix="/api", tags=["AI"])
app.include_router(summaries.router, prefix="/api", tags=["Summaries"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(audit_logs.router, prefix="/api", tags=["Audit Logs"])
app.include_router(meetings.router, prefix="/api", tags=["Meetings"])
app.include_router(exports.router, prefix="/api", tags=["Exports"])
app.include_router(presence.router, prefix="/api", tags=["Presence"])
app.include_router(websocket_chat.router, tags=["WebSocket"])
app.include_router(websocket_presence.router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.app_name}",
        "data": {
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/health",
            "auth": "/api/auth",
            "chat": "/api/chat",
            "ai": "/api/ai",
            "summaries": "/api/summaries",
            "documents": "/api/documents",
            "tasks": "/api/tasks",
            "analytics": "/api/analytics",
            "users": "/api/users",
            "notifications": "/api/notifications",
            "audit_logs": "/api/audit-logs",
            "meetings": "/api/meetings",
            "exports": "/api/exports",
            "presence": "/api/presence",
            "websocket": "/ws/chat/{channel_id}",
        },
    }
