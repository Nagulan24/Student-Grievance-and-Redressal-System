from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    DECIMAL,
    ForeignKey,
    TIMESTAMP,
    text
)

from app.database.base import Base


class AIAnalysis(Base):

    __tablename__ = "ai_analysis"

    analysis_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    predicted_category = Column(
        String(100)
    )

    predicted_subcategory = Column(
        String(100)
    )

    predicted_department_id = Column(
        Integer,
        ForeignKey("departments.department_id")
    )

    sentiment = Column(
        Enum(
            'POSITIVE',
            'NEUTRAL',
            'NEGATIVE',
            'FEAR',
            'ANGER',
            'DISTRESS',
            name="sentiment_types"
        )
    )

    risk_level = Column(
        Enum(
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL',
            name="risk_levels"
        )
    )

    severity_score = Column(
        Integer
    )

    priority = Column(
        Enum(
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL',
            name="ai_priorities"
        )
    )

    workflow_type = Column(
        String(100)
    )

    assigned_role = Column(
        String(100)
    )

    escalation_role = Column(
        String(100)
    )

    ai_confidence = Column(
        DECIMAL(5, 2)
    )

    model_version = Column(
        String(50)
    )

    analyzed_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )