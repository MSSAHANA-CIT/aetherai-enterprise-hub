from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    """Application configuration."""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    app_name: str = "AetherAI Enterprise Hub"
    app_version: str = "0.8.6"
    debug: bool = True

    database_url: str = "sqlite:///./aetherai.db"

    jwt_secret_key: str = Field(
        default="aetherai-dev-secret-change-in-production",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET_KEY"),
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_hours: int = 24

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    google_refresh_token: str = ""
    gmail_sender_email: str = ""
    gmail_sender_name: str = "AetherAI Security"
    otp_expire_minutes: int = Field(
        default=10,
        validation_alias=AliasChoices("OTP_EXPIRE_MINUTES", "OTP_EXPIRY_MINUTES"),
    )
    frontend_url: str = "http://localhost:5173"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ]


settings = Settings()
