class SentimentAnalyzer:

    @staticmethod
    def predict(text: str) -> str:
        """
        Predict the sentiment of a complaint.

        Returns:
            POSITIVE
            NEUTRAL
            NEGATIVE
        """

        text = text.lower()

        positive_keywords = [
            "good",
            "great",
            "excellent",
            "thank",
            "thanks",
            "resolved",
            "fixed",
            "happy",
            "satisfied",
            "appreciate"
        ]

        negative_keywords = [
            "bad",
            "poor",
            "worst",
            "broken",
            "damage",
            "issue",
            "problem",
            "delay",
            "late",
            "dirty",
            "unsafe",
            "harassment",
            "ragging",
            "fight",
            "violence",
            "abuse",
            "angry",
            "complaint",
            "frustrated",
            "disappointed",
            "water leakage",
            "no water",
            "no electricity",
            "fan not working",
            "wifi not working"
        ]

        positive_score = sum(
            keyword in text
            for keyword in positive_keywords
        )

        negative_score = sum(
            keyword in text
            for keyword in negative_keywords
        )

        if negative_score > positive_score:
            return "NEGATIVE"

        if positive_score > negative_score:
            return "POSITIVE"

        return "NEUTRAL"