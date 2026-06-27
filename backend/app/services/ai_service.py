from app.ai.priority import PriorityPredictor
from app.ai.sentiment import SentimentAnalyzer
from app.ai.severity import SeverityCalculator
from app.ai.router import WorkflowRouter


class AIService:

    @staticmethod
    def analyze_complaint(
        title: str,
        description: str,
        category: str
    ):

        text = f"{title} {description}"

        sentiment = SentimentAnalyzer.predict(text)

        priority = PriorityPredictor.predict(
            category=category,
            sentiment=sentiment
        )

        severity = SeverityCalculator.calculate(
            category=category,
            priority=priority,
            sentiment=sentiment
        )

        workflow = WorkflowRouter.get_workflow(category)

        return {
            "priority": priority,
            "severity_score": severity,
            "workflow_type": workflow,
            "sentiment": sentiment
        }