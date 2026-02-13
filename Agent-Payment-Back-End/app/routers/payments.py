from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Payment, Agent
from app.schemas import PaymentCreate, PaymentOut, PaymentStatusUpdate
from app.deps import get_current_user
from typing import List
from datetime import date

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


# ✅ CREATE payment - FIXED
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

    # Check for duplicate payment in the same month (excluding cancelled payments)
    if payment.payment_date:
        from sqlalchemy import extract
        existing_payment = db.query(Payment).filter(
            Payment.agent_id == payment.agent_id,
            extract('month', Payment.payment_date) == payment.payment_date.month,
            extract('year', Payment.payment_date) == payment.payment_date.year,
            Payment.status != "Cancelled"  # Allow new payment if previous was cancelled
        ).first()

        if existing_payment:
             raise HTTPException(status_code=400, detail="Payment already exists for this agent in this month")

    new_payment = Payment(
        amount=payment.amount,
        status=payment.status,
        payment_date=payment.payment_date,  # ← ADDED
        agent_id=payment.agent_id
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment


# # ✅ READ all payments - WITH VALIDATION
@router.get("/", response_model=List[PaymentOut])
def get_payments(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    payments = db.query(Payment).all()
    
    # Debug: Check for NULL dates
    for payment in payments:
        if payment.payment_date is None:
            print(f"WARNING: Payment ID {payment.id} has NULL payment_date")
            # Optionally set a default
            payment.payment_date = date.today()
    
    return payments


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


# ✅ UPDATE payment - FIXED
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
    db_payment.payment_date = payment.payment_date  # ← ADDED
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

# Add to payments.py for debugging
@router.get("/debug/payments")
def debug_payments(db: Session = Depends(get_db)):
    """Debug endpoint to see raw payment data"""
    payments = db.query(Payment).all()
    
    result = []
    for payment in payments:
        result.append({
            "id": payment.id,
            "amount": payment.amount,
            "payment_date": str(payment.payment_date),  # Convert to string
            "payment_date_is_none": payment.payment_date is None,
            "status": payment.status,
            "agent_id": payment.agent_id
        })
    
    return {"payments": result, "count": len(payments)}


# ✅ PATCH payment status
@router.patch("/{payment_id}/status")
def update_payment_status(
    payment_id: int,
    status_update: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = status_update.status
    db.commit()
    return {"message": "Status updated successfully", "status": payment.status}
