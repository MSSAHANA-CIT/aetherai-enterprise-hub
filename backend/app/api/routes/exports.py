from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.models.user import User
from app.services.export_service import SUPPORTED_FORMATS, export_content

router = APIRouter(prefix="/exports", tags=["Exports"])


class ExportSummaryRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500000)
    title: str = Field(min_length=1, max_length=255)
    format: str = Field(default="txt")
    metadata: Optional[dict[str, Any]] = None


@router.post("/summary")
def export_summary(
    payload: ExportSummaryRequest,
    _: User = Depends(get_current_user),
) -> Response:
    fmt = payload.format.lower().strip()
    if fmt not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format. Supported: {', '.join(sorted(SUPPORTED_FORMATS))}",
        )

    try:
        file_bytes, filename, media_type = export_content(
            content=payload.content,
            title=payload.title,
            export_format=fmt,
            metadata=payload.metadata,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
