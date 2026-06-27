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

from app.schemas.notification import (
    NotificationResponse
)

from app.services.notification_service import (
    NotificationService
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =====================================================
# GET MY NOTIFICATIONS
# =====================================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return NotificationService.get_notifications(
        db=db,
        user_id=current_user.user_id
    )


# =====================================================
# MARK NOTIFICATION AS READ
# =====================================================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return NotificationService.mark_as_read(
            db=db,
            notification_id=notification_id,
            user_id=current_user.user_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# =====================================================
# GET UNREAD COUNT
# =====================================================

@router.get(
    "/unread/count"
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return {

        "unread_count": NotificationService.get_unread_count(
            db=db,
            user_id=current_user.user_id
        )

    }