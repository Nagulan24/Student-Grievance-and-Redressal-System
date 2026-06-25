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

from app.schemas.history import (
    HistoryResponse
)

from app.services.history_service import (
    HistoryService
)

from app.services.complaint_service import (
    ComplaintService
)


router = APIRouter(
    prefix="/complaints",
    tags=["Complaint History"]
)


# ==========================
# GET COMPLAINT HISTORY
# ==========================

@router.get(
    "/{complaint_id}/history",
    response_model=list[HistoryResponse]
)
def get_complaint_history(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        # Verify ownership / access

        ComplaintService.get_complaint_by_id(
            db=db,
            complaint_id=complaint_id,
            current_user=current_user
        )

        history = (
            HistoryService
            .get_complaint_history(
                db=db,
                complaint_id=complaint_id
            )
        )

        return history

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )