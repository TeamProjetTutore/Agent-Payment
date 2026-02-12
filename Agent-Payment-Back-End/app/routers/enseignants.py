from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Enseignant, Grade, Etablissement
from app.schemas import EnseignantCreate, EnseignantUpdate, EnseignantOut
from app.deps import accountant_or_admin, get_current_user
from app.auth import hash_password

router = APIRouter(prefix="/enseignants", tags=["Enseignants"])

@router.post("/", response_model=EnseignantOut, status_code=status.HTTP_201_CREATED)
def create_enseignant(
    data: EnseignantCreate,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    # Vérifier l'unicité du matricule
    existing = db.query(Enseignant).filter(
        Enseignant.matricule_dinacope == data.matricule_dinacope
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Matricule {data.matricule_dinacope} déjà utilisé"
        )
    
    # Vérifier l'existence du grade
    grade = db.query(Grade).filter(Grade.id == data.grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade non trouvé")
    
    # Vérifier l'existence de l'école
    ecole = db.query(Etablissement).filter(Etablissement.id == data.ecole_id).first()
    if not ecole:
        raise HTTPException(status_code=404, detail="Établissement non trouvé")
    
    enseignant = Enseignant(**data.dict(exclude={'password'}))
    if data.password:
        enseignant.password_hash = hash_password(data.password)
    
    db.add(enseignant)
    db.commit()
    db.refresh(enseignant)
    return enseignant

@router.get("/", response_model=List[EnseignantOut])
def get_enseignants(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    ecole_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Enseignant)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Enseignant.nom.ilike(search_filter)) |
            (Enseignant.prenom.ilike(search_filter)) |
            (Enseignant.matricule_dinacope.ilike(search_filter))
        )
    
    if ecole_id:
        query = query.filter(Enseignant.ecole_id == ecole_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{enseignant_id}", response_model=EnseignantOut)
def get_enseignant(
    enseignant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")
    return enseignant

@router.put("/{enseignant_id}", response_model=EnseignantOut)
def update_enseignant(
    enseignant_id: int,
    data: EnseignantUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enseignant, field, value)
    
    db.commit()
    db.refresh(enseignant)
    return enseignant

@router.delete("/{enseignant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enseignant(
    enseignant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")
    
    db.delete(enseignant)
    db.commit()
    return None