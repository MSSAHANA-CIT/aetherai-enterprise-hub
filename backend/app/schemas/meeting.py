from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MeetingUploaderResponse(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class MeetingScheduleUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    room: Optional[str] = Field(default=None, max_length=255)
    participants: Optional[str] = Field(default=None, max_length=2000)


class MeetingResponse(BaseModel):
    id: int
    title: str
    file_name: str
    file_type: str
    file_size: int
    duration_seconds: Optional[int] = None
    detected_language: Optional[str] = None
    transcript: Optional[str] = None
    summary_text: Optional[str] = None
    decisions: Optional[str] = None
    action_items: Optional[str] = None
    status: str
    uploaded_by: int
    company_name: str
    scheduled_at: Optional[datetime] = None
    room: Optional[str] = None
    participants: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    uploader: Optional[MeetingUploaderResponse] = None

    model_config = {"from_attributes": True}


class MeetingListResponse(BaseModel):
    status: str = "success"
    message: str = "Meetings retrieved"
    data: list[MeetingResponse]


class MeetingDetailResponse(BaseModel):
    status: str = "success"
    message: str = "Meeting retrieved"
    data: MeetingResponse


class MeetingAskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


class MeetingAskData(BaseModel):
    answer: str
    question: str


class MeetingAskResponse(BaseModel):
    status: str = "success"
    message: str = "Answer generated"
    data: MeetingAskData
