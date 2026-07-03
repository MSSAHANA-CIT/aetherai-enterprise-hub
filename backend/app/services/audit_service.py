from typing import Any, Optional, Union

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog, SECURITY_ACTIONS


def log_action(
    db: Session,
    *,
    actor_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: Optional[Union[str, int]] = None,
    metadata: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    entity_id_str = str(entity_id) if entity_id is not None else None

    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id_str,
        metadata_json=metadata,
        ip_address=ip_address,
    )
    db.add(entry)
    db.flush()
    return entry


def is_security_action(action: str) -> bool:
    return action in SECURITY_ACTIONS
