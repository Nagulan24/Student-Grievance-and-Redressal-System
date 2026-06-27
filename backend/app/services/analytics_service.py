from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.complaint import Complaint

from app.services.sla_service import SLAService


class AnalyticsService:

    @staticmethod
    def get_dashboard_summary(
        db: Session
    ):

        complaints = (
            db.query(Complaint)
            .all()
        )

        overdue = sum(
            1
            for complaint in complaints
            if SLAService.is_overdue(complaint)
        )

        return {

            "total_complaints": len(complaints),

            "pending_complaints": sum(
                1
                for complaint in complaints
                if complaint.status in [
                    "SUBMITTED",
                    "ASSIGNED",
                    "IN_PROGRESS",
                    "REOPENED"
                ]
            ),

            "resolved_complaints": sum(
                1
                for complaint in complaints
                if complaint.status == "RESOLVED"
            ),

            "closed_complaints": sum(
                1
                for complaint in complaints
                if complaint.status == "CLOSED"
            ),

            "escalated_complaints": sum(
                1
                for complaint in complaints
                if complaint.status == "ESCALATED"
            ),

            "overdue_complaints": overdue,

            "critical_complaints": sum(
                1
                for complaint in complaints
                if complaint.priority == "CRITICAL"
            )
        }

    @staticmethod
    def get_category_analytics(
        db: Session
    ):

        results = (

            db.query(

                Complaint.category,

                func.count(
                    Complaint.complaint_id
                )

            )

            .group_by(
                Complaint.category
            )

            .all()

        )

        return [

            {

                "category": category,

                "total": total

            }

            for category, total in results

        ]

    @staticmethod
    def get_priority_analytics(
        db: Session
    ):

        results = (

            db.query(

                Complaint.priority,

                func.count(
                    Complaint.complaint_id
                )

            )

            .group_by(
                Complaint.priority
            )

            .all()

        )

        return [

            {

                "priority": priority,

                "total": total

            }

            for priority, total in results

        ]

    @staticmethod
    def get_status_analytics(
        db: Session
    ):

        results = (

            db.query(

                Complaint.status,

                func.count(
                    Complaint.complaint_id
                )

            )

            .group_by(
                Complaint.status
            )

            .all()

        )

        return [

            {

                "status": status,

                "total": total

            }

            for status, total in results

        ]