from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from app.database import SessionLocal
from app.models import Payment
from fastapi.responses import FileResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/payments/pdf")
def payments_pdf():
    file = "payments.pdf"
    c = canvas.Canvas(file, pagesize=A4)
    y = 800

    c.drawString(200, y, "Payments Report")
    y -= 40

    db = SessionLocal()
    payments = db.query(Payment).all()

    for p in payments:
        c.drawString(50, y, f"Agent ID: {p.agent_id} | Amount: {p.amount} | {p.status}")
        y -= 20

    c.save()
    return FileResponse(file, filename="payments.pdf")
