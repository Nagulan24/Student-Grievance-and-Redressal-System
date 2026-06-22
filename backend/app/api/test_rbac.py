from fastapi import (
    APIRouter,
    Depends
)

from app.dependencies.auth_dependency import (
    get_current_user
)

from app.core.permissions import (
    require_roles,
    ROLE_STUDENT,
    ROLE_PRINCIPAL
)

router = APIRouter(
    prefix="/test",
    tags=["RBAC Test"]
)


@router.get("/student")
def student_endpoint(
    current_user=Depends(get_current_user)
):

    require_roles(
        ROLE_STUDENT
    )(current_user)

    return {
        "message": "Student Access Granted"
    }


@router.get("/principal")
def principal_endpoint(
    current_user=Depends(get_current_user)
):

    require_roles(
        ROLE_PRINCIPAL
    )(current_user)

    return {
        "message": "Principal Access Granted"
    }