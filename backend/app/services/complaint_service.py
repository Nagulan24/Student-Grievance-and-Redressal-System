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

from app.services.sla_service import SLAService

from app.services.notification_service import (
    NotificationService
)
from app.services.email_service import (
    EmailService
)

from app.utils.email_templates import (
    EmailTemplates
)

from app.services.ai_service import AIService

from app.ai.router import WorkflowRouter

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

        created_time = datetime.utcnow()

        ai_result = AIService.analyze_complaint(
            title=complaint_data.title,
            description=complaint_data.description,
            category=complaint_data.category.value
        )
        sla_deadline = SLAService.calculate_deadline(
            db=db,
            category=complaint_data.category.value,
            created_at=created_time
        )

        default_role = WorkflowRouter.get_default_role(
            complaint_data.category.value
        )

        default_officer = (
            db.query(User)
            .filter(
                User.role == default_role,
                User.is_active == True
            )
            .first()
        )

        complaint = Complaint(

            complaint_code=complaint_code,

            title=complaint_data.title,

            description=complaint_data.description,

            category=complaint_data.category.value,

            subcategory=complaint_data.subcategory,

            location=complaint_data.location,

            severity_score=ai_result["severity_score"],

            priority=ai_result["priority"],

           status=(
                "ASSIGNED"
                if default_officer
                else "SUBMITTED"
            ),

            workflow_type=ai_result["workflow_type"],

            is_anonymous=complaint_data.is_anonymous,

            anonymous_id=anonymous_id,

            support_count=0,

            created_by=current_user.user_id,

            assigned_to=(
                default_officer.user_id
                if default_officer
                else None
            ),

            current_owner=(
                default_officer.user_id
                if default_officer
                else None
            ),

            department_id=current_user.department_id,

            created_at=created_time,

            sla_deadline=sla_deadline,

            sla_status="ON_TIME"
        )

        db.add(complaint)

        db.commit()

        db.refresh(complaint)

        if default_officer:

            complaint.first_response_at = datetime.utcnow()

            complaint.response_time = (
                SLAService.calculate_response_time(
                    complaint
                )
            )

            db.commit()

            db.refresh(complaint)

            NotificationService.create_notification(
                db=db,
                user_id=default_officer.user_id,
                complaint_id=complaint.complaint_id,
                notification_type="COMPLAINT_ASSIGNED",
                title="New Complaint Assigned",
                message=(
                    f"You have been assigned complaint "
                    f"{complaint.complaint_code}."
                )
            )

            EmailService.send_email(
                to_emails=[
                    default_officer.email
                ],
                subject="New Complaint Assigned",
                html=EmailTemplates.complaint_assigned(
                    complaint
                )
            )

        # Create Audit History Record
        HistoryService.create_history(
            db=db,
            complaint_id=complaint.complaint_id,
            action_type=complaint.status,
            performed_by=current_user.user_id,
            new_status=complaint.status,
            remarks="Complaint submitted"
        )
        

        NotificationService.create_notification(
            db=db,
            user_id=current_user.user_id,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_SUBMITTED",
            title="Complaint Submitted",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"has been submitted"
                + (
                    " and automatically assigned to the concerned officer."
                    if default_officer
                    else " successfully."
                )
            )
        )
        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        if student:

            EmailService.send_email(
                to_emails=[
                    student.email
                ],
                subject="Complaint Submitted Successfully",
                html=EmailTemplates.complaint_submitted(
                    complaint
                )
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

        # Closed complaints cannot be assigned
        if complaint.status == "CLOSED":
            raise ValueError(
                "Closed complaints cannot be assigned"
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

        if complaint.first_response_at is None:

            complaint.first_response_at = datetime.utcnow()

            complaint.response_time = (
                SLAService.calculate_response_time(
                    complaint
                )
            )
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

        NotificationService.create_notification(
            db=db,
            user_id=assigned_user.user_id,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_ASSIGNED",
            title="Complaint Assigned",
            message=(
                f"You have been assigned complaint "
                f"{complaint.complaint_code}."
            )
        )

        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_ASSIGNED",
            title="Complaint Assigned",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"has been assigned to an officer."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        if student:

            EmailService.send_email(
                to_emails=[
                    student.email,
                    assigned_user.email
                ],
                subject="Complaint Assigned",
                html=EmailTemplates.complaint_assigned(
                    complaint
                )
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

        complaint.sla_status = (
            SLAService.get_sla_status(
                complaint
            )
        )

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

        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="STATUS_UPDATED",
            title="Complaint Status Updated",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"is now '{status}'."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        if student:

            EmailService.send_email(
                to_emails=[
                    student.email
                ],
                subject="Complaint Status Updated",
                html=EmailTemplates.complaint_status_updated(
                    complaint
                )
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

        complaint.resolved_at = datetime.utcnow()

        complaint.resolution_time = (
            SLAService.calculate_resolution_time(
                complaint
            )
        )

        complaint.sla_status = "COMPLETED"

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

        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_RESOLVED",
            title="Complaint Resolved",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"has been resolved."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        if student:

            EmailService.send_email(
                to_emails=[
                    student.email
                ],
                subject="Complaint Resolved",
                html=EmailTemplates.complaint_resolved(
                    complaint
                )
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

        complaint.closed_at = datetime.utcnow()

        complaint.sla_status = "COMPLETED"

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

        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_CLOSED",
            title="Complaint Closed",
            message=(
                f"Complaint "
                f"{complaint.complaint_code} "
                f"has been closed."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        if student:

            EmailService.send_email(
                to_emails=[
                    student.email
                ],
                subject="Complaint Closed",
                html=EmailTemplates.complaint_closed(
                    complaint
                )
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

        complaint.sla_deadline = SLAService.calculate_deadline(
            db=db,
            category=complaint.category,
            created_at=datetime.utcnow()
        )

        complaint.sla_status = "ON_TIME"

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

        # Notify current owner (officer)
        NotificationService.create_notification(
            db=db,
            user_id=complaint.current_owner,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_REOPENED",
            title="Complaint Reopened",
            message=(
                f"Complaint "
                f"{complaint.complaint_code} "
                f"has been reopened by the student."
            )
        )

        # Notify student
        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_REOPENED",
            title="Complaint Reopened",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"has been reopened successfully."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        officer = (
            db.query(User)
            .filter(
                User.user_id == complaint.current_owner
            )
            .first()
        )

        emails = []

        if student:
            emails.append(student.email)

        if officer:
            emails.append(officer.email)

        if emails:

            EmailService.send_email(
                to_emails=emails,
                subject="Complaint Reopened",
                html=EmailTemplates.complaint_reopened(
                    complaint
                )
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

        complaint.sla_status = (
            SLAService.get_sla_status(
                complaint
            )
        )

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

        NotificationService.create_notification(
            db=db,
            user_id=target_user.user_id,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_ESCALATED",
            title="Complaint Escalated",
            message=(
                f"Complaint "
                f"{complaint.complaint_code} "
                f"has been escalated to you."
            )
        )

        NotificationService.create_notification(
            db=db,
            user_id=complaint.created_by,
            complaint_id=complaint.complaint_id,
            notification_type="COMPLAINT_ESCALATED",
            title="Complaint Escalated",
            message=(
                f"Your complaint "
                f"{complaint.complaint_code} "
                f"has been escalated."
            )
        )

        student = (
            db.query(User)
            .filter(
                User.user_id == complaint.created_by
            )
            .first()
        )

        emails = []

        if student:
            emails.append(student.email)

        emails.append(target_user.email)

        EmailService.send_email(
            to_emails=emails,
            subject="Complaint Escalated",
            html=EmailTemplates.complaint_escalated(
                complaint
            )
        )

        return complaint