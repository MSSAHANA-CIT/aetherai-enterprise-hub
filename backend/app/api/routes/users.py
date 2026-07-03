from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_current_user
from app.core.security import (
    ROLE_SUPER_ADMIN,
    is_super_admin_role,
    is_valid_role,
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    ProfileUpdateRequest,
    UserDetailResponse,
    UserListResponse,
    UserResponse,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
)
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

router = APIRouter(prefix="/users", tags=["Users"])


def _user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def _client_ip(request: Request) -> Optional[str]:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


@router.get("/me/profile", response_model=UserDetailResponse)
def get_my_profile(current_user: User = Depends(get_current_user)) -> UserDetailResponse:
    return UserDetailResponse(
        message="Profile retrieved successfully",
        data=_user_response(current_user),
    )


@router.put("/me/profile", response_model=UserDetailResponse)
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    current_user.full_name = payload.full_name.strip()
    current_user.company_name = payload.company_name.strip()
    db.commit()
    db.refresh(current_user)

    return UserDetailResponse(
        message="Profile updated successfully",
        data=_user_response(current_user),
    )


@router.get("", response_model=UserListResponse)
def list_users(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> UserListResponse:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return UserListResponse(
        message="Users retrieved successfully",
        data=[_user_response(user) for user in users],
    )


@router.get("/{user_id}", response_model=UserDetailResponse)
def get_user(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserDetailResponse(
        message="User retrieved successfully",
        data=_user_response(user),
    )


@router.put("/{user_id}/role", response_model=UserDetailResponse)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    if not is_valid_role(payload.role):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if is_super_admin_role(user.role) and not is_super_admin_role(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can modify super admin accounts",
        )

    if payload.role == ROLE_SUPER_ADMIN and not is_super_admin_role(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can assign the super admin role",
        )

    old_role = user.role
    user.role = payload.role

    log_action(
        db,
        actor_id=current_user.id,
        action="user_role_changed",
        entity_type="user",
        entity_id=user.id,
        metadata={"old_role": old_role, "new_role": payload.role, "email": user.email},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=user.id,
        title="Role updated",
        message=f"Your role was changed from {old_role} to {payload.role}.",
        notification_type="system",
    )
    db.commit()
    db.refresh(user)

    return UserDetailResponse(
        message="User role updated successfully",
        data=_user_response(user),
    )


@router.put("/{user_id}/status", response_model=UserDetailResponse)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    if user_id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if is_super_admin_role(user.role) and not is_super_admin_role(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can modify super admin accounts",
        )

    user.is_active = payload.is_active

    action = "user_activated" if user.is_active else "user_deactivated"
    log_action(
        db,
        actor_id=current_user.id,
        action=action,
        entity_type="user",
        entity_id=user.id,
        metadata={"email": user.email, "is_active": user.is_active},
        ip_address=_client_ip(request),
    )
    create_notification(
        db,
        user_id=user.id,
        title="Account status updated",
        message=f"Your account was {'activated' if user.is_active else 'deactivated'}.",
        notification_type="security",
    )
    db.commit()
    db.refresh(user)

    status_label = "activated" if user.is_active else "deactivated"
    return UserDetailResponse(
        message=f"User {status_label} successfully",
        data=_user_response(user),
    )
