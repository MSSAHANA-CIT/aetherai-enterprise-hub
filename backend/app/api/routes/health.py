from fastapi import APIRouter, Depends
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import engine, get_db
from app.schemas.otp import AuthHealthResponse, GmailHealthResponse
from app.services.gmail_service import (
    client_id_present,
    client_secret_present,
    is_gmail_configured,
    refresh_token_present,
    sender_email_present,
)

router = APIRouter()

_DEV_JWT_SECRET = "aetherai-dev-secret-change-in-production"


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    database_status = "connected"

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        database_status = "disconnected"

    return {
        "status": "success",
        "message": "AetherAI Enterprise Hub API is healthy",
        "database": database_status,
        "api_version": settings.app_version,
    }


@router.get("/health/auth", response_model=AuthHealthResponse)
async def auth_health_check() -> AuthHealthResponse:
    table_names: set[str] = set()
    try:
        table_names = set(inspect(engine).get_table_names())
    except Exception:
        table_names = set()

    jwt_configured = bool(
        settings.jwt_secret_key.strip()
        and (
            settings.environment.lower() != "production"
            or settings.jwt_secret_key != _DEV_JWT_SECRET
        )
    )

    return AuthHealthResponse(
        users_table_ready="users" in table_names,
        login_otps_table_ready="login_otps" in table_names,
        gmail_configured=is_gmail_configured(),
        jwt_secret_configured=jwt_configured,
    )


@router.get("/health/email", response_model=GmailHealthResponse)
async def email_health_check() -> GmailHealthResponse:
    return GmailHealthResponse(
        gmail_configured=is_gmail_configured(),
        client_id_present=client_id_present(),
        client_secret_present=client_secret_present(),
        refresh_token_present=refresh_token_present(),
        sender_email_present=sender_email_present(),
    )
