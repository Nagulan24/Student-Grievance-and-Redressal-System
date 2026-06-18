from sqlalchemy.orm import sessionmaker

from app.database.database import engine

# Session Factory

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Dependency

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()