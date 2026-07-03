from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin_user
from app.database import get_db
from app.models.audit_log import AuditLog, SECURITY_ACTIONS
from app.models.user import User
from app.schemas.audit_log import AuditActorResponse, AuditLogListResponse, AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


def _build_audit_response(entry: AuditLog) -> AuditLogResponse:
    actor = None
    if entry.actor is not None:
        actor = AuditActorResponse.model_validate(entry.actor)

    return AuditLogResponse(
        id=entry.id,
        actor_id=entry.actor_id,
        action=entry.action,
        entity_type=entry.entity_type,
        entity_id=entry.entity_id,
        metadata_json=entry.metadata_json,
        ip_address=entry.ip_address,
        created_at=entry.created_at,
        actor=actor,
    )


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    entries = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.actor))
        .order_by(AuditLog.created_at.desc())
        .limit(200)
        .all()
    )
    return AuditLogListResponse(data=[_build_audit_response(entry) for entry in entries])


@router.get("/security", response_model=AuditLogListResponse)
def list_security_audit_logs(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    entries = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.actor))
        .filter(AuditLog.action.in_(SECURITY_ACTIONS))
        .order_by(AuditLog.created_at.desc())
        .limit(200)
        .all()
    )
    return AuditLogListResponse(
        message="Security audit logs retrieved successfully",
        data=[_build_audit_response(entry) for entry in entries],
    )
