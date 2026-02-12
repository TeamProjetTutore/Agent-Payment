from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# Enums
class Genre(str, Enum):
    M = "M"
    F = "F"

class SituationFamiliale(str, Enum):
    MARIE = "Marié(e)"
    CELIBATAIRE = "Célibataire"
    VEUF = "Veuf/Veuve"
    DIVORCE = "Divorcé(e)"

class TypeElement(str, Enum):
    GAIN = "Gain"
    RETENUE = "Retenue"

class StatutPaiement(str, Enum):
    EN_ATTENTE = "En attente"
    PAYE = "Payé"

class ZonePaiement(str, Enum):
    URBAINE = "Urbaine"
    RURALE = "Rurale"

# Auth
class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Grades
class GradeBase(BaseModel):
    libelle: str = Field(..., min_length=2, max_length=100)
    salaire_base: float = Field(..., ge=0)

class GradeCreate(GradeBase):
    pass

class GradeOut(GradeBase):
    id: int
    
    class Config:
        from_attributes = True

# Provinces
class ProvinceBase(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)

class ProvinceCreate(ProvinceBase):
    pass

class ProvinceOut(ProvinceBase):
    id: int
    
    class Config:
        from_attributes = True

# Etablissements
class EtablissementBase(BaseModel):
    nom_ecole: str = Field(..., min_length=3, max_length=200)
    province_id: int = Field(..., gt=0)
    zone_paie: ZonePaiement = ZonePaiement.URBAINE

class EtablissementCreate(EtablissementBase):
    pass

class EtablissementOut(EtablissementBase):
    id: int
    
    class Config:
        from_attributes = True

# Elements de rémunération
class ElementRemunerationBase(BaseModel):
    nom_element: str = Field(..., min_length=2, max_length=100)
    type: TypeElement
    montant_fixe: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None

class ElementRemunerationCreate(ElementRemunerationBase):
    pass

class ElementRemunerationOut(ElementRemunerationBase):
    id: int
    
    class Config:
        from_attributes = True

# Enseignants
class EnseignantBase(BaseModel):
    matricule_dinacope: str = Field(..., min_length=3, max_length=50, pattern=r'^[A-Z0-9\-]+$')
    nom: str = Field(..., min_length=2, max_length=100)
    prenom: str = Field(..., min_length=2, max_length=100)
    genre: Genre
    grade_id: int = Field(..., gt=0)
    ecole_id: int = Field(..., gt=0)
    situation_familiale: SituationFamiliale = SituationFamiliale.CELIBATAIRE
    nb_enfants: int = Field(0, ge=0, le=20)

    @validator('matricule_dinacope')
    def validate_matricule(cls, v):
        return v.upper().strip()

class EnseignantCreate(EnseignantBase):
    password: Optional[str] = Field(None, min_length=6)

class EnseignantUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=2)
    prenom: Optional[str] = Field(None, min_length=2)
    grade_id: Optional[int] = None
    ecole_id: Optional[int] = None
    situation_familiale: Optional[SituationFamiliale] = None
    nb_enfants: Optional[int] = Field(None, ge=0, le=20)

class EnseignantOut(EnseignantBase):
    id: int
    grade: Optional[GradeOut] = None
    ecole: Optional[EtablissementOut] = None
    
    class Config:
        from_attributes = True

# Bulletins
class LigneBulletinCreate(BaseModel):
    element_id: int = Field(..., gt=0)
    montant: float = Field(..., gt=0)
    description: Optional[str] = None

class BulletinCreate(BaseModel):
    enseignant_id: int = Field(..., gt=0)
    mois: int = Field(..., ge=1, le=12)
    annee: int = Field(..., ge=2020, le=2100)
    lignes: List[LigneBulletinCreate] = []

class BulletinUpdate(BaseModel):
    statut_paiement: Optional[StatutPaiement] = None
    mode_paiement: Optional[str] = None
    date_paiement: Optional[datetime] = None

class LigneBulletinOut(BaseModel):
    id: int
    element: ElementRemunerationOut
    montant: float
    description: Optional[str]
    
    class Config:
        from_attributes = True

class BulletinOut(BaseModel):
    id: int
    enseignant_id: int
    enseignant: Optional[EnseignantOut] = None
    mois: int
    annee: int
    mois_annee: str
    montant_brut: float
    total_gains: float
    total_retenues: float
    montant_net: float
    statut_paiement: StatutPaiement
    date_generation: datetime
    date_paiement: Optional[datetime]
    mode_paiement: Optional[str]
    lignes: List[LigneBulletinOut] = []
    
    class Config:
        from_attributes = True

class CalculSalaireRequest(BaseModel):
    enseignant_id: int = Field(..., gt=0)
    mois: int = Field(..., ge=1, le=12)
    annee: int = Field(..., ge=2020, le=2100)
    primes: List[int] = []  # IDs des éléments de gain à appliquer
    retenues: List[int] = []  # IDs des éléments de retenue à appliquer

# Anciens schémas pour compatibilité
class AgentCreate(BaseModel):
    name: str = Field(..., min_length=2)
    role: str = Field(..., min_length=2)

class AgentOut(AgentCreate):
    id: int
    
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    agent_id: int
    amount: float = Field(..., gt=0)
    status: str = "Payé"

class PaymentOut(PaymentCreate):
    id: int
    
    class Config:
        from_attributes = True