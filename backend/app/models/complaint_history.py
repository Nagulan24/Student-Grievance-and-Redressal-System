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


class ComplaintHistory(Base):

    __tablename__ = "complaint_history"

    history_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    action_type = Column(
        Enum(
            'SUBMITTED',
            'ASSIGNED',
            'STATUS_CHANGED',
            'ESCALATED',
            'RESOLVED',
            'REOPENED',
            'CLOSED',
            'REMARK_ADDED',
            name="complaint_history_actions"
        ),
        nullable=False
    )

    old_status = Column(
        String(50)
    )

    new_status = Column(
        String(50)
    )

    remarks = Column(
        Text
    )

    performed_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )