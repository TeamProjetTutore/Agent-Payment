import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use Environment Variable for production, fallback to local for development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Ch%40rLyv34@localhost:5432/schoolpay")

# Fix for Render: sqlalchemy requires 'postgresql://', but Render providing 'postgres://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
