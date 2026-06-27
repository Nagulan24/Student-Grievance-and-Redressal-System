class WorkflowRouter:

    @staticmethod
    def get_workflow(category: str) -> str:
        """
        Return the workflow type based on
        the complaint category.
        """

        workflows = {

            "ACADEMIC": "ACADEMIC_WORKFLOW",

            "INFRASTRUCTURE": "INFRASTRUCTURE_WORKFLOW",

            "HOSTEL": "HOSTEL_WORKFLOW",

            "EXAMINATION": "EXAMINATION_WORKFLOW",

            "PLACEMENT": "PLACEMENT_WORKFLOW",

            "TRANSPORTATION": "TRANSPORTATION_WORKFLOW",

            "SAFETY": "SAFETY_WORKFLOW"

        }

        return workflows.get(
            category,
            "GENERAL_WORKFLOW"
        )

    @staticmethod
    def get_default_role(category: str) -> str:
        """
        Return the default staff role responsible
        for the complaint category.
        """

        roles = {

            "ACADEMIC": "DEPARTMENT_OFFICER",

            "INFRASTRUCTURE": "INFRASTRUCTURE_OFFICER",

            "HOSTEL": "HOSTEL_WARDEN",

            "EXAMINATION": "EXAMINATION_OFFICER",

            "PLACEMENT": "PLACEMENT_OFFICER",

            "TRANSPORTATION": "TRANSPORT_OFFICER",

            "SAFETY": "GRIEVANCE_ADMIN"

        }

        return roles.get(
            category,
            "GRIEVANCE_ADMIN"
        )