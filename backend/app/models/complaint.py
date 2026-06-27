from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
    Boolean,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class Complaint(Base):

    __tablename__ = "complaints"

    complaint_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_code = Column(
        String(20),
        unique=True,
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
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
            name="complaint_categories"
        ),
        nullable=False
    )

    subcategory = Column(
        String(100)
    )

    location = Column(
        String(255)
    )

    severity_score = Column(
        Integer,
        default=0
    )

    priority = Column(
        Enum(
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL',
            name="complaint_priorities"
        ),
        default='LOW'
    )

    status = Column(
        Enum(
            'SUBMITTED',
            'ASSIGNED',
            'IN_PROGRESS',
            'ESCALATED',
            'RESOLVED',
            'REOPENED',
            'CLOSED',
            name="complaint_statuses"
        ),
        default='SUBMITTED'
    )

    workflow_type = Column(
        String(100)
    )

    is_anonymous = Column(
        Boolean,
        default=False
    )

    anonymous_id = Column(
        String(30)
    )

    support_count = Column(
        Integer,
        default=0
    )

    created_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    current_owner = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.department_id")
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    # =====================================================
    # SLA MANAGEMENT
    # =====================================================

    sla_deadline = Column(
        TIMESTAMP,
        nullable=True
    )

    sla_status = Column(
        Enum(
            "ON_TIME",
            "WARNING",
            "OVERDUE",
            "COMPLETED",
            name="sla_status_enum"
        ),
        default="ON_TIME",
        nullable=False
    )


    # =====================================================
    # RESPONSE TRACKING
    # =====================================================

    first_response_at = Column(
        TIMESTAMP,
        nullable=True
    )

    resolved_at = Column(
        TIMESTAMP,
        nullable=True
    )

    closed_at = Column(
        TIMESTAMP,
        nullable=True
    )


    # =====================================================
    # TIME METRICS
    # =====================================================

    response_time = Column(
        Integer,
        nullable=True,
        comment="Minutes until first response"
    )

    resolution_time = Column(
        Integer,
        nullable=True,
        comment="Minutes until complaint resolved"
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )