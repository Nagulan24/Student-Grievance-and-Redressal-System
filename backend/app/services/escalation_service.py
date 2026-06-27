from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.models.user import User

from app.services.routing_service import RoutingService


class EscalationService:

    @staticmethod
    def get_next_officer(
        db: Session,
        complaint: Complaint
    ):

        return RoutingService.get_officer_for_category(
            db=db,
            category=complaint.category,
            department_id=complaint.department_id
        )

    @staticmethod
    def can_escalate(
        complaint: Complaint
    ):

        return complaint.status in [
            "ASSIGNED",
            "IN_PROGRESS",
            "ESCALATED"
        ]

    @staticmethod
    def is_owner(
        complaint: Complaint,
        current_user: User
    ):

        return (
            complaint.current_owner ==
            current_user.user_id
        )