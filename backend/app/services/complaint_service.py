from datetime import datetime
import random

from sqlalchemy.orm import Session

from app.models.complaint import Complaint

from app.schemas.complaint import (
    ComplaintCreate
)

from app.services.history_service import (
    HistoryService
)

from app.models.user import User


from app.models.escalation import Escalation


class ComplaintService:

    @staticmethod
    def generate_complaint_code(
        db: Session
    ) -> str:

        latest_complaint = (
            db.query(Complaint)
            .order_by(
                Complaint.complaint_id.desc()
            )
            .first()
        )

        current_year = datetime.now().year

        if not latest_complaint:

            return f"CMP-{current_year}-00001"

        last_code = latest_complaint.complaint_code

        last_number = int(
            last_code.split("-")[-1]
        )

        next_number = last_number + 1

        return (
            f"CMP-{current_year}-"
            f"{next_number:05d}"
        )

    @staticmethod
    def generate_anonymous_id(
        db: Session
    ) -> str:

        while True:

            anonymous_id = (
                f"ANON-"
                f"{random.randint(10000, 99999)}"
            )

            existing = (
                db.query(Complaint)
                .filter(
                    Complaint.anonymous_id ==
                    anonymous_id
                )
                .first()
            )

            if not existing:
                return anonymous_id

    @staticmethod
    def create_complaint(
        db: Session,
        complaint_data: ComplaintCreate,
        current_user
    ):

        complaint_code = (
            ComplaintService
            .generate_complaint_code(db)
        )

        anonymous_id = None

        if complaint_data.is_anonymous:

            anonymous_id = (
                ComplaintService
                .generate_anonymous_id(db)
            )

        complaint = Complaint(

            complaint_code=complaint_code,

            title=complaint_data.title,

            description=complaint_data.description,

            category=complaint_data.category.value,

            subcategory=complaint_data.subcategory,

            location=complaint_data.location,

            severity_score=0,

            priority="LOW",

            status="SUBMITTED",

            workflow_type=None,

            is_anonymous=complaint_data.is_anonymous,

            anonymous_id=anonymous_id,

            support_count=0,

            created_by=current_user.user_id,

            department_id=current_user.department_id
        )

        db.add(complaint)

        db.commit()

        db.refresh(complaint)

        # Create Audit History Record

        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="SUBMITTED",
            performed_by=current_user.user_id,
            new_status="SUBMITTED",
            remarks="Complaint submitted"
        )

        return complaint

    @staticmethod
    def get_my_complaints(
        db: Session,
        current_user
    ):

        return (
            db.query(Complaint)
            .filter(
                Complaint.created_by ==
                current_user.user_id
            )
            .order_by(
                Complaint.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_complaint_by_id(
        db: Session,
        complaint_id: int,
        current_user
    ):

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id ==
                complaint_id
            )
            .first()
        )

        if not complaint:

            raise ValueError(
                "Complaint not found"
            )

        # Student can only view own complaint

        if (
            complaint.created_by !=
            current_user.user_id
        ):

            raise ValueError(
                "Access denied"
            )

        return complaint
    
    @staticmethod
    def assign_complaint(
        db: Session,
        complaint_id: int,
        assigned_to: int,
        current_user,
        remarks: str = None
    ):

        if current_user.role not in [
                "GRIEVANCE_ADMIN",
                "DEPARTMENT_OFFICER",
                "INFRASTRUCTURE_OFFICER",
                "HOSTEL_WARDEN",
                "EXAMINATION_OFFICER",
                "PLACEMENT_OFFICER",
                "PLACEMENT_HEAD",
                "TRANSPORT_OFFICER",
                "TRANSPORT_HEAD",
                "HOD",
                "DEAN",
                "STUDENT_AFFAIRS",
                "PRINCIPAL"
            ]:
                 raise ValueError("Only staff can assign complaints")

        # Find complaint
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError("Complaint not found")

        # Only submitted complaints can be assigned
        if complaint.status != "SUBMITTED":
            raise ValueError(
                "Only submitted complaints can be assigned"
            )

        # Verify assigned user exists
        assigned_user = (
            db.query(User)
            .filter(
                User.user_id == assigned_to
            )
            .first()
        )

        if not assigned_user:
            raise ValueError(
                "Assigned user not found"
            )

        old_status = complaint.status

        complaint.assigned_to = assigned_user.user_id

        complaint.current_owner = assigned_user.user_id

        complaint.status = "ASSIGNED"

        db.commit()

        db.refresh(complaint)

        # Audit history
        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="ASSIGNED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status="ASSIGNED",
            remarks=remarks or "Complaint assigned"
        )

        return complaint
    
    @staticmethod
    def update_status(
        db: Session,
        complaint_id: int,
        status: str,
        current_user,
        remarks: str = None
    ):
        if current_user.role not in [
            "GRIEVANCE_ADMIN",
            "DEPARTMENT_OFFICER",
            "INFRASTRUCTURE_OFFICER",
            "HOSTEL_WARDEN",
            "EXAMINATION_OFFICER",
            "PLACEMENT_OFFICER",
            "PLACEMENT_HEAD",
            "TRANSPORT_OFFICER",
            "TRANSPORT_HEAD",
            "HOD",
            "DEAN",
            "STUDENT_AFFAIRS",
            "PRINCIPAL"
        ]:
            raise ValueError(
                "Only staff can update complaint status"
            )
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError(
                "Complaint not found"
            )

        # Only the assigned officer can update the complaint
        if complaint.current_owner != current_user.user_id:
            raise ValueError(
                "Access denied"
            )

        old_status = complaint.status

        # Valid workflow transitions
        valid_transitions = {

            "ASSIGNED": [
                "IN_PROGRESS",
                "ESCALATED"
            ],

            "IN_PROGRESS": [
                "RESOLVED",
                "ESCALATED"
            ],

            "REOPENED": [
                "IN_PROGRESS"
            ]
        }

        allowed = valid_transitions.get(
            old_status,
            []
        )

        if status not in allowed:

            raise ValueError(
                f"Cannot change status from "
                f"{old_status} to {status}"
            )

        complaint.status = status

        db.commit()

        db.refresh(complaint)

        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="STATUS_CHANGED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status=status,
            remarks=remarks
        )

        return complaint
    
    @staticmethod
    def resolve_complaint(
        db: Session,
        complaint_id: int,
        current_user,
        remarks: str = None
    ):
        if current_user.role not in [
            "GRIEVANCE_ADMIN",
            "DEPARTMENT_OFFICER",
            "INFRASTRUCTURE_OFFICER",
            "HOSTEL_WARDEN",
            "EXAMINATION_OFFICER",
            "PLACEMENT_OFFICER",
            "PLACEMENT_HEAD",
            "TRANSPORT_OFFICER",
            "TRANSPORT_HEAD",
            "HOD",
            "DEAN",
            "STUDENT_AFFAIRS",
            "PRINCIPAL"
        ]:
            raise ValueError(
                "Only staff can update complaint status"
            )
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError(
                "Complaint not found"
            )

        # Only the assigned officer can resolve
        if complaint.current_owner != current_user.user_id:
            raise ValueError(
                "Access denied"
            )

        # Complaint must be in progress
        if complaint.status != "IN_PROGRESS":
            raise ValueError(
                "Only complaints in progress can be resolved"
            )

        old_status = complaint.status

        complaint.status = "RESOLVED"

        db.commit()

        db.refresh(complaint)

        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="RESOLVED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status="RESOLVED",
            remarks=remarks or "Complaint resolved"
        )

        return complaint
    
    @staticmethod
    def close_complaint(
        db: Session,
        complaint_id: int,
        current_user,
        remarks: str = None
    ):
        if current_user.role != "STUDENT":
            raise ValueError(
                "Only students can close complaints"
            )

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError(
                "Complaint not found"
            )

        # Only complaint owner can close
        if complaint.created_by != current_user.user_id:
            raise ValueError(
                "Access denied"
            )

        # Complaint must be resolved
        if complaint.status != "RESOLVED":
            raise ValueError(
                "Only resolved complaints can be closed"
            )

        old_status = complaint.status

        complaint.status = "CLOSED"

        db.commit()

        db.refresh(complaint)

        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="CLOSED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status="CLOSED",
            remarks=remarks or "Complaint closed by student"
        )

        return complaint
    
    @staticmethod
    def reopen_complaint(
        db: Session,
        complaint_id: int,
        current_user,
        remarks: str = None
    ):
        if current_user.role != "STUDENT":
          raise ValueError(
            "Only students can reopen complaints"
             )

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError(
                "Complaint not found"
            )

        # Only complaint owner can reopen
        if complaint.created_by != current_user.user_id:
            raise ValueError(
                "Access denied"
            )

        # Only resolved complaints can be reopened
        if complaint.status != "RESOLVED":
            raise ValueError(
                "Only resolved complaints can be reopened"
            )

        old_status = complaint.status

        complaint.status = "REOPENED"

        db.commit()

        db.refresh(complaint)

        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="REOPENED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status="REOPENED",
            remarks=remarks or "Complaint reopened by student"
        )

        return complaint
    
    @staticmethod
    def escalate_complaint(
        db: Session,
        complaint_id: int,
        to_user_id: int,
        current_user,
        remarks: str = None
    ):
        if current_user.role not in [
                "GRIEVANCE_ADMIN",
                "DEPARTMENT_OFFICER",
                "INFRASTRUCTURE_OFFICER",
                "HOSTEL_WARDEN",
                "EXAMINATION_OFFICER",
                "PLACEMENT_OFFICER",
                "PLACEMENT_HEAD",
                "TRANSPORT_OFFICER",
                "TRANSPORT_HEAD",
                "HOD",
                "DEAN",
                "STUDENT_AFFAIRS",
                "PRINCIPAL"
            ]:
                raise ValueError(
                        "Only staff can escalate complaints")
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

        if not complaint:
            raise ValueError(
                "Complaint not found"
            )

        # Only current owner can escalate
        if complaint.current_owner != current_user.user_id:
            raise ValueError(
                "Access denied"
            )

        # Closed complaints cannot be escalated
        if complaint.status == "CLOSED":
            raise ValueError(
                "Closed complaints cannot be escalated"
            )

        # Verify target user exists
        target_user = (
            db.query(User)
            .filter(
                User.user_id == to_user_id
            )
            .first()
        )

        if not target_user:
            raise ValueError(
                "Target user not found"
            )

        old_status = complaint.status

        # Update complaint
        complaint.current_owner = target_user.user_id
        complaint.assigned_to = target_user.user_id
        complaint.status = "ESCALATED"

        # Create escalation record
        escalation = Escalation(

            complaint_id=complaint.complaint_id,

            from_user_id=current_user.user_id,

            to_user_id=target_user.user_id,

            escalation_level=1,

            escalation_reason=remarks,

            escalated_by=current_user.user_id
)
        db.add(escalation)

        db.commit()

        db.refresh(complaint)

        # History
        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type="ESCALATED",
            performed_by=current_user.user_id,
            old_status=old_status,
            new_status="ESCALATED",
            remarks=remarks or "Complaint escalated"
        )

        return complaint