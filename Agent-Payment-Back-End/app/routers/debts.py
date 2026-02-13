from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Debt
from app.schemas import DebtCreate, DebtOut
from app.deps import admin_only

router = APIRouter(prefix="/debts", tags=["Debts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=DebtOut)
def create_debt(debt: DebtCreate, db: Session = Depends(get_db), user=Depends(admin_only)):
    from app.models import Payment
    from sqlalchemy import extract, func
    from fastapi import HTTPException

    # Check for existing payment in the same month/year
    if not debt.debt_date:
        from datetime import date
        target_date = date.today()
    else:
        target_date = debt.debt_date

    existing_payment = db.query(Payment).filter(
        Payment.agent_id == debt.agent_id,
        extract('month', Payment.payment_date) == target_date.month,
        extract('year', Payment.payment_date) == target_date.year
    ).first()

    if existing_payment:
        if existing_payment.status.lower() == "completed":
            raise HTTPException(
                status_code=400, 
                detail="Debt cannot be created: A completed payment already exists for this month."
            )
        elif existing_payment.status.lower() == "pending":
            # Subtract debt amount from the pending payment
            existing_payment.amount -= debt.amount
            if existing_payment.amount < 0:
                existing_payment.amount = 0
            db.add(existing_payment)

    new_debt = Debt(**debt.dict())
    db.add(new_debt)
    db.commit()
    db.refresh(new_debt)
    return new_debt

@router.get("/", response_model=list[DebtOut])
def get_debts(db: Session = Depends(get_db)):
    return db.query(Debt).all()

@router.delete("/{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db), user=Depends(admin_only)):
    debt = db.get(Debt, debt_id)
    if not debt:
        return {"error": "Debt not found"}
    db.delete(debt)
    db.commit()
    return {"message": "Debt deleted"}
