from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Payment, Agent
from app.schemas import PaymentCreate, PaymentOut
from app.deps import get_current_user
from typing import List

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ CREATE payment
@router.post("/", response_model=PaymentOut)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Check agent exists
    agent = db.query(Agent).filter(Agent.id == payment.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    new_payment = Payment(
        amount=payment.amount,
        status=payment.status,
        agent_id=payment.agent_id
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment


# ✅ READ all payments
@router.get("/", response_model=List[PaymentOut])
def get_payments(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Payment).all()


# ✅ READ one payment
@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


# ✅ UPDATE payment
@router.put("/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: int,
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db_payment.amount = payment.amount
    db_payment.status = payment.status
    db_payment.agent_id = payment.agent_id

    db.commit()
    db.refresh(db_payment)

    return db_payment


# ✅ DELETE payment
@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db.delete(payment)
    db.commit()

    return {"message": "Payment deleted successfully"}

