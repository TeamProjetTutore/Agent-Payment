from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, agents, payments, reports
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(payments.router)
app.include_router(reports.router)
