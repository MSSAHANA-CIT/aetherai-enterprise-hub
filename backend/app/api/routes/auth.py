import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import ROLE_ADMIN_REQUEST, ROLE_EMPLOYEE, ROLE_MANAGER, User
from app.schemas.auth import (
    GoogleOAuthCallbackResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.otp import (
    ChangePasswordRequest,
    MessageResponse,
    OtpEmailRequest,
    OtpRequiredData,
    OtpRequiredResponse,
    ResetPasswordRequest,
    VerifyLoginOtpRequest,
    VerifySignupOtpRequest,
)
from app.services.gmail_service import (
    exchange_code_for_tokens,
    get_authorization_url,
    get_sender_email_from_credentials,
    save_refresh_token_locally,
)
from app.services.otp_service import (
    OTP_PURPOSE_LOGIN,
    OTP_PURPOSE_PASSWORD_RESET,
    OTP_PURPOSE_SIGNUP,
    create_and_send_otp,
    verify_otp,
)
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

from app.api.deps import (
    get_current_admin_user,
    get_current_super_admin_user,
    get_current_user,
    oauth2_scheme,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)

FORGOT_PASSWORD_MESSAGE = (
    "If an account exists, password reset instructions have been sent."
)
RESEND_OTP_MESSAGE = "If an account exists, a verification code has been sent."


def _map_signup_role(role: str) -> str:
    if role == "manager":
        return ROLE_MANAGER
    if role == "admin_request":
        return ROLE_ADMIN_REQUEST
    return ROLE_EMPLOYEE


def _client_ip(request: Request) -> Optional[str]:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def _build_token_response(user: User) -> TokenResponse:
    access_token = create_access_token(user.email)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


def _ensure_gmail_oauth_configured() -> None:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )


def _send_otp_or_raise(db: Session, *, user: User, purpose: str) -> None:
    try:
        create_and_send_otp(db, user_id=user.id, email=user.email, purpose=purpose)
    except Exception as exc:
        logger.exception("Failed to send OTP email for purpose=%s", purpose)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to send verification code. Check Gmail API configuration.",
        ) from exc


@router.get("/google/connect")
def google_connect() -> RedirectResponse:
    _ensure_gmail_oauth_configured()
    authorization_url, _state = get_authorization_url()
    return RedirectResponse(url=authorization_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/google/callback", response_model=GoogleOAuthCallbackResponse)
def google_callback(code: Optional[str] = None, error: Optional[str] = None) -> GoogleOAuthCallbackResponse:
    _ensure_gmail_oauth_configured()

    if error:
        logger.error("Google OAuth authorization denied — error type: access_denied detail: %s", error)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth authorization failed: {error}",
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing authorization code from Google.",
        )

    try:
        credentials = exchange_code_for_tokens(code)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to exchange authorization code for tokens: {type(exc).__name__}",
        ) from exc

    refresh_token = credentials.refresh_token
    if not refresh_token:
        return GoogleOAuthCallbackResponse(
            status="error",
            message=(
                "OAuth succeeded but refresh token was not returned. "
                "Revoke app access and reconnect with prompt=consent."
            ),
        )

    save_refresh_token_locally(refresh_token)
    sender_email = get_sender_email_from_credentials(credentials)

    return GoogleOAuthCallbackResponse(
        status="success",
        message="Google OAuth connected successfully",
        refresh_token=refresh_token,
        sender_email=sender_email,
    )


@router.post("/register", response_model=OtpRequiredResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> OtpRequiredResponse:
    if payload.role == "super_admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super admin accounts cannot be self-created.",
        )

    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        company_name=payload.company_name.strip(),
        hashed_password=hash_password(payload.password),
        role=_map_signup_role(payload.role),
        is_active=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_SIGNUP)

    return OtpRequiredResponse(
        message="Verification code sent to your work email. Please verify to activate your account.",
        data=OtpRequiredData(
            email=user.email,
            expires_in_minutes=settings.otp_expire_minutes,
            purpose="signup",
        ),
    )


@router.post("/verify-signup-otp", response_model=TokenResponse)
def verify_signup_otp(
    payload: VerifySignupOtpRequest, request: Request, db: Session = Depends(get_db)
) -> TokenResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or verification code",
        )

    if not verify_otp(db, email=email, otp_code=payload.otp, purpose=OTP_PURPOSE_SIGNUP):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )

    user.is_active = True

    welcome_message = "Your account has been verified and is now active."
    if user.role == ROLE_ADMIN_REQUEST:
        welcome_message = (
            "Your account is active. Admin access was requested and is pending super admin approval."
        )

    log_action(
        db,
        actor_id=user.id,
        action="signup_otp_verified",
        entity_type="user",
        entity_id=user.id,
        metadata={"email": user.email, "role": user.role},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=user.id,
        title="Welcome to AetherAI",
        message=welcome_message,
        notification_type="system",
    )
    db.commit()
    db.refresh(user)

    return _build_token_response(user)


@router.post("/resend-signup-otp", response_model=MessageResponse)
def resend_signup_otp(payload: OtpEmailRequest, db: Session = Depends(get_db)) -> MessageResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is not None and not user.is_active:
        _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_SIGNUP)

    return MessageResponse(message=RESEND_OTP_MESSAGE)


@router.post("/login", response_model=OtpRequiredResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> OtpRequiredResponse:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_SIGNUP)
        return OtpRequiredResponse(
            message="Account pending verification. A new code has been sent to your email.",
            data=OtpRequiredData(
                email=user.email,
                expires_in_minutes=settings.otp_expire_minutes,
                purpose="signup",
            ),
        )

    _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_LOGIN)

    log_action(
        db,
        actor_id=user.id,
        action="login_otp_sent",
        entity_type="user",
        entity_id=user.id,
        metadata={"email": user.email},
        ip_address=_client_ip(request),
    )
    db.commit()

    return OtpRequiredResponse(
        message="Verification code sent to your work email.",
        data=OtpRequiredData(
            email=user.email,
            expires_in_minutes=settings.otp_expire_minutes,
            purpose="login",
        ),
    )


@router.post("/verify-login-otp", response_model=TokenResponse)
def verify_login_otp(
    payload: VerifyLoginOtpRequest, request: Request, db: Session = Depends(get_db)
) -> TokenResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or verification code",
        )

    if not verify_otp(db, email=email, otp_code=payload.otp, purpose=OTP_PURPOSE_LOGIN):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )

    log_action(
        db,
        actor_id=user.id,
        action="login_otp_verified",
        entity_type="user",
        entity_id=user.id,
        metadata={"email": user.email},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=user.id,
        title="Login successful",
        message="Your account was accessed after OTP verification.",
        notification_type="security",
    )
    db.commit()

    return _build_token_response(user)


@router.post("/resend-login-otp", response_model=MessageResponse)
def resend_login_otp(payload: OtpEmailRequest, db: Session = Depends(get_db)) -> MessageResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is not None and user.is_active:
        _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_LOGIN)

    return MessageResponse(message=RESEND_OTP_MESSAGE)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: OtpEmailRequest, db: Session = Depends(get_db)) -> MessageResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is not None and user.is_active:
        _send_otp_or_raise(db, user=user, purpose=OTP_PURPOSE_PASSWORD_RESET)

    return MessageResponse(message=FORGOT_PASSWORD_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)) -> MessageResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or verification code",
        )

    if not verify_otp(db, email=email, otp_code=payload.otp, purpose=OTP_PURPOSE_PASSWORD_RESET):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    user.hashed_password = hash_password(payload.new_password)

    log_action(
        db,
        actor_id=user.id,
        action="password_reset",
        entity_type="user",
        entity_id=user.id,
        metadata={"email": user.email},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=user.id,
        title="Password reset",
        message="Your password was reset successfully.",
        notification_type="security",
    )
    db.commit()

    return MessageResponse(message="Password reset successful. You can now sign in with your new password.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(payload.new_password)

    log_action(
        db,
        actor_id=current_user.id,
        action="password_changed",
        entity_type="user",
        entity_id=current_user.id,
        metadata={"email": current_user.email},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=current_user.id,
        title="Password changed",
        message="Your account password was updated successfully.",
        notification_type="security",
    )
    db.commit()

    return MessageResponse(message="Password changed successfully.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
