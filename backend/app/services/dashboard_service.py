from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.complaint import Complaint


class DashboardService:

    @staticmethod
    def get_dashboard_summary(db: Session):

        return {

            "total_complaints": db.query(
                Complaint
            ).count(),

            "pending_complaints": db.query(
                Complaint
            ).filter(
                Complaint.status.in_([
                    "SUBMITTED",
                    "ASSIGNED",
                    "IN_PROGRESS"
                ])
            ).count(),

            "resolved_complaints": db.query(
                Complaint
            ).filter(
                Complaint.status == "RESOLVED"
            ).count(),

            "closed_complaints": db.query(
                Complaint
            ).filter(
                Complaint.status == "CLOSED"
            ).count(),

            "escalated_complaints": db.query(
                Complaint
            ).filter(
                Complaint.status == "ESCALATED"
            ).count(),

            "overdue_complaints": db.query(
                Complaint
            ).filter(
                Complaint.sla_status == "OVERDUE"
            ).count(),

            "critical_complaints": db.query(
                Complaint
            ).filter(
                Complaint.priority == "CRITICAL"
            ).count()
        }

    @staticmethod
    def complaints_by_category(db: Session):

        return (

            db.query(

                Complaint.category.label("category"),

                func.count(
                    Complaint.complaint_id
                ).label("total")

            )

            .group_by(
                Complaint.category
            )

            .all()
        )

    @staticmethod
    def complaints_by_priority(db: Session):

        return (

            db.query(

                Complaint.priority.label("priority"),

                func.count(
                    Complaint.complaint_id
                ).label("total")

            )

            .group_by(
                Complaint.priority
            )

            .all()
        )

    @staticmethod
    def complaints_by_status(db: Session):

        return (

            db.query(

                Complaint.status.label("status"),

                func.count(
                    Complaint.complaint_id
                ).label("total")

            )

            .group_by(
                Complaint.status
            )

            .all()
        )