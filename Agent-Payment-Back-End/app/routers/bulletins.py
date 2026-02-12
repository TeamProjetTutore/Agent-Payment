from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Bulletin, Enseignant, LigneBulletin, ElementRemuneration
from app.schemas import BulletinCreate, BulletinOut, BulletinUpdate, CalculSalaireRequest
from app.deps import accountant_or_admin, get_current_user, admin_only  # ← AJOUTÉ admin_only
from app.calcul_paie import generer_bulletin_paie
from app.pdf_generator import generate_bulletin_pdf
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/bulletins", tags=["Bulletins de Paie"])

@router.post("/calculer", response_model=BulletinOut)
def calculer_bulletin(
    data: CalculSalaireRequest,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    """Génère un bulletin avec calcul automatique"""
    try:
        bulletin, details = generer_bulletin_paie(
            db=db,
            enseignant_id=data.enseignant_id,
            mois=data.mois,
            annee=data.annee,
            elements_ids=data.primes + data.retenues
        )
        return bulletin
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul: {str(e)}")

@router.get("/", response_model=List[BulletinOut])
def get_bulletins(
    enseignant_id: Optional[int] = None,
    mois: Optional[int] = None,
    annee: Optional[int] = None,
    statut: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Bulletin)
    
    if enseignant_id:
        query = query.filter(Bulletin.enseignant_id == enseignant_id)
    if mois:
        query = query.filter(Bulletin.mois == mois)
    if annee:
        query = query.filter(Bulletin.annee == annee)
    if statut:
        query = query.filter(Bulletin.statut_paiement == statut)
    
    return query.order_by(Bulletin.mois_annee.desc()).all()

@router.get("/{bulletin_id}", response_model=BulletinOut)
def get_bulletin(
    bulletin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin non trouvé")
    return bulletin

@router.put("/{bulletin_id}", response_model=BulletinOut)
def update_bulletin(
    bulletin_id: int,
    data: BulletinUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin non trouvé")
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bulletin, field, value)
    
    db.commit()
    db.refresh(bulletin)
    return bulletin

@router.post("/{bulletin_id}/payer", response_model=BulletinOut)
def marquer_paye(
    bulletin_id: int,
    mode_paiement: str,
    db: Session = Depends(get_db),
    current_user=Depends(accountant_or_admin)
):
    """Marque un bulletin comme payé"""
    bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin non trouvé")
    
    from datetime import datetime
    bulletin.statut_paiement = "Payé"
    bulletin.mode_paiement = mode_paiement
    bulletin.date_paiement = datetime.now()
    
    db.commit()
    db.refresh(bulletin)
    return bulletin

@router.get("/{bulletin_id}/pdf")
def export_pdf(
    bulletin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Exporte un bulletin en PDF"""
    bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin non trouvé")
    
    filename = generate_bulletin_pdf(bulletin)
    
    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=f"bulletin_{bulletin.enseignant.matricule_dinacope}_{bulletin.mois_annee}.pdf"
    )

@router.delete("/{bulletin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bulletin(
    bulletin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)  # ← Utilisé ici, donc besoin de l'import
):
    bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin non trouvé")
    
    db.delete(bulletin)
    db.commit()
    return None