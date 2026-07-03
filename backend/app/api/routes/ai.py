from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import AIChatEnvelope, AIChatRequest, AIChatResponse
from app.services.ai_service import generate_ai_response

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=AIChatEnvelope)
def ai_chat(
    payload: AIChatRequest,
    current_user: User = Depends(get_current_user),
) -> AIChatEnvelope:
    _ = current_user
    response_text, suggestions = generate_ai_response(payload.message, payload.mode)

    return AIChatEnvelope(
        status="success",
        message="AI response generated",
        data=AIChatResponse(
            response=response_text,
            mode=payload.mode,
            suggestions=suggestions,
        ),
    )
