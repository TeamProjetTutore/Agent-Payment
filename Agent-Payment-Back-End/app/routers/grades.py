from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Grade
from app.schemas import GradeCreate, GradeOut
from app.deps import admin_only, get_current_user

router = APIRouter(prefix="/grades", tags=["Grades"])

@router.post("/", response_model=GradeOut, status_code=status.HTTP_201_CREATED)
def create_grade(
    data: GradeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    # Vérifier l'unicité du libellé
    existing = db.query(Grade).filter(Grade.libelle == data.libelle).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce grade existe déjà")
    
    grade = Grade(**data.dict())
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

@router.get("/", response_model=List[GradeOut])
def get_grades(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Grade).all()

@router.get("/{grade_id}", response_model=GradeOut)
def get_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade non trouvé")
    return grade

@router.put("/{grade_id}", response_model=GradeOut)
def update_grade(
    grade_id: int,
    data: GradeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade non trouvé")
    
    for field, value in data.dict().items():
        setattr(grade, field, value)
    
    db.commit()
    db.refresh(grade)
    return grade

@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade non trouvé")
    
    db.delete(grade)
    db.commit()
    return None