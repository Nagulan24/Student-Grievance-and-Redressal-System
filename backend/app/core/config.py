from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()


# ==========================
# DATABASE CONFIGURATION
# ==========================

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# ==========================
# JWT CONFIGURATION
# ==========================

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)


# ==========================
# SMTP CONFIGURATION
# ==========================

SMTP_SERVER = os.getenv("SMTP_SERVER")

SMTP_PORT = int(
    os.getenv("SMTP_PORT", 587)
)

SMTP_EMAIL = os.getenv("SMTP_EMAIL")

SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# ==========================
# RESEND CONFIGURATION
# ==========================

RESEND_API_KEY = os.getenv(
    "RESEND_API_KEY"
)

EMAIL_FROM = os.getenv(
    "EMAIL_FROM"
)

# ==========================
# APPLICATION CONFIGURATION
# ==========================

APP_NAME = os.getenv("APP_NAME")

DEBUG = os.getenv(
    "DEBUG",
    "False"
).lower() == "true"


# ==========================
# FILE UPLOAD CONFIGURATION
# ==========================

UPLOAD_DIR = os.getenv("UPLOAD_DIR")

MAX_IMAGE_SIZE_MB = int(
    os.getenv("MAX_IMAGE_SIZE_MB", 10)
)

MAX_VIDEO_SIZE_MB = int(
    os.getenv("MAX_VIDEO_SIZE_MB", 100)
)

MAX_AUDIO_SIZE_MB = int(
    os.getenv("MAX_AUDIO_SIZE_MB", 20)
)

MAX_PDF_SIZE_MB = int(
    os.getenv("MAX_PDF_SIZE_MB", 20)
)


# ==========================
# AI CONFIGURATION
# ==========================

SENTIMENT_MODEL = os.getenv(
    "SENTIMENT_MODEL"
)