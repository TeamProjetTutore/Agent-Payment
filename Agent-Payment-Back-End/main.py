from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Agent Payment API")

# Configure CORS - ajoutez le port Vite (généralement 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle pour la requête de login
class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def read_root():
    return {"message": "Agent Payment API is running!"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "agent-payment-api"}

# Ajoutez cet endpoint
@app.post("/login")
async def login(login_data: LoginRequest):
    # Ici, ajoutez votre logique d'authentification
    # Exemple basique :
    if login_data.email == "admin@school.com" and login_data.password == "123456":
        return {
            "success": True,
            "message": "Login successful",
            "token": "fake-jwt-token-12345"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Vous pouvez aussi ajouter une route /api/login
@app.post("/api/login")
async def api_login(login_data: LoginRequest):
    # Même logique que /login
    return await login(login_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)