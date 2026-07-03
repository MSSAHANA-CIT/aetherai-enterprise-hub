from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChannelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    channel_type: str = Field(default="team", max_length=50)


class ChannelResponse(BaseModel):
    id: int
    name: str
    description: str
    channel_type: str
    created_at: datetime
    last_activity: Optional[str] = None
    unread_count: int = 0
    peer: Optional["SenderResponse"] = None
    last_message_preview: Optional[str] = None

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    message_type: str = Field(default="text", max_length=50)
    parent_message_id: Optional[int] = None


class ReactionCreate(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=32)


class ReactionResponse(BaseModel):
    id: int
    message_id: int
    user_id: int
    emoji: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReactionGroupResponse(BaseModel):
    emoji: str
    count: int
    user_ids: list[int]
    reacted_by_me: bool = False
    my_reaction_id: Optional[int] = None


class SenderResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


class MessageAttachmentResponse(BaseModel):
    file_name: str
    mime_type: str
    file_size: int
    url: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: int
    content: str
    message_type: str
    created_at: datetime
    sender: SenderResponse
    attachment: Optional[MessageAttachmentResponse] = None
    parent_message_id: Optional[int] = None
    is_pinned: bool = False
    reply_count: int = 0
    reactions: list[ReactionGroupResponse] = []

    model_config = {"from_attributes": True}
