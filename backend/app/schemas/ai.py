from typing import Literal, Optional

from pydantic import BaseModel, Field

AIMode = Literal[
    "general",
    "meeting_summary",
    "email_writer",
    "task_planner",
    "error_explainer",
    "policy_helper",
    "document_summary",
    "video_meeting_summary",
    "manager_briefing",
    "message_rewrite",
    "chat_summary",
]


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    mode: AIMode = "general"


class AIChatResponse(BaseModel):
    response: str
    mode: AIMode
    suggestions: Optional[list[str]] = None


class AIChatEnvelope(BaseModel):
    status: str
    message: str
    data: AIChatResponse
