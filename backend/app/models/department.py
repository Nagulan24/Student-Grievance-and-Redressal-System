from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    TIMESTAMP,
    text
)

from app.database.base import Base


class Department(Base):

    __tablename__ = "departments"

    department_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    department_code = Column(
        String(20),
        unique=True,
        nullable=False
    )

    department_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    department_description = Column(
        String(255)
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )