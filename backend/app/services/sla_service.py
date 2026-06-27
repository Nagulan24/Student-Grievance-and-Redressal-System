from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.sla_rule import SLARule
from app.models.complaint import Complaint


class SLAService:

    @staticmethod
    def get_sla_rule(
        db: Session,
        category: str
    ):

        return (
            db.query(SLARule)
            .filter(
                SLARule.category == category,
                SLARule.is_active == True
            )
            .first()
        )

    @staticmethod
    def calculate_deadline(
        db: Session,
        category: str,
        created_at: datetime
    ):

        rule = SLAService.get_sla_rule(
            db=db,
            category=category
        )

        if not rule:
            return None

        return created_at + timedelta(
            days=rule.first_level_days
        )

    @staticmethod
    def get_sla_status(
        complaint: Complaint
    ):

        if complaint.status in [
            "RESOLVED",
            "CLOSED"
        ]:
            return "COMPLETED"

        if not complaint.sla_deadline:
            return "ON_TIME"

        now = datetime.utcnow()

        if now >= complaint.sla_deadline:
            return "OVERDUE"

        remaining = complaint.sla_deadline - now

        if remaining.total_seconds() <= 86400:
            return "WARNING"

        return "ON_TIME"

    @staticmethod
    def calculate_remaining_time(
        complaint: Complaint
    ):

        if not complaint.sla_deadline:
            return None

        remaining = complaint.sla_deadline - datetime.utcnow()

        if remaining.total_seconds() <= 0:
            return "Expired"

        days = remaining.days

        hours = remaining.seconds // 3600

        minutes = (remaining.seconds % 3600) // 60

        return f"{days}d {hours}h {minutes}m"

    @staticmethod
    def calculate_response_time(
        complaint: Complaint
    ):

        if (
            complaint.created_at is None
            or complaint.first_response_at is None
        ):
            return None

        minutes = int(
            (
                complaint.first_response_at
                - complaint.created_at
            ).total_seconds() / 60
        )

        return minutes

    @staticmethod
    def calculate_resolution_time(
        complaint: Complaint
    ):

        if (
            complaint.created_at is None
            or complaint.resolved_at is None
        ):
            return None

        minutes = int(
            (
                complaint.resolved_at
                - complaint.created_at
            ).total_seconds() / 60
        )

        return minutes

    @staticmethod
    def is_overdue(
        complaint: Complaint
    ):

        if not complaint.sla_deadline:
            return False

        return datetime.utcnow() > complaint.sla_deadline