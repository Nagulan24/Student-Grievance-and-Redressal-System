from fastapi import FastAPI

from app.core.config import APP_NAME


app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    description="Intelligent Student Wellbeing & Grievance Ecosystem API"
)


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Student Grievance Ecosystem API Running Successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }