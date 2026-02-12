from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ElementRemuneration
from app.schemas import ElementRemunerationCreate, ElementRemunerationOut, TypeElement
from app.deps import admin_only, get_current_user

router = APIRouter(prefix="/elements", tags=["Elements de Rémunération"])

@router.post("/", response_model=ElementRemunerationOut, status_code=status.HTTP_201_CREATED)
def create_element(
    data: ElementRemunerationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    element = ElementRemuneration(**data.dict())
    db.add(element)
    db.commit()
    db.refresh(element)
    return element

@router.get("/", response_model=List[ElementRemunerationOut])
def get_elements(
    type_filter: TypeElement = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(ElementRemuneration)
    if type_filter:
        query = query.filter(ElementRemuneration.type == type_filter)
    return query.all()

@router.get("/{element_id}", response_model=ElementRemunerationOut)
def get_element(
    element_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    element = db.query(ElementRemuneration).filter(ElementRemuneration.id == element_id).first()
    if not element:
        raise HTTPException(status_code=404, detail="Élément non trouvé")
    return element