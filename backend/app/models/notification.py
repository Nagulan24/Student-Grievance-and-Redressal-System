from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Enum,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class Notification(Base):

    __tablename__ = "notifications"

    notification_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id")
    )

    notification_type = Column(
        Enum(
            'SYSTEM',
            'EMAIL',
            'ESCALATION',
            'CRITICAL',
            'RESOLUTION',
            'VERIFICATION',
            'REMINDER',
            name="notification_types"
        ),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )