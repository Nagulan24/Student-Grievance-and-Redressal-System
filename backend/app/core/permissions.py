from fastapi import HTTPException, status


# ==========================
# ROLE CONSTANTS
# ==========================

ROLE_STUDENT = "STUDENT"

ROLE_GRIEVANCE_ADMIN = "GRIEVANCE_ADMIN"

ROLE_DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER"

ROLE_INFRASTRUCTURE_OFFICER = "INFRASTRUCTURE_OFFICER"

ROLE_HOSTEL_WARDEN = "HOSTEL_WARDEN"

ROLE_EXAMINATION_OFFICER = "EXAMINATION_OFFICER"

ROLE_PLACEMENT_OFFICER = "PLACEMENT_OFFICER"

ROLE_PLACEMENT_HEAD = "PLACEMENT_HEAD"

ROLE_TRANSPORT_OFFICER = "TRANSPORT_OFFICER"

ROLE_TRANSPORT_HEAD = "TRANSPORT_HEAD"

ROLE_HOD = "HOD"

ROLE_DEAN = "DEAN"

ROLE_STUDENT_AFFAIRS = "STUDENT_AFFAIRS"

ROLE_PRINCIPAL = "PRINCIPAL"


# ==========================
# ROLE CHECK FUNCTION
# ==========================

def require_roles(*allowed_roles):
    """
    Role-Based Access Control (RBAC)

    Example:
        require_roles(
            ROLE_PRINCIPAL,
            ROLE_DEAN
        )(current_user)
    """

    def role_checker(current_user):

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied"
            )

        return current_user

    return role_checker