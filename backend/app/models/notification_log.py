from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class NotificationLog(Base):

    __tablename__ = "notification_logs"

    log_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    notification_id = Column(
        Integer,
        ForeignKey("notifications.notification_id"),
        nullable=False
    )

    email_address = Column(
        String(150),
        nullable=False
    )

    delivery_status = Column(
        Enum(
            'PENDING',
            'SENT',
            'DELIVERED',
            'FAILED',
            name="delivery_status_types"
        ),
        default='PENDING'
    )

    error_message = Column(
        Text
    )

    sent_at = Column(
        TIMESTAMP,
        nullable=True
    )

    delivered_at = Column(
        TIMESTAMP,
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )