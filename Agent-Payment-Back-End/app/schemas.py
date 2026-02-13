# app/schemas.py
from typing import Optional
from pydantic import BaseModel
from datetime import date

# ---------- AUTH ----------
class LoginSchema(BaseModel):
    email: str
    password: str


# ---------- AGENTS ----------
class AgentCreate(BaseModel):
    name: str
    role: str
    salary: float = 0.0
    date_of_birth: Optional[date] = None
    email_address: Optional[str] = None
    phone_number: Optional[str] = None

class AgentOut(AgentCreate):
    id: int

    class Config:
        orm_mode = True


# ---------- PAYMENTS ----------
class PaymentCreate(BaseModel):
    agent_id: int
    amount: float
    payment_date: Optional[date] = None
    status: Optional[str] = None

class PaymentStatusUpdate(BaseModel):
    status: str

class PaymentOut(PaymentCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- DEBTS ----------
class DebtCreate(BaseModel):
    agent_id: int
    amount: float
    reason: str
    debt_date: Optional[date] = None

class DebtOut(DebtCreate):
    id: int

    class Config:
        from_attributes = True

