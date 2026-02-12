# app/create_admin.py

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

def create_admin():
    db = SessionLocal()
    
    try:
        existing = db.query(User).filter(User.email == "admin@school.com").first()
        
        if existing:
            print("❌ L'admin existe déjà!")
            return
        
        # Mot de passe court (moins de 72 bytes)
        password = "admin123"
        
        admin = User(
            email="admin@school.com",
            name="Admin",
            role="admin",
            password=hash_password(password)
        )
        
        db.add(admin)
        db.commit()
        print("✅ Admin créé avec succès!")
        print(f"   Email: admin@school.com")
        print(f"   Mot de passe: {password}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()