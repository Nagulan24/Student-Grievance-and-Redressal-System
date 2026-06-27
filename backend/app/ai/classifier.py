class ComplaintClassifier:

    @staticmethod
    def predict(text: str) -> str:
        """
        Predict complaint category based on keywords.
        Returns one of the complaint categories.
        """

        text = text.lower()

        categories = {

            "ACADEMIC": [
                "teacher",
                "faculty",
                "professor",
                "class",
                "lecture",
                "attendance",
                "mark",
                "marks",
                "assignment",
                "internal",
                "course",
                "subject",
                "lab",
                "semester"
            ],

            "INFRASTRUCTURE": [
                "fan",
                "light",
                "bench",
                "desk",
                "chair",
                "classroom",
                "building",
                "water",
                "toilet",
                "restroom",
                "wifi",
                "internet",
                "network",
                "projector",
                "electricity",
                "lift"
            ],

            "HOSTEL": [
                "hostel",
                "room",
                "mess",
                "food",
                "warden",
                "bathroom",
                "washroom",
                "bed",
                "cleaning",
                "laundry"
            ],

            "EXAMINATION": [
                "exam",
                "result",
                "hall ticket",
                "question paper",
                "invigilator",
                "valuation",
                "revaluation",
                "answer sheet"
            ],

            "PLACEMENT": [
                "placement",
                "internship",
                "company",
                "recruitment",
                "interview",
                "job",
                "career"
            ],

            "TRANSPORTATION": [
                "bus",
                "transport",
                "driver",
                "van",
                "route",
                "pickup",
                "drop"
            ],

            "SAFETY": [
                "ragging",
                "harassment",
                "bullying",
                "fight",
                "violence",
                "unsafe",
                "security",
                "threat",
                "abuse",
                "emergency"
            ]
        }

        for category, keywords in categories.items():

            if any(keyword in text for keyword in keywords):

                return category

        # Default category
        return "ACADEMIC"