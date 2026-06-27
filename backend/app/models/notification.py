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
        ForeignKey("complaints.complaint_id"),
        nullable=True
    )

    notification_type = Column(
        Enum(
            "COMPLAINT_SUBMITTED",
            "COMPLAINT_ASSIGNED",
            "STATUS_UPDATED",
            "COMPLAINT_ESCALATED",
            "COMPLAINT_RESOLVED",
            "COMPLAINT_REOPENED",
            "COMPLAINT_CLOSED",
            "SYSTEM",
            "REMINDER",
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
        default=False,
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )