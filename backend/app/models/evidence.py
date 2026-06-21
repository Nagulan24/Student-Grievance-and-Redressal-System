from sqlalchemy import (
    Column,
    Integer,
    String,
    BigInteger,
    Enum,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class Evidence(Base):

    __tablename__ = "evidence"

    evidence_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    original_file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    file_type = Column(
        Enum(
            'IMAGE',
            'VIDEO',
            'PDF',
            'AUDIO',
            name="evidence_file_types"
        ),
        nullable=False
    )

    file_size = Column(
        BigInteger
    )

    uploaded_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )