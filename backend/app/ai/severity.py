class SeverityCalculator:

    @staticmethod
    def calculate(
        category: str,
        priority: str,
        sentiment: str
    ) -> int:
        """
        Calculate a severity score (0-100)
        based on category, priority, and sentiment.
        """

        score = 0

        # Category Weight
        category_scores = {
            "SAFETY": 40,
            "HOSTEL": 30,
            "INFRASTRUCTURE": 25,
            "EXAMINATION": 25,
            "ACADEMIC": 20,
            "PLACEMENT": 20,
            "TRANSPORTATION": 20
        }

        score += category_scores.get(category, 10)

        # Priority Weight
        priority_scores = {
            "LOW": 10,
            "MEDIUM": 20,
            "HIGH": 35,
            "CRITICAL": 50
        }

        score += priority_scores.get(priority, 0)

        # Sentiment Weight
        sentiment_scores = {
            "POSITIVE": 5,
            "NEUTRAL": 10,
            "NEGATIVE": 20
        }

        score += sentiment_scores.get(sentiment, 0)

        # Maximum score = 100
        return min(score, 100)