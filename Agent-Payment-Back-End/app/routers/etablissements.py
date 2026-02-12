from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Etablissement, Province
from app.schemas import EtablissementCreate, EtablissementOut, ProvinceCreate, ProvinceOut
from app.deps import admin_only, get_current_user

router = APIRouter(prefix="/etablissements", tags=["Etablissements"])

# Provinces
@router.post("/provinces", response_model=ProvinceOut, status_code=status.HTTP_201_CREATED)
def create_province(
    data: ProvinceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    province = Province(**data.dict())
    db.add(province)
    db.commit()
    db.refresh(province)
    return province

@router.get("/provinces", response_model=List[ProvinceOut])
def get_provinces(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Province).all()

# Etablissements
@router.post("/", response_model=EtablissementOut, status_code=status.HTTP_201_CREATED)
def create_etablissement(
    data: EtablissementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    # Vérifier la province
    province = db.query(Province).filter(Province.id == data.province_id).first()
    if not province:
        raise HTTPException(status_code=404, detail="Province non trouvée")
    
    etablissement = Etablissement(**data.dict())
    db.add(etablissement)
    db.commit()
    db.refresh(etablissement)
    return etablissement

@router.get("/", response_model=List[EtablissementOut])
def get_etablissements(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Etablissement).all()

@router.get("/{etablissement_id}", response_model=EtablissementOut)
def get_etablissement(
    etablissement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    etab = db.query(Etablissement).filter(Etablissement.id == etablissement_id).first()
    if not etab:
        raise HTTPException(status_code=404, detail="Établissement non trouvé")
    return etab