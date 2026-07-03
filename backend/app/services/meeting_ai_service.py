"""AI intelligence for meeting recordings: summaries, decisions, action items, and Q&A."""

from __future__ import annotations

import json
from typing import Any, Optional

from openai import OpenAI

from app.core.config import settings
from app.services.ai_service import generate_meeting_summary_from_messages
from app.services.prompt_service import BASE_PERSONALITY, get_system_prompt

OPENAI_UNAVAILABLE = (
    "AI features require an OpenAI API key. Configure OPENAI_API_KEY in the backend environment "
    "to enable transcription, summaries, and meeting Q&A."
)


def _build_client() -> Optional[OpenAI]:
    if not settings.openai_api_key or not settings.openai_api_key.strip():
        return None
    return OpenAI(api_key=settings.openai_api_key)


def generate_meeting_intelligence(transcript: str) -> dict[str, Any]:
    """Produce summary, decisions, and action items from a meeting transcript."""
    if not transcript.strip():
        return {
            "summary_text": "No transcript available to summarize.",
            "decisions": "[]",
            "action_items": "[]",
        }

    try:
        summary_data = generate_meeting_summary_from_messages(transcript)
        if isinstance(summary_data, dict):
            return {
                "summary_text": summary_data.get("summary_text", summary_data.get("summary", "")),
                "decisions": json.dumps(summary_data.get("decisions", [])),
                "action_items": json.dumps(summary_data.get("action_items", [])),
            }
    except Exception:
        pass

    preview = transcript[:2000] + ("..." if len(transcript) > 2000 else "")
    return {
        "summary_text": preview or "Transcript received but summary could not be generated.",
        "decisions": "[]",
        "action_items": "[]",
    }


def answer_meeting_question(*, transcript: str, summary: str, question: str) -> str:
    """Answer a question about a meeting using transcript and summary context."""
    if not question.strip():
        return "Please enter a question about the meeting."

    if not transcript.strip() and not summary.strip():
        return "No transcript or summary is available for this meeting yet. Upload and transcribe a recording first."

    client = _build_client()
    if client is None:
        return OPENAI_UNAVAILABLE

    context_parts: list[str] = []
    if summary.strip():
        context_parts.append(f"Meeting Summary:\n{summary.strip()}")
    if transcript.strip():
        context_parts.append(f"Transcript excerpt:\n{transcript[:6000]}")
    context = "\n\n".join(context_parts)

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"{get_system_prompt('video_meeting_summary')}\n"
                        "Answer questions about this meeting using only the provided context. "
                        "If the answer is not in the context, say so clearly."
                    ),
                },
                {"role": "user", "content": f"{context}\n\nQuestion: {question.strip()}"},
            ],
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content or "No answer generated."
    except Exception:
        return "Unable to generate an answer right now. Please try again in a moment."


def summarize_transcript_only(transcript: str) -> str:
    """Generate a narrative summary without re-extracting structured fields."""
    if not transcript.strip():
        return "No transcript available to summarize."

    client = _build_client()
    if client is None:
        return OPENAI_UNAVAILABLE

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": get_system_prompt("video_meeting_summary")},
                {
                    "role": "user",
                    "content": (
                        "Summarize this meeting transcript for a busy professional. "
                        "Include key discussion points, decisions, and action items when present.\n\n"
                        f"{transcript[:12000]}"
                    ),
                },
            ],
            temperature=0.4,
            max_tokens=1200,
        )
        return response.choices[0].message.content or "Summary could not be generated."
    except Exception:
        return "Unable to generate a summary right now. Please try again in a moment."
