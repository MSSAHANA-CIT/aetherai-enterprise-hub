from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ActionItemResponse(BaseModel):
    task: str
    owner: str = ""
    deadline: str = ""


class SummaryCreatorResponse(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class SummaryChannelResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SummaryResponse(BaseModel):
    id: int
    channel_id: int
    created_by: int
    title: str
    summary_text: str
    decisions: list[str]
    action_items: list[ActionItemResponse]
    created_at: datetime
    channel: Optional[SummaryChannelResponse] = None
    creator: Optional[SummaryCreatorResponse] = None

    model_config = {"from_attributes": True}


class SummaryListResponse(BaseModel):
    status: str = "success"
    message: str = "Summaries retrieved"
    data: list[SummaryResponse]


class SummaryDetailResponse(BaseModel):
    status: str = "success"
    message: str = "Summary retrieved"
    data: SummaryResponse


class SummaryCreateResponse(BaseModel):
    status: str = "success"
    message: str = "Summary generated"
    data: SummaryResponse
