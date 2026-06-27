from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.dependencies.auth_dependency import (
    get_current_user
)

from app.models.complaint import Complaint

from app.schemas.sla import (
    SLAResponse,
    OverdueComplaintResponse
)

from app.services.sla_service import SLAService


router = APIRouter(
    prefix="/sla",
    tags=["SLA"]
)


@router.get(
    "/{complaint_id}",
    response_model=SLAResponse
)
def get_sla_details(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id == complaint_id
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    return SLAResponse(

        complaint_id=complaint.complaint_id,

        complaint_code=complaint.complaint_code,

        sla_deadline=complaint.sla_deadline,

        sla_status=SLAService.get_sla_status(
            complaint
        ),

        response_time=complaint.response_time,

        resolution_time=complaint.resolution_time,

        remaining_time=SLAService.calculate_remaining_time(
            complaint
        )
    )


@router.get(
    "/overdue/list",
    response_model=list[OverdueComplaintResponse]
)
def get_overdue_complaints(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    complaints = (
        db.query(Complaint)
        .all()
    )

    overdue = []

    for complaint in complaints:

        if SLAService.is_overdue(
            complaint
        ):

            overdue.append(

                OverdueComplaintResponse(

                    complaint_id=complaint.complaint_id,

                    complaint_code=complaint.complaint_code,

                    category=complaint.category,

                    priority=complaint.priority,

                    status=complaint.status,

                    current_owner=complaint.current_owner,

                    sla_deadline=complaint.sla_deadline,

                    remaining_time=SLAService.calculate_remaining_time(
                        complaint
                    )
                )
            )

    return overdue