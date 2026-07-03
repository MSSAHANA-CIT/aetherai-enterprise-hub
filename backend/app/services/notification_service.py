from sqlalchemy.orm import Session

from app.models.notification import NOTIFICATION_TYPES, Notification


def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
) -> Notification:
    if notification_type not in NOTIFICATION_TYPES:
        notification_type = "system"

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notification)
    db.flush()
    return notification
