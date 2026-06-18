from sqlalchemy import create_engine

from app.core.config import (
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
)

# MySQL Connection URL

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# SQLAlchemy Engine

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)