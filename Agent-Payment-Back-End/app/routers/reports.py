from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from app.database import SessionLocal
from app.models import Payment, Agent, Debt
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from typing import Optional
from datetime import date, datetime
import os
import io

router = APIRouter(prefix="/reports", tags=["Reports"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper to generate a generic PDF table header
def draw_header(c, title):
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(300, 800, "AgentPay Management System")
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(300, 770, title)
    c.setFont("Helvetica", 10)
    c.drawCentredString(300, 750, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.line(50, 740, 550, 740)

@router.get("/agents/pdf")
def agents_pdf(db: Session = Depends(get_db)):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    draw_header(c, "List of Agents")
    
    y = 700
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "ID")
    c.drawString(100, y, "Name")
    c.drawString(250, y, "Role")
    c.drawString(400, y, "Salary")
    
    y -= 20
    c.line(50, y+15, 550, y+15)
    c.setFont("Helvetica", 10)
    
    agents = db.query(Agent).all()
    for a in agents:
        c.drawString(50, y, str(a.id))
        c.drawString(100, y, a.name)
        c.drawString(250, y, a.role)
        c.drawString(400, y, f"${a.salary:,.2f}")
        y -= 20
        if y < 50:
            c.showPage()
            y = 750

    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type='application/pdf', headers={
        "Content-Disposition": "attachment; filename=agents_list.pdf"
    })

@router.get("/debts/pdf")
def debts_pdf(db: Session = Depends(get_db)):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    draw_header(c, "List of All Debts")
    
    y = 700
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "Agent")
    c.drawString(200, y, "Amount")
    c.drawString(300, y, "Reason")
    c.drawString(450, y, "Date")
    
    y -= 20
    c.setFont("Helvetica", 10)
    
    debts = db.query(Debt).all()
    for d in debts:
        agent = db.query(Agent).filter(Agent.id == d.agent_id).first()
        name = agent.name if agent else f"ID: {d.agent_id}"
        c.drawString(50, y, name)
        c.drawString(200, y, f"${d.amount:,.2f}")
        c.drawString(300, y, d.reason)
        c.drawString(450, y, str(d.debt_date))
        y -= 20
        if y < 50:
            c.showPage()
            y = 750

    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type='application/pdf', headers={
        "Content-Disposition": "attachment; filename=debts_list.pdf"
    })

@router.get("/payslip/pdf")
def generate_payslip(
    agent_id: int, 
    type: str, # "monthly", "yearly", "all"
    month: Optional[str] = None, # YYYY-MM
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    draw_header(c, f"PAYSLIP - {type.upper()}")

    # Agent Info Box
    c.rect(50, 650, 500, 80)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, 710, f"Agent Name: {agent.name}")
    c.setFont("Helvetica", 10)
    c.drawString(60, 690, f"Role: {agent.role}")
    c.drawString(60, 670, f"Base Salary: ${agent.salary:,.2f}")

    # Logic to fetch payments and debts based on type
    payments_query = db.query(Payment).filter(Payment.agent_id == agent_id, Payment.status == "Completed")
    debts_query = db.query(Debt).filter(Debt.agent_id == agent_id)

    title_period = ""
    if type == "monthly" and month:
        start_date = datetime.strptime(month, "%Y-%m").date()
        if start_date.month == 12:
            end_date = date(start_date.year + 1, 1, 1)
        else:
            end_date = date(start_date.year, start_date.month + 1, 1)
        payments_query = payments_query.filter(Payment.payment_date >= start_date, Payment.payment_date < end_date)
        debts_query = debts_query.filter(Debt.debt_date >= start_date, Debt.debt_date < end_date)
        title_period = f"Period: {month}"
    elif type == "yearly" and year:
        payments_query = payments_query.filter(func.extract('year', Payment.payment_date) == year)
        debts_query = debts_query.filter(func.extract('year', Debt.debt_date) == year)
        title_period = f"Year: {year}"
    else:
        title_period = "All Time Record"

    c.drawString(400, 710, title_period)

    payments = payments_query.all()
    debts = debts_query.all()

    total_paid = sum(p.amount for p in payments)
    total_debt = sum(d.amount for d in debts)

    y = 600
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Earnings (Payments Received)")
    y -= 20
    c.setFont("Helvetica", 10)
    for p in payments:
        c.drawString(70, y, f"Date: {p.payment_date} | Amount: ${p.amount:,.2f}")
        y -= 15
    
    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Deductions (Debts Taken)")
    y -= 20
    c.setFont("Helvetica", 10)
    for d in debts:
        c.drawString(70, y, f"Date: {d.debt_date} | {d.reason}: -${d.amount:,.2f}")
        y -= 15

    y -= 30
    c.line(50, y, 550, y)
    y -= 20
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "SUMMARY")
    y -= 20
    c.setFont("Helvetica", 12)
    c.drawString(70, y, f"Total Earnings: ${total_paid:,.2f}")
    y -= 20
    c.drawString(70, y, f"Total Deductions: -${total_debt:,.2f}")
    y -= 20
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(colors.blue)
    net = total_paid
    c.drawString(70, y, f"NET PAID: ${net:,.2f}")
    
    # Signature area at the bottom
    y -= 100
    if y < 100:
        c.showPage()
        y = 700
    
    c.line(350, y, 550, y)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawCentredString(450, y - 15, "Agent's Signature")
    c.drawCentredString(450, y - 30, f"{agent.name}")
    
    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type='application/pdf', headers={
        "Content-Disposition": f"attachment; filename=payslip_{agent.name}_{type}.pdf"
    })

@router.get("/dashboard")
def get_dashboard_stats(month: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        # Base Query
        query = db.query(Payment)

        # Apply Month Filter
        if month:
            # Expected format: YYYY-MM
            try:
                start_date = datetime.strptime(month, "%Y-%m").date()
                # Calculate end of month
                if start_date.month == 12:
                    end_date = date(start_date.year + 1, 1, 1)
                else:
                    end_date = date(start_date.year, start_date.month + 1, 1)
                
                query = query.filter(Payment.payment_date >= start_date, Payment.payment_date < end_date)
            except ValueError:
                pass # Invalid date format, ignore filter

        # Total Agents (Always global)
        total_agents = db.query(Agent).count()

        # Monthly Payments (Sum of filtered payments)
        monthly_payments = query.with_entities(func.sum(Payment.amount)).scalar() or 0.0

        # Status Counts (Filtered)
        pending_count = query.filter(func.lower(Payment.status) == "pending").count()
        completed_count = query.filter(func.lower(Payment.status) == "completed").count()
        failed_count = query.filter(func.lower(Payment.status) == "failed").count()
        cancelled_count = query.filter(func.lower(Payment.status) == "cancelled").count()

        # Recent Payments (Filtered)
        recent_payments = query.order_by(Payment.id.desc()).limit(5).all()

        return {
            "total_agents": total_agents,
            "monthly_payments": monthly_payments,
            "pending_count": pending_count,
            "completed_count": completed_count,
            "failed_count": failed_count,
            "cancelled_count": cancelled_count,
            "recent_payments": recent_payments
        }
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return {
            "total_agents": 0,
            "monthly_payments": 0,
            "pending_count": 0,
            "completed_count": 0,
            "failed_count": 0,
            "cancelled_count": 0,
            "recent_payments": []
        }

