from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    Enum,
    TIMESTAMP,
    text
)

from app.database.base import Base


class SLARule(Base):

    __tablename__ = "sla_rules"

    sla_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category = Column(
        Enum(
            'ACADEMIC',
            'INFRASTRUCTURE',
            'HOSTEL',
            'EXAMINATION',
            'PLACEMENT',
            'TRANSPORTATION',
            'SAFETY',
            name="sla_categories"
        ),
        nullable=False,
        unique=True
    )

    first_level_days = Column(
        Integer,
        nullable=False
    )

    second_level_days = Column(
        Integer
    )

    final_level_days = Column(
        Integer
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )