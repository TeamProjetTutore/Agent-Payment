import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import LoginSchema
from app.database import SessionLocal
from app.auth import create_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@school.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "123456")

@router.post("/login")
def login(data: LoginSchema):
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:
        token = create_token({"sub": data.email, "role": "admin"})
        return {
            "access_token": token,
            "user": {
                "email": data.email,
                "role": "admin",
                "name": "Admin"
            }
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")

