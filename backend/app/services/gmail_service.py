import base64
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Tuple

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import Flow

from app.core.config import BACKEND_ROOT, settings

logger = logging.getLogger(__name__)

GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send"
GOOGLE_REFRESH_TOKEN_FILE = BACKEND_ROOT / ".google_refresh_token"


def _get_client_config() -> dict:
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


def create_oauth_flow() -> Flow:
    return Flow.from_client_config(
        _get_client_config(),
        scopes=[GMAIL_SEND_SCOPE],
        redirect_uri=settings.google_redirect_uri,
        autogenerate_code_verifier=False,
    )


def get_authorization_url() -> Tuple[str, str]:
    flow = create_oauth_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return authorization_url, state


def _log_oauth_error(exc: Exception, *, context: str) -> None:
    error_type = type(exc).__name__
    logger.error("Google OAuth %s failed — error type: %s", context, error_type)

    for attr in ("error", "description", "status_code"):
        value = getattr(exc, attr, None)
        if value:
            logger.error("Google OAuth %s — %s: %s", context, attr, value)

    logger.error(
        "Google OAuth %s — redirect_uri=%s client_id=%s",
        context,
        settings.google_redirect_uri,
        settings.google_client_id,
    )


def exchange_code_for_tokens(code: str) -> Credentials:
    flow = create_oauth_flow()
    try:
        flow.fetch_token(code=code)
    except Exception as exc:
        _log_oauth_error(exc, context="token exchange")
        raise

    return flow.credentials


def get_sender_email_from_credentials(credentials: Credentials) -> Optional[str]:
    try:
        service = build("gmail", "v1", credentials=credentials, cache_discovery=False)
        profile = service.users().getProfile(userId="me").execute()
        return profile.get("emailAddress")
    except Exception as exc:
        logger.warning(
            "Could not resolve Gmail sender email from profile — error type: %s",
            type(exc).__name__,
        )
        return settings.gmail_sender_email or None


def save_refresh_token_locally(refresh_token: str) -> None:
    GOOGLE_REFRESH_TOKEN_FILE.write_text(refresh_token, encoding="utf-8")
    logger.info("Google refresh token saved locally to %s", GOOGLE_REFRESH_TOKEN_FILE)


def _resolve_refresh_token() -> str:
    if settings.google_refresh_token:
        return settings.google_refresh_token
    if GOOGLE_REFRESH_TOKEN_FILE.exists():
        return GOOGLE_REFRESH_TOKEN_FILE.read_text(encoding="utf-8").strip()
    return ""


def get_gmail_credentials() -> Credentials:
    refresh_token = _resolve_refresh_token()
    if not refresh_token:
        raise RuntimeError(
            "GOOGLE_REFRESH_TOKEN is not configured. "
            "Visit /api/auth/google/connect to authorize Gmail sending."
        )

    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=[GMAIL_SEND_SCOPE],
    )

    if not credentials.valid:
        credentials.refresh(Request())

    return credentials


def send_email(*, to: str, subject: str, html_body: str, text_body: str) -> None:
    if not settings.gmail_sender_email:
        raise RuntimeError("GMAIL_SENDER_EMAIL is not configured.")

    credentials = get_gmail_credentials()
    service = build("gmail", "v1", credentials=credentials, cache_discovery=False)

    message = MIMEMultipart("alternative")
    message["To"] = to
    message["From"] = f"{settings.gmail_sender_name} <{settings.gmail_sender_email}>"
    message["Subject"] = subject
    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw_message}).execute()


def is_gmail_configured() -> bool:
    return bool(
        settings.google_client_id
        and settings.google_client_secret
        and settings.gmail_sender_email
        and _resolve_refresh_token()
    )


def refresh_token_present() -> bool:
    return bool(_resolve_refresh_token())
