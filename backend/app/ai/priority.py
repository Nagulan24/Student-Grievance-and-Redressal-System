class PriorityPredictor:

    @staticmethod
    def predict(
        category: str,
        sentiment: str
    ) -> str:
        """
        Predict complaint priority based on
        category and sentiment.
        """

        # Safety complaints are always critical
        if category == "SAFETY":
            return "CRITICAL"

        # High priority categories
        if category in [
            "HOSTEL",
            "EXAMINATION",
            "INFRASTRUCTURE"
        ]:

            if sentiment == "NEGATIVE":
                return "HIGH"

            return "MEDIUM"

        # Medium priority categories
        if category in [
            "ACADEMIC",
            "PLACEMENT",
            "TRANSPORTATION"
        ]:

            if sentiment == "NEGATIVE":
                return "MEDIUM"

            return "LOW"

        # Default
        return "LOW"