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

from app.schemas.dashboard import (
    DashboardSummary,
    CategoryAnalytics,
    PriorityAnalytics,
    StatusAnalytics
)

from app.services.analytics_service import (
    AnalyticsService
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =====================================================
# DASHBOARD SUMMARY
# =====================================================

@router.get(
    "/summary",
    response_model=DashboardSummary
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role not in [
        "GRIEVANCE_ADMIN",
        "PRINCIPAL",
        "DEAN",
        "STUDENT_AFFAIRS"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return AnalyticsService.get_dashboard_summary(
        db=db
    )


# =====================================================
# CATEGORY ANALYTICS
# =====================================================

@router.get(
    "/category",
    response_model=list[CategoryAnalytics]
)
def get_category_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role not in [
        "GRIEVANCE_ADMIN",
        "PRINCIPAL",
        "DEAN",
        "STUDENT_AFFAIRS"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return AnalyticsService.get_category_analytics(
        db=db
    )


# =====================================================
# PRIORITY ANALYTICS
# =====================================================

@router.get(
    "/priority",
    response_model=list[PriorityAnalytics]
)
def get_priority_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role not in [
        "GRIEVANCE_ADMIN",
        "PRINCIPAL",
        "DEAN",
        "STUDENT_AFFAIRS"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return AnalyticsService.get_priority_analytics(
        db=db
    )


# =====================================================
# STATUS ANALYTICS
# =====================================================

@router.get(
    "/status",
    response_model=list[StatusAnalytics]
)
def get_status_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role not in [
        "GRIEVANCE_ADMIN",
        "PRINCIPAL",
        "DEAN",
        "STUDENT_AFFAIRS"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return AnalyticsService.get_status_analytics(
        db=db
    )