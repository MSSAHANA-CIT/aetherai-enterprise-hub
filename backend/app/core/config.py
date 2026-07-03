import os
from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"
SQLITE_DEFAULT_URL = "sqlite:///./aetherai.db"


def get_database_type(database_url: str) -> str:
    """Return the database backend name without exposing connection details."""
    if database_url.startswith("sqlite"):
        return "sqlite"
    if database_url.startswith("postgresql"):
        return "postgresql"
    if database_url.startswith("mysql"):
        return "mysql"
    return "unknown"


def get_database_host_type(database_url: str) -> str:
    """Classify the database host without exposing connection details."""
    if not database_url:
        return "missing"
    if "railway.internal" in database_url:
        return "railway-private"
    if "railway.app" in database_url or "proxy.rlwy.net" in database_url:
        return "railway-public"
    if database_url.startswith("sqlite"):
        return "sqlite"
    if database_url.startswith("postgresql"):
        return "postgresql"
    return "unknown"


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

    environment: str = Field(
        default="development",
        validation_alias=AliasChoices("ENVIRONMENT", "environment"),
    )
    database_url: str = Field(
        default="",
        validation_alias=AliasChoices("DATABASE_URL", "database_url"),
    )

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
    frontend_url: str = Field(
        default="http://localhost:5173",
        validation_alias=AliasChoices("FRONTEND_URL", "frontend_url"),
    )

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

    @model_validator(mode="after")
    def resolve_cors_origins(self) -> "Settings":
        """Allow local dev, FRONTEND_URL, and optional CORS_ORIGINS (comma-separated)."""
        origins: set[str] = {origin.rstrip("/") for origin in self.cors_origins if origin.strip()}

        if self.frontend_url.strip():
            origins.add(self.frontend_url.strip().rstrip("/"))

        cors_env = os.getenv("CORS_ORIGINS", "").strip()
        if cors_env:
            for origin in cors_env.split(","):
                cleaned = origin.strip().rstrip("/")
                if cleaned:
                    origins.add(cleaned)

        self.cors_origins = sorted(origins)
        return self

    @model_validator(mode="after")
    def resolve_database_url(self) -> "Settings":
        raw_url = os.getenv("DATABASE_URL") or os.getenv("database_url") or ""
        raw_url = raw_url.strip()

        if raw_url and raw_url.startswith("postgres://"):
            raw_url = raw_url.replace("postgres://", "postgresql://", 1)

        if not raw_url:
            if self.environment.lower() == "production":
                raise RuntimeError(
                    "DATABASE_URL is missing. Add DATABASE_URL in Railway backend variables."
                )
            raw_url = SQLITE_DEFAULT_URL

        self.database_url = raw_url
        return self


settings = Settings()
