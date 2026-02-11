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
