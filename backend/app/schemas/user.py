from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal["employee", "manager", "admin", "super_admin"]


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    company_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    status: str = "success"
    message: str
    data: list[UserResponse]


class UserDetailResponse(BaseModel):
    status: str = "success"
    message: str
    data: UserResponse


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class UserStatusUpdateRequest(BaseModel):
    is_active: bool


class ProfileUpdateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    company_name: str = Field(min_length=1, max_length=255)
