from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LoginSchema, TokenResponse
from app.models import User
from app.auth import verify_password, create_token, hash_password

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    # Recherche dans les utilisateurs admin/comptables
    user = db.query(User).filter(User.email == data.email).first()
    
    if user and verify_password(data.password, user.password):
        token = create_token({"sub": user.email, "role": user.role.value, "name": user.name})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role.value,
                "name": user.name
            }
        }
    
    # TODO: Ajouter l'authentification des enseignants par matricule
    # Pour l'instant, hardcoded admin pour test
    if data.email == "admin@school.com" and data.password == "123456":
        token = create_token({"sub": data.email, "role": "admin", "name": "Admin"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": data.email,
                "role": "admin",
                "name": "Administrateur"
            }
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.post("/setup-admin")
def setup_admin(db: Session = Depends(get_db)):
    """Route temporaire pour créer l'admin initial"""
    existing = db.query(User).filter(User.email == "admin@school.com").first()
    if existing:
        return {"message": "Admin already exists"}
    
    admin = User(
        email="admin@school.com",
        password=hash_password("123456"),
        role="admin",
        name="Administrateur"
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created successfully"}