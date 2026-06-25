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

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintDetailResponse,
    AssignmentRequest,
    AssignmentResponse,
    StatusUpdateRequest,
    StatusUpdateResponse,
    ResolveRequest,
    CloseRequest,
    ReopenRequest,
    EscalateRequest
)

from app.services.complaint_service import (
    ComplaintService
)


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)



@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED
)
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        complaint = ComplaintService.create_complaint(
            db=db,
            complaint_data=complaint_data,
            current_user=current_user
        )

        return complaint

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/my",
    response_model=list[ComplaintResponse]
)
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ComplaintService.get_my_complaints(
        db=db,
        current_user=current_user
    )

@router.get(
    "/{complaint_id}",
    response_model=ComplaintDetailResponse
)
def get_complaint_details(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.get_complaint_by_id(
            db=db,
            complaint_id=complaint_id,
            current_user=current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
@router.post(
    "/{complaint_id}/assign",
    response_model=AssignmentResponse
)
def assign_complaint(
    complaint_id: int,
    request: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.assign_complaint(
            db=db,
            complaint_id=complaint_id,
            assigned_to=request.assigned_to,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.patch(
    "/{complaint_id}/status",
    response_model=StatusUpdateResponse
)
def update_status(
    complaint_id: int,
    request: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.update_status(
            db=db,
            complaint_id=complaint_id,
            status=request.status.value,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post(
    "/{complaint_id}/resolve",
    response_model=ComplaintDetailResponse
)
def resolve_complaint(
    complaint_id: int,
    request: ResolveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.resolve_complaint(
            db=db,
            complaint_id=complaint_id,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post(
    "/{complaint_id}/close",
    response_model=ComplaintDetailResponse
)
def close_complaint(
    complaint_id: int,
    request: CloseRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.close_complaint(
            db=db,
            complaint_id=complaint_id,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post(
    "/{complaint_id}/reopen",
    response_model=ComplaintDetailResponse
)
def reopen_complaint(
    complaint_id: int,
    request: ReopenRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.reopen_complaint(
            db=db,
            complaint_id=complaint_id,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post(
    "/{complaint_id}/escalate",
    response_model=ComplaintDetailResponse
)
def escalate_complaint(
    complaint_id: int,
    request: EscalateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return ComplaintService.escalate_complaint(
            db=db,
            complaint_id=complaint_id,
            to_user_id=request.to_user_id,
            current_user=current_user,
            remarks=request.remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )