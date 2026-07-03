import re
from pathlib import Path
from typing import Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.meeting import MeetingRecording
from app.services.meeting_ai_service import generate_meeting_intelligence

ALLOWED_EXTENSIONS = {".mp3", ".mp4", ".wav", ".m4a", ".mov", ".webm"}
UPLOAD_DIR = Path("uploads/meetings")


def ensure_upload_dir() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


def validate_meeting_file(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}")
    return ext


def save_meeting_file(*, file_bytes: bytes, filename: str) -> tuple[str, str, int]:
    ext = validate_meeting_file(filename)
    upload_dir = ensure_upload_dir()
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", Path(filename).name)
    timestamp = int(__import__("time").time())
    stored_name = f"{timestamp}_{safe_name}"
    file_path = upload_dir / stored_name
    file_path.write_bytes(file_bytes)
    return str(file_path), ext.lstrip("."), len(file_bytes)


def transcribe_audio_file(file_path: str) -> tuple[Optional[str], Optional[str], str]:
    if not settings.openai_api_key:
        return (
            None,
            None,
            "Transcription requires an OpenAI API key. Upload saved — configure OPENAI_API_KEY to enable Whisper transcription.",
        )

    client = OpenAI(api_key=settings.openai_api_key)
    try:
        with open(file_path, "rb") as audio_file:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
            )
        transcript = getattr(result, "text", None) or str(result)
        language = getattr(result, "language", None)
        return transcript, language, "completed"
    except Exception as exc:
        return None, None, f"Transcription failed: {type(exc).__name__}"


def transcribe_meeting_recording(db: Session, meeting: MeetingRecording) -> MeetingRecording:
    """Transcribe audio only — does not regenerate summary intelligence."""
    meeting.status = "processing"
    db.commit()

    transcript, language, status_note = transcribe_audio_file(meeting.file_path)
    meeting.detected_language = language
    meeting.transcript = transcript

    if transcript:
        meeting.status = "transcribed"
    else:
        meeting.summary_text = meeting.summary_text or status_note
        meeting.status = "pending_transcription"

    db.commit()
    db.refresh(meeting)
    return meeting


def summarize_meeting_recording(db: Session, meeting: MeetingRecording) -> MeetingRecording:
    """Generate summary, decisions, and action items from existing transcript."""
    transcript = meeting.transcript or ""
    if not transcript.strip():
        meeting.summary_text = "No transcript available. Run transcription first."
        meeting.status = "pending_transcription"
        db.commit()
        db.refresh(meeting)
        return meeting

    meeting.status = "processing"
    db.commit()

    intelligence = generate_meeting_intelligence(transcript)
    meeting.summary_text = intelligence["summary_text"]
    meeting.decisions = intelligence["decisions"]
    meeting.action_items = intelligence["action_items"]
    meeting.status = "completed"

    db.commit()
    db.refresh(meeting)
    return meeting


def process_meeting_recording(db: Session, meeting: MeetingRecording) -> MeetingRecording:
    meeting.status = "processing"
    db.commit()

    transcript, language, status_note = transcribe_audio_file(meeting.file_path)
    meeting.detected_language = language
    meeting.transcript = transcript

    if transcript:
        intelligence = generate_meeting_intelligence(transcript)
        meeting.summary_text = intelligence["summary_text"]
        meeting.decisions = intelligence["decisions"]
        meeting.action_items = intelligence["action_items"]
        meeting.status = "completed"
    else:
        meeting.summary_text = status_note
        meeting.status = "pending_transcription"

    db.commit()
    db.refresh(meeting)
    return meeting


def answer_meeting_question(*, transcript: str, summary: str, question: str) -> str:
    from app.services.meeting_ai_service import answer_meeting_question as _answer

    return _answer(transcript=transcript, summary=summary, question=question)
