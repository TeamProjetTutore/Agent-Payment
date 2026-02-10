# app/schemas.py
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

class AgentOut(AgentCreate):
    id: int

    class Config:
        orm_mode = True


# ---------- PAYMENTS ----------
class PaymentCreate(BaseModel):
    agent_id: int
    amount: float
    payment_date: date

class PaymentOut(PaymentCreate):
    id: int

    class Config:
        orm_mode = True
