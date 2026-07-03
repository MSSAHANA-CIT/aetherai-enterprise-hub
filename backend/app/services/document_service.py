import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile, status

from app.core.config import BACKEND_ROOT

UPLOAD_DIR = BACKEND_ROOT / "uploads" / "documents"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS: dict[str, str] = {
    ".pdf": "pdf",
    ".txt": "txt",
    ".md": "md",
    ".docx": "docx",
}

MIME_TYPE_MAP: dict[str, str] = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/markdown": "md",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


def ensure_upload_directory() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


def _resolve_file_type(filename: str, content_type: Optional[str]) -> str:
    extension = Path(filename).suffix.lower()
    if extension in ALLOWED_EXTENSIONS:
        return ALLOWED_EXTENSIONS[extension]

    if content_type and content_type in MIME_TYPE_MAP:
        return MIME_TYPE_MAP[content_type]

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported file type. Allowed types: pdf, txt, md, docx",
    )


def _sanitize_filename(filename: str) -> str:
    base = Path(filename).name
    cleaned = re.sub(r"[^\w.\- ]", "_", base).strip()
    return cleaned or "document"


def _title_from_filename(filename: str) -> str:
    stem = Path(filename).stem.replace("_", " ").replace("-", " ").strip()
    return stem or "Untitled Document"


async def save_uploaded_file(file: UploadFile) -> tuple[str, str, str, int]:
    """Save uploaded file and return (stored_name, file_path, file_type, file_size)."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    file_type = _resolve_file_type(file.filename, file.content_type)
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum size of 10 MB",
        )

    upload_dir = ensure_upload_directory()
    safe_name = _sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    destination = upload_dir / unique_name

    destination.write_bytes(content)

    return unique_name, str(destination), file_type, len(content)


def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text content from a saved document file."""
    path = Path(file_path)
    if not path.exists():
        return ""

    try:
        if file_type in {"txt", "md"}:
            return path.read_text(encoding="utf-8", errors="replace").strip()

        if file_type == "pdf":
            return _extract_pdf_text(path)

        if file_type == "docx":
            return _extract_docx_text(path)
    except Exception:
        return ""

    return ""


def _extract_pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""

    reader = PdfReader(str(path))
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages).strip()


def _extract_docx_text(path: Path) -> str:
    try:
        from docx import Document
    except ImportError:
        return ""

    document = Document(str(path))
    paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
    return "\n\n".join(paragraphs).strip()


def delete_document_file(file_path: str) -> None:
    path = Path(file_path)
    if path.exists() and path.is_file():
        path.unlink()
