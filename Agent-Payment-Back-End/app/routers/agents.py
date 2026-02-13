from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Agent, Payment, Debt
from app.schemas import AgentCreate, AgentOut
from app.deps import admin_only

router = APIRouter(prefix="/agents", tags=["Agents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AgentOut)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db), user=Depends(admin_only)):
    # Check for duplicate email
    if agent.email_address:
        existing_email = db.query(Agent).filter(Agent.email_address == agent.email_address).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="An agent with this email address already exists.")
    
    # Check for duplicate phone number
    if agent.phone_number:
        existing_phone = db.query(Agent).filter(Agent.phone_number == agent.phone_number).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="An agent with this phone number already exists.")
        
    new_agent = Agent(**agent.dict())
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent

@router.get("/", response_model=list[AgentOut])
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()

@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db), user=Depends(admin_only)):
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Delete related records to maintain integrity
    db.query(Payment).filter(Payment.agent_id == agent_id).delete()
    db.query(Debt).filter(Debt.agent_id == agent_id).delete()
    
    db.delete(agent)
    db.commit()
    return {"message": "Agent deleted"}

@router.put("/{agent_id}", response_model=AgentOut)
def update_agent(agent_id: int, agent_data: AgentCreate, db: Session = Depends(get_db), user=Depends(admin_only)):
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check for duplicate email (excluding current agent)
    if agent_data.email_address:
        duplicate_email = db.query(Agent).filter(
            Agent.email_address == agent_data.email_address,
            Agent.id != agent_id
        ).first()
        if duplicate_email:
            raise HTTPException(status_code=400, detail="Another agent with this email address already exists.")
    
    # Check for duplicate phone number (excluding current agent)
    if agent_data.phone_number:
        duplicate_phone = db.query(Agent).filter(
            Agent.phone_number == agent_data.phone_number,
            Agent.id != agent_id
        ).first()
        if duplicate_phone:
            raise HTTPException(status_code=400, detail="Another agent with this phone number already exists.")
    
    agent.name = agent_data.name
    agent.role = agent_data.role
    agent.salary = agent_data.salary
    agent.date_of_birth = agent_data.date_of_birth
    agent.email_address = agent_data.email_address
    agent.phone_number = agent_data.phone_number
    
    db.commit()
    db.refresh(agent)
    return agent
