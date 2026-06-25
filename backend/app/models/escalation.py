from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class Escalation(Base):

    __tablename__ = "escalations"

    escalation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    from_user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    to_user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    escalation_level = Column(
        Integer,
        nullable=False
    )

    escalation_reason = Column(
        Text,
        nullable=True
    )

    escalated_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    escalated_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )