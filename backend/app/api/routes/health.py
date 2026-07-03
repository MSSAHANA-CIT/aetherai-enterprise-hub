from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.schemas.otp import GmailHealthResponse
from app.services.gmail_service import is_gmail_configured, refresh_token_present

router = APIRouter()


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


@router.get("/health/email", response_model=GmailHealthResponse)
async def email_health_check() -> GmailHealthResponse:
    if not settings.debug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return GmailHealthResponse(
        gmail_configured=is_gmail_configured(),
        sender_email=settings.gmail_sender_email or "",
        refresh_token_present=refresh_token_present(),
    )
