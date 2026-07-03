from __future__ import annotations

import mimetypes
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile, status

from app.core.config import BACKEND_ROOT

UPLOAD_DIR = BACKEND_ROOT / "uploads" / "chat"
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".mpeg", ".mpg", ".3gp"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".opus", ".webm"}


def ensure_chat_upload_directory() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


def _sanitize_filename(filename: str) -> str:
    base = Path(filename).name
    cleaned = re.sub(r"[^\w.\- ]", "_", base).strip()
    return cleaned or "attachment"


def _guess_mime_type(filename: str, content_type: Optional[str]) -> str:
    if content_type and content_type != "application/octet-stream":
        return content_type.split(";")[0].strip().lower()

    guessed, _ = mimetypes.guess_type(filename)
    return guessed or "application/octet-stream"


def resolve_message_type(filename: str, mime_type: str) -> str:
    extension = Path(filename).suffix.lower()

    if mime_type.startswith("image/") or extension in IMAGE_EXTENSIONS:
        return "image"
    if mime_type.startswith("video/") or extension in VIDEO_EXTENSIONS:
        return "video"
    if mime_type.startswith("audio/") or extension in AUDIO_EXTENSIONS:
        return "audio"
    return "file"


def format_file_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    if size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    return f"{size / (1024 * 1024):.1f} MB"


async def save_chat_attachment(file: UploadFile) -> tuple[str, str, str, int, str]:
    """Save chat attachment and return (stored_name, file_path, mime_type, file_size, message_type)."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum size of 100 MB",
        )

    mime_type = _guess_mime_type(file.filename, file.content_type)
    message_type = resolve_message_type(file.filename, mime_type)

    upload_dir = ensure_chat_upload_directory()
    safe_name = _sanitize_filename(file.filename)
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    destination = upload_dir / stored_name
    destination.write_bytes(content)

    return stored_name, str(destination), mime_type, len(content), message_type


def get_attachment_path(stored_name: str) -> Path:
    if ".." in stored_name or "/" in stored_name or "\\" in stored_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attachment name")

    path = UPLOAD_DIR / stored_name
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    return path
