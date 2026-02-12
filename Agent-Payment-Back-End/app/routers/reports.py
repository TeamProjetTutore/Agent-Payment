from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Bulletin, Enseignant, Payment
from app.deps import get_current_user
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/payments/pdf")
def payments_pdf(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Rapport des paiements (ancien système)"""
    file = "payments_report.pdf"
    c = canvas.Canvas(file, pagesize=A4)
    y = 800
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, y, "Rapport des Paiements")
    y -= 40
    
    c.setFont("Helvetica", 10)
    
    # Nouveaux bulletins
    bulletins = db.query(Bulletin).all()
    for b in bulletins:
        if y < 50:
            c.showPage()
            y = 800
        c.drawString(50, y, f"{b.mois_annee} - {b.enseignant.nom if b.enseignant else 'N/A'}: {b.montant_net:,.2f} CDF - {b.statut_paiement.value}")
        y -= 20
    
    c.save()
    return FileResponse(file, filename="rapport_paiements.pdf")

@router.get("/dashboard/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Statistiques pour le tableau de bord"""
    total_enseignants = db.query(Enseignant).count()
    total_bulletins = db.query(Bulletin).count()
    
    # Total payé ce mois
    from datetime import datetime
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    bulletins_mois = db.query(Bulletin).filter(
        Bulletin.mois == current_month,
        Bulletin.annee == current_year
    ).all()
    
    total_mois = sum(b.montant_net for b in bulletins_mois)
    payes_mois = sum(b.montant_net for b in bulletins_mois if b.statut_paiement.value == "Payé")
    
    return {
        "total_enseignants": total_enseignants,
        "total_bulletins": total_bulletins,
        "mois_actuel": f"{current_month:02d}/{current_year}",
        "masse_salariale_mois": total_mois,
        "montant_paye_mois": payes_mois,
        "en_attente_mois": total_mois - payes_mois
    }