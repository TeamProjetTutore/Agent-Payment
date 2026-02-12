from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import decode_token
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # DEBUG COMPLET
    print("\n" + "="*60)
    print("DEBUG AUTH - get_current_user")
    print("="*60)
    print(f"Token brut reçu: {repr(token)}")
    print(f"Token type: {type(token)}")
    print(f"Token length: {len(token) if token else 0}")
    
    if not token:
        print("ERREUR: Token est vide ou None")
        raise credentials_exception
    
    # Vérifier si le token commence par "Bearer " (ne devrait pas avec OAuth2PasswordBearer)
    if token.startswith("Bearer "):
        print("ATTENTION: Token contient 'Bearer ', on enlève le préfixe")
        token = token[7:]
    
    print(f"Token pour décodage: {token[:50]}...")
    
    # Essayer de décoder
    try:
        payload = decode_token(token)
        print(f"Payload décodé: {payload}")
    except Exception as e:
        print(f"ERREUR décodage: {e}")
        raise credentials_exception
    
    if payload is None:
        print("ERREUR: Payload est None")
        raise credentials_exception
    
    email = payload.get("sub")
    print(f"Email extrait: {email}")
    
    if not email:
        print("ERREUR: Pas de 'sub' dans le payload")
        raise credentials_exception
    
    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == email).first()
    print(f"Utilisateur trouvé en DB: {user is not None}")
    
    if user:
        print(f"User ID: {user.id}, Email: {user.email}, Role: {user.role}")
    else:
        print(f"ERREUR: Aucun utilisateur avec email {email}")
        raise credentials_exception
    
    print("="*60)
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

def admin_only(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def accountant_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value not in ["admin", "accountant"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges"
        )
    return current_user