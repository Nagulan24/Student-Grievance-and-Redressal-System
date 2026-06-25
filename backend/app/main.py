from fastapi import FastAPI
import app.models
from app.core.config import APP_NAME

from app.api.auth import (
    router as auth_router
)

from app.api.complaints import (
    router as complaint_router
)

from app.api.history import (
    router as history_router
)

app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    description="Intelligent Student Wellbeing & Grievance Ecosystem API"
)

app.include_router(auth_router)

app.include_router(
    complaint_router
)

app.include_router(
    history_router
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