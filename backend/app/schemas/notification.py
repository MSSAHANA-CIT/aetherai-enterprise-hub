from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

NotificationType = Literal["security", "task", "chat", "document", "ai", "system"]


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    status: str = "success"
    message: str = "Notifications retrieved successfully"
    data: list[NotificationResponse]


class UnreadCountData(BaseModel):
    count: int


class UnreadCountResponse(BaseModel):
    status: str = "success"
    message: str = "Unread count retrieved successfully"
    data: UnreadCountData


class NotificationActionResponse(BaseModel):
    status: str = "success"
    message: str
    data: Optional[NotificationResponse] = None
