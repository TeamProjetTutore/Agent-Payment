from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)  # admin / accountant


class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    role = Column(String)
    salary = Column(Float, default=0.0)
    date_of_birth = Column(Date, nullable=True)
    email_address = Column(String, unique=True, nullable=True)
    phone_number = Column(String, unique=True, nullable=True)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    status = Column(String)
    payment_date = Column(Date, nullable=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))


class Debt(Base):
    __tablename__ = "debts"
    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    reason = Column(String)
    debt_date = Column(Date, nullable=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))

