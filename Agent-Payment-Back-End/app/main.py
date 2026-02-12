from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, enseignants, grades, etablissements, elements, bulletins, reports, agents, payments

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SchoolPay API",
    description="Système de gestion de paie pour enseignants",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(auth.router)
app.include_router(enseignants.router)
app.include_router(grades.router)
app.include_router(etablissements.router)
app.include_router(elements.router)
app.include_router(bulletins.router)
app.include_router(reports.router)

# Routers legacy pour compatibilité
app.include_router(agents.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {"message": "SchoolPay API v2.0 - Système de Paie des Enseignants"}