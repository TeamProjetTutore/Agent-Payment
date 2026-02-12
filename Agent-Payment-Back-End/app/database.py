from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Encodage correct du mot de passe avec @ -> %40
DATABASE_URL = "postgresql://postgres:%40%40%40%40@localhost:5432/schoolpay"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()