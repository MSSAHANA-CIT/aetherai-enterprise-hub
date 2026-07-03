import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.otp import (
    OTP_PURPOSE_LOGIN,
    OTP_PURPOSE_PASSWORD_RESET,
    OTP_PURPOSE_SIGNUP,
    LoginOTP,
)
from app.services.email_template_service import (
    build_login_otp_email,
    build_password_reset_otp_email,
    build_signup_otp_email,
)
from app.services.gmail_service import send_email, ensure_gmail_configured

__all__ = [
    "OTP_PURPOSE_LOGIN",
    "OTP_PURPOSE_PASSWORD_RESET",
    "OTP_PURPOSE_SIGNUP",
    "generate_otp_code",
    "invalidate_existing_otps",
    "create_and_send_otp",
    "verify_otp",
]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def invalidate_existing_otps(db: Session, *, email: str, purpose: str) -> None:
    (
        db.query(LoginOTP)
        .filter(
            LoginOTP.email == email,
            LoginOTP.purpose == purpose,
            LoginOTP.is_used.is_(False),
            LoginOTP.expires_at > _utcnow(),
        )
        .update({LoginOTP.is_used: True}, synchronize_session=False)
    )


def create_and_send_otp(db: Session, *, user_id: int, email: str, purpose: str) -> None:
    normalized_email = email.lower()
    otp_code = generate_otp_code()
    expires_at = _utcnow() + timedelta(minutes=settings.otp_expire_minutes)

    invalidate_existing_otps(db, email=normalized_email, purpose=purpose)

    login_otp = LoginOTP(
        user_id=user_id,
        email=normalized_email,
        otp_code_hash=hash_password(otp_code),
        purpose=purpose,
        is_used=False,
        expires_at=expires_at,
    )
    db.add(login_otp)
    db.commit()

    if purpose == OTP_PURPOSE_LOGIN:
        subject, html_body, text_body = build_login_otp_email(otp_code=otp_code)
    elif purpose == OTP_PURPOSE_SIGNUP:
        subject, html_body, text_body = build_signup_otp_email(otp_code=otp_code)
    else:
        subject, html_body, text_body = build_password_reset_otp_email(otp_code=otp_code)

    ensure_gmail_configured()
    send_email(to=normalized_email, subject=subject, html_body=html_body, text_body=text_body)


def verify_otp(db: Session, *, email: str, otp_code: str, purpose: str) -> bool:
    normalized_email = email.lower()
    now = _utcnow()

    login_otp = (
        db.query(LoginOTP)
        .filter(
            LoginOTP.email == normalized_email,
            LoginOTP.purpose == purpose,
            LoginOTP.is_used.is_(False),
            LoginOTP.expires_at > now,
        )
        .order_by(LoginOTP.created_at.desc())
        .first()
    )

    if login_otp is None or not verify_password(otp_code, login_otp.otp_code_hash):
        return False

    login_otp.is_used = True
    db.commit()
    return True
