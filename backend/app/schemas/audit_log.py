from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr


class AuditActorResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[str]
    metadata_json: Optional[dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    actor: Optional[AuditActorResponse] = None

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    status: str = "success"
    message: str = "Audit logs retrieved successfully"
    data: list[AuditLogResponse]
