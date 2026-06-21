from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    TIMESTAMP,
    UniqueConstraint,
    text
)

from app.database.base import Base


class CrowdValidation(Base):

    __tablename__ = "crowd_validation"

    vote_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    student_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    supported_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    __table_args__ = (
        UniqueConstraint(
            "complaint_id",
            "student_id",
            name="uq_complaint_student_support"
        ),
    )