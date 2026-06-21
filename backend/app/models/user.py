from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Enum,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class User(Base):

    __tablename__ = "users"

    user_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    register_no = Column(
        String(30),
        unique=True,
        nullable=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    phone = Column(
        String(15)
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        Enum(
            'STUDENT',
            'GRIEVANCE_ADMIN',
            'DEPARTMENT_OFFICER',
            'INFRASTRUCTURE_OFFICER',
            'HOSTEL_WARDEN',
            'EXAMINATION_OFFICER',
            'PLACEMENT_OFFICER',
            'PLACEMENT_HEAD',
            'TRANSPORT_OFFICER',
            'TRANSPORT_HEAD',
            'HOD',
            'DEAN',
            'STUDENT_AFFAIRS',
            'PRINCIPAL',
            name="user_roles"
        ),
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.department_id")
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