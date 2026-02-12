from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Payment, Agent
from app.schemas import PaymentCreate, PaymentOut
from app.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments (Legacy)"])

@router.post("/", response_model=PaymentOut)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Vérifier l'agent existe
    agent = db.query(Agent).filter(Agent.id == payment.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    db_payment = Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[PaymentOut])
def get_payments(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Payment).all()