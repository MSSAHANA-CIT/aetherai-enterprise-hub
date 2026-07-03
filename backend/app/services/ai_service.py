import json
import re
from typing import Any, Optional

from openai import OpenAI

from app.core.config import settings
from app.schemas.ai import AIMode
from app.services.prompt_service import get_mode_suggestions, get_system_prompt

FALLBACK_RESPONSE = (
    "AI assistance is currently unavailable because the OpenAI API key is not configured. "
    "Please ask your administrator to set OPENAI_API_KEY in the backend environment. "
    "Once configured, I can help with summaries, emails, task planning, error explanations, and policy questions."
)

MEETING_SUMMARY_JSON_PROMPT = (
    "You are an enterprise meeting summarization assistant. "
    "Analyze the conversation or transcript and return ONLY valid JSON with this exact structure:\n"
    "{\n"
    '  "title": "Short descriptive title for the discussion",\n'
    '  "summary_text": "Professional narrative summary in export-ready Markdown",\n'
    '  "decisions": ["Decision 1", "Decision 2"],\n'
    '  "action_items": [\n'
    '    {"task": "Action description", "owner": "Person name or Unassigned", "deadline": "Date or TBD"}\n'
    "  ]\n"
    "}\n"
    "Extract decisions and action items only when explicitly mentioned. Include owners and deadlines when stated. "
    "Use empty arrays when none are found. Do not invent facts. "
    "Do not include markdown fences or any text outside the JSON object."
)

DEFAULT_SUMMARY_RESULT: dict[str, Any] = {
    "title": "Team Discussion Summary",
    "summary_text": "",
    "decisions": [],
    "action_items": [],
}


def _build_client() -> Optional[OpenAI]:
    if not settings.openai_api_key or not settings.openai_api_key.strip():
        return None
    return OpenAI(api_key=settings.openai_api_key)


def generate_ai_response(message: str, mode: AIMode) -> tuple[str, list[str]]:
    """Generate an AI response for the given message and mode."""
    suggestions = get_mode_suggestions(mode)

    client = _build_client()
    if client is None:
        return FALLBACK_RESPONSE, suggestions

    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": get_system_prompt(mode)},
                {"role": "user", "content": message},
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        content = completion.choices[0].message.content
        response_text = content.strip() if content else "I couldn't generate a response. Please try again."
        return response_text, suggestions
    except Exception:
        return (
            "I encountered an issue while generating a response. "
            "Please try again in a moment or contact your administrator if the problem persists.",
            suggestions,
        )


def _extract_json_object(text: str) -> Optional[dict[str, Any]]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None

    return None


def _normalize_action_items(raw_items: Any) -> list[dict[str, str]]:
    if not isinstance(raw_items, list):
        return []

    normalized: list[dict[str, str]] = []
    for item in raw_items:
        if isinstance(item, str) and item.strip():
            normalized.append({"task": item.strip(), "owner": "", "deadline": ""})
            continue

        if not isinstance(item, dict):
            continue

        task = str(item.get("task") or item.get("description") or "").strip()
        if not task:
            continue

        normalized.append(
            {
                "task": task,
                "owner": str(item.get("owner") or item.get("assignee") or "").strip(),
                "deadline": str(item.get("deadline") or item.get("due_date") or "").strip(),
            }
        )

    return normalized


def _normalize_summary_result(raw: dict[str, Any], fallback_text: str = "") -> dict[str, Any]:
    title = str(raw.get("title") or DEFAULT_SUMMARY_RESULT["title"]).strip()
    summary_text = str(raw.get("summary_text") or raw.get("summary") or fallback_text).strip()

    decisions_raw = raw.get("decisions") or []
    decisions: list[str] = []
    if isinstance(decisions_raw, list):
        decisions = [str(item).strip() for item in decisions_raw if str(item).strip()]

    action_items = _normalize_action_items(raw.get("action_items"))

    return {
        "title": title or DEFAULT_SUMMARY_RESULT["title"],
        "summary_text": summary_text,
        "decisions": decisions,
        "action_items": action_items,
    }


def _build_fallback_summary(messages_text: str) -> dict[str, Any]:
    preview = messages_text.strip()
    if len(preview) > 500:
        preview = f"{preview[:500]}..."

    return {
        "title": "Team Discussion Summary",
        "summary_text": (
            "AI summarization is currently unavailable because the OpenAI API key is not configured. "
            "Below is a preview of the channel messages that would have been summarized.\n\n"
            f"{preview}"
        ),
        "decisions": [],
        "action_items": [],
    }


def generate_meeting_summary_from_messages(messages_text: str) -> dict[str, Any]:
    """Generate a structured meeting summary from formatted channel messages."""
    if not messages_text.strip():
        return {
            **DEFAULT_SUMMARY_RESULT,
            "summary_text": "No messages were available to summarize in this channel.",
        }

    client = _build_client()
    if client is None:
        return _build_fallback_summary(messages_text)

    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": MEETING_SUMMARY_JSON_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Summarize the following meeting content (chat or transcript):\n\n"
                        f"{messages_text}"
                    ),
                },
            ],
            temperature=0.4,
            max_tokens=2000,
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty AI response")

        parsed = _extract_json_object(content.strip())
        if parsed is None:
            return {
                "title": "Team Discussion Summary",
                "summary_text": content.strip(),
                "decisions": [],
                "action_items": [],
            }

        return _normalize_summary_result(parsed, fallback_text=content.strip())
    except Exception:
        return {
            "title": "Team Discussion Summary",
            "summary_text": (
                "I encountered an issue while generating the summary. "
                "Please try again in a moment."
            ),
            "decisions": [],
            "action_items": [],
        }


DOCUMENT_SUMMARY_PROMPT = (
    "You are an enterprise document summarization assistant. "
    "Summarize the provided company document clearly and professionally. "
    "Include: overview, key points, important details, and any action items or policies mentioned. "
    "Use concise paragraphs and bullet points where appropriate."
)

DOCUMENT_QA_PROMPT = (
    "You are an enterprise knowledge assistant. "
    "Answer questions using ONLY the provided document context. "
    "If the answer is not in the document, say so clearly and suggest what related information is available. "
    "Be professional, concise, and accurate."
)


def summarize_document_text(extracted_text: str, title: str = "Document") -> str:
    """Generate an AI summary for extracted document text."""
    if not extracted_text.strip():
        return (
            "No extractable text was found in this document. "
            "The file may be empty, image-only, or in an unsupported format."
        )

    client = _build_client()
    if client is None:
        preview = extracted_text.strip()
        if len(preview) > 600:
            preview = f"{preview[:600]}..."
        return (
            "AI summarization is currently unavailable because the OpenAI API key is not configured. "
            "Below is a preview of the extracted document text.\n\n"
            f"{preview}"
        )

    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": DOCUMENT_SUMMARY_PROMPT},
                {
                    "role": "user",
                    "content": f"Document title: {title}\n\nDocument content:\n{extracted_text}",
                },
            ],
            temperature=0.4,
            max_tokens=1500,
        )
        content = completion.choices[0].message.content
        return content.strip() if content else "Unable to generate a summary. Please try again."
    except Exception:
        return (
            "I encountered an issue while generating the summary. "
            "Please try again in a moment."
        )


def answer_document_question(extracted_text: str, title: str, question: str) -> str:
    """Answer a question about a document using extracted text as context."""
    if not question.strip():
        return "Please provide a question about the document."

    if not extracted_text.strip():
        return (
            "This document has no extractable text, so I cannot answer questions about its content. "
            "Try uploading a text-based PDF, TXT, MD, or DOCX file."
        )

    client = _build_client()
    if client is None:
        return (
            "AI Q&A is currently unavailable because the OpenAI API key is not configured. "
            "Please ask your administrator to set OPENAI_API_KEY in the backend environment."
        )

    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": DOCUMENT_QA_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Document title: {title}\n\n"
                        f"Document content:\n{extracted_text}\n\n"
                        f"Question: {question}"
                    ),
                },
            ],
            temperature=0.3,
            max_tokens=1200,
        )
        content = completion.choices[0].message.content
        return content.strip() if content else "I couldn't generate an answer. Please try again."
    except Exception:
        return (
            "I encountered an issue while answering your question. "
            "Please try again in a moment."
        )


TASK_PLANNER_JSON_PROMPT = (
    "You are an enterprise task planning assistant. "
    "Convert the user's project goal into a structured task plan. "
    "Return ONLY valid JSON as an array of task objects with this exact structure:\n"
    "[\n"
    "  {\n"
    '    "title": "Short actionable task title",\n'
    '    "description": "Clear description of what needs to be done",\n'
    '    "priority": "low|medium|high|urgent",\n'
    '    "status": "todo",\n'
    '    "suggested_due_date": "YYYY-MM-DD"\n'
    "  }\n"
    "]\n"
    "Create 5-8 practical tasks with varied priorities. "
    "Spread suggested_due_date values before the project deadline when provided. "
    "Do not include markdown fences or any text outside the JSON array."
)

VALID_PRIORITIES = {"low", "medium", "high", "urgent"}
VALID_STATUSES = {"todo", "in_progress", "review", "done"}


def _extract_json_array(text: str) -> Optional[list[Any]]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        return None

    return None


def _normalize_generated_tasks(raw_items: Any, deadline: Optional[Any] = None) -> list[dict[str, str]]:
    if not isinstance(raw_items, list):
        return []

    normalized: list[dict[str, str]] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue

        title = str(item.get("title") or "").strip()
        if not title:
            continue

        description = str(item.get("description") or "").strip()
        priority = str(item.get("priority") or "medium").strip().lower()
        if priority not in VALID_PRIORITIES:
            priority = "medium"

        status_value = str(item.get("status") or "todo").strip().lower()
        if status_value not in VALID_STATUSES:
            status_value = "todo"

        suggested_due_date = str(item.get("suggested_due_date") or item.get("due_date") or "").strip()
        if not suggested_due_date and deadline is not None:
            suggested_due_date = str(deadline)

        normalized.append(
            {
                "title": title,
                "description": description,
                "priority": priority,
                "status": status_value,
                "suggested_due_date": suggested_due_date,
            }
        )

    return normalized


def _build_fallback_tasks(goal: str, deadline: Optional[Any] = None) -> list[dict[str, str]]:
    deadline_str = str(deadline) if deadline is not None else ""
    goal_preview = goal.strip()[:80] or "your project"

    return [
        {
            "title": "Define project scope and success criteria",
            "description": (
                f"Document objectives, stakeholders, and measurable outcomes for: {goal_preview}. "
                "Align the team on scope before execution."
            ),
            "priority": "high",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
        {
            "title": "Create technical architecture and implementation plan",
            "description": (
                "Outline system components, integrations, data flows, and delivery milestones. "
                "Identify risks and dependencies early."
            ),
            "priority": "high",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
        {
            "title": "Build core feature MVP",
            "description": (
                "Implement the primary user workflows required to deliver initial value. "
                "Focus on reliability and clear UX."
            ),
            "priority": "urgent",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
        {
            "title": "Set up QA test plan and acceptance criteria",
            "description": (
                "Prepare test cases for functional, regression, and edge-case coverage. "
                "Define go/no-go checklist for release."
            ),
            "priority": "medium",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
        {
            "title": "Prepare launch communication and rollout plan",
            "description": (
                "Draft internal announcement, support documentation, and phased rollout steps. "
                "Coordinate frontend, backend, AI, and QA handoff."
            ),
            "priority": "medium",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
        {
            "title": "Post-launch monitoring and iteration backlog",
            "description": (
                "Set up analytics, error monitoring, and feedback collection. "
                "Prioritize improvements based on user adoption."
            ),
            "priority": "low",
            "status": "todo",
            "suggested_due_date": deadline_str,
        },
    ]


def generate_tasks_from_goal(
    goal: str,
    deadline: Optional[Any] = None,
    team_context: Optional[str] = None,
) -> list[dict[str, str]]:
    """Generate structured tasks from a project goal using task_planner mode."""
    if not goal.strip():
        return []

    client = _build_client()
    if client is None:
        return _build_fallback_tasks(goal, deadline)

    deadline_text = str(deadline) if deadline is not None else "Not specified"
    team_text = team_context.strip() if team_context and team_context.strip() else "Not specified"

    user_prompt = (
        f"Project goal: {goal.strip()}\n"
        f"Deadline: {deadline_text}\n"
        f"Team context: {team_text}\n\n"
        "Create a practical enterprise task plan for this goal."
    )

    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": TASK_PLANNER_JSON_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.5,
            max_tokens=2000,
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty AI response")

        parsed = _extract_json_array(content.strip())
        if parsed is None:
            return _build_fallback_tasks(goal, deadline)

        normalized = _normalize_generated_tasks(parsed, deadline=deadline)
        if not normalized:
            return _build_fallback_tasks(goal, deadline)

        return normalized
    except Exception:
        return _build_fallback_tasks(goal, deadline)
