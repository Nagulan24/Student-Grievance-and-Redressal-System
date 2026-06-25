from sqlalchemy.orm import Session

from app.models.complaint_history import (
    ComplaintHistory
)


class HistoryService:

    @staticmethod
    def create_history(
        db: Session,
        complaint_id: int,
        action_type: str,
        performed_by: int,
        old_status: str = None,
        new_status: str = None,
        remarks: str = None
    ):

        history = ComplaintHistory(

            complaint_id=complaint_id,

            action_type=action_type,

            old_status=old_status,

            new_status=new_status,

            remarks=remarks,

            performed_by=performed_by
        )

        db.add(history)

        db.commit()

        db.refresh(history)

        return history

    @staticmethod
    def get_complaint_history(
        db: Session,
        complaint_id: int
    ):

        return (
            db.query(ComplaintHistory)
            .filter(
                ComplaintHistory.complaint_id ==
                complaint_id
            )
            .order_by(
                ComplaintHistory.created_at.asc()
            )
            .all()
        )