from sqlalchemy import (
    Column,
    Integer,
    Text,
    Enum,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class StudentVerification(Base):

    __tablename__ = "student_verification"

    verification_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False,
        unique=True
    )

    student_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    verification_status = Column(
        Enum(
            'PENDING',
            'VERIFIED',
            'REJECTED',
            name="verification_status_types"
        ),
        default='PENDING'
    )

    feedback = Column(
        Text
    )

    verified_at = Column(
        TIMESTAMP,
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )