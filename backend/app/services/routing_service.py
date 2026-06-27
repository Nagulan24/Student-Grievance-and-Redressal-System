from sqlalchemy.orm import Session

from app.models.user import User


class RoutingService:

    CATEGORY_ROLE_MAP = {

        "ACADEMIC": "DEPARTMENT_OFFICER",

        "INFRASTRUCTURE": "INFRASTRUCTURE_OFFICER",

        "HOSTEL": "HOSTEL_WARDEN",

        "EXAMINATION": "EXAMINATION_OFFICER",

        "PLACEMENT": "PLACEMENT_OFFICER",

        "TRANSPORTATION": "TRANSPORT_OFFICER",

        "SAFETY": "STUDENT_AFFAIRS"
    }

    @staticmethod
    def get_officer_for_category(
        db: Session,
        category: str,
        department_id: int = None
    ):

        role = RoutingService.CATEGORY_ROLE_MAP.get(category)

        if not role:
            return None

        query = (
            db.query(User)
            .filter(
                User.role == role,
                User.is_active == True
            )
        )

        # Academic complaints can be routed by department
        if (
            category == "ACADEMIC"
            and department_id is not None
        ):
            query = query.filter(
                User.department_id == department_id
            )

        return query.first()