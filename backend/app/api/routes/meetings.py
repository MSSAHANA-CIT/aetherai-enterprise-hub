from datetime import datetime, timezone
import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.meeting import MeetingRecording
from app.models.user import User
from app.schemas.meeting import (
    MeetingAskData,
    MeetingAskRequest,
    MeetingAskResponse,
    MeetingDetailResponse,
    MeetingListResponse,
    MeetingResponse,
    MeetingScheduleUpdate,
    MeetingUploaderResponse,
)
from app.services.notification_service import create_notification
from app.services.transcription_service import (
    answer_meeting_question,
    process_meeting_recording,
    save_meeting_file,
    summarize_meeting_recording,
    transcribe_meeting_recording,
)

router = APIRouter(prefix="/meetings", tags=["Meetings"])


def _meeting_response(meeting: MeetingRecording) -> MeetingResponse:
    uploader = None
    if meeting.uploader:
        uploader = MeetingUploaderResponse.model_validate(meeting.uploader)
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        file_name=meeting.file_name,
        file_type=meeting.file_type,
        file_size=meeting.file_size,
        duration_seconds=meeting.duration_seconds,
        detected_language=meeting.detected_language,
        transcript=meeting.transcript,
        summary_text=meeting.summary_text,
        decisions=meeting.decisions,
        action_items=meeting.action_items,
        status=meeting.status,
        uploaded_by=meeting.uploaded_by,
        company_name=meeting.company_name,
        scheduled_at=meeting.scheduled_at,
        room=meeting.room,
        participants=meeting.participants,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        uploader=uploader,
    )


@router.post("/upload", response_model=MeetingDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_meeting(
    file: UploadFile = File(...),
    title: str = Form(""),
    scheduled_at: str = Form(""),
    room: str = Form("Virtual Room"),
    participants: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is required")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    try:
        file_path, file_type, file_size = save_meeting_file(file_bytes=file_bytes, filename=file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    meeting_title = title.strip() or file.filename
    parsed_scheduled_at: datetime | None = None
    if scheduled_at.strip():
        try:
            parsed_scheduled_at = datetime.fromisoformat(scheduled_at.strip().replace("Z", "+00:00"))
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid scheduled_at format. Use ISO 8601.",
            ) from exc

    meeting = MeetingRecording(
        title=meeting_title,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        uploaded_by=current_user.id,
        company_name=current_user.company_name,
        status="pending",
        scheduled_at=parsed_scheduled_at,
        room=room.strip() or "Virtual Room",
        participants=participants.strip() or None,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    meeting = process_meeting_recording(db, meeting)

    create_notification(
        db,
        user_id=current_user.id,
        title="Meeting uploaded",
        message=f"'{meeting.title}' has been processed.",
        notification_type="ai",
    )
    db.commit()
    db.refresh(meeting)

    return MeetingDetailResponse(data=_meeting_response(meeting))


@router.get("", response_model=MeetingListResponse)
def list_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingListResponse:
    meetings = (
        db.query(MeetingRecording)
        .filter(MeetingRecording.company_name == current_user.company_name)
        .order_by(
            MeetingRecording.scheduled_at.desc().nullslast(),
            MeetingRecording.created_at.desc(),
        )
        .limit(100)
        .all()
    )
    return MeetingListResponse(data=[_meeting_response(m) for m in meetings])


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return MeetingDetailResponse(data=_meeting_response(meeting))


@router.post("/{meeting_id}/ask", response_model=MeetingAskResponse)
def ask_meeting_question(
    meeting_id: int,
    payload: MeetingAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingAskResponse:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    answer = answer_meeting_question(
        transcript=meeting.transcript or "",
        summary=meeting.summary_text or "",
        question=payload.question,
    )
    return MeetingAskResponse(data=MeetingAskData(answer=answer, question=payload.question))


@router.post("/{meeting_id}/transcribe", response_model=MeetingDetailResponse)
def transcribe_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    if not os.path.isfile(meeting.file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recording file not found on disk. Please re-upload the meeting.",
        )

    meeting = transcribe_meeting_recording(db, meeting)
    return MeetingDetailResponse(
        message="Meeting transcribed",
        data=_meeting_response(meeting),
    )


@router.post("/{meeting_id}/summarize", response_model=MeetingDetailResponse)
def summarize_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    if not (meeting.transcript or "").strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript available. Run transcription before generating a summary.",
        )

    meeting = summarize_meeting_recording(db, meeting)
    return MeetingDetailResponse(
        message="Meeting summarized",
        data=_meeting_response(meeting),
    )


@router.delete("/{meeting_id}", status_code=status.HTTP_200_OK)
def delete_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    if meeting.file_path and os.path.isfile(meeting.file_path):
        try:
            os.remove(meeting.file_path)
        except OSError:
            pass

    db.delete(meeting)
    db.commit()
    return {"status": "success", "message": "Meeting deleted"}


@router.patch("/{meeting_id}/schedule", response_model=MeetingDetailResponse)
def update_meeting_schedule(
    meeting_id: int,
    payload: MeetingScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    meeting = (
        db.query(MeetingRecording)
        .filter(
            MeetingRecording.id == meeting_id,
            MeetingRecording.company_name == current_user.company_name,
        )
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    if payload.scheduled_at is not None:
        meeting.scheduled_at = payload.scheduled_at
    if payload.room is not None:
        meeting.room = payload.room.strip() or "Virtual Room"
    if payload.participants is not None:
        meeting.participants = payload.participants.strip() or None

    meeting.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(meeting)
    return MeetingDetailResponse(data=_meeting_response(meeting))
