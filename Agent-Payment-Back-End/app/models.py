from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    DIRECTOR = "director"

class TypeElement(str, enum.Enum):
    GAIN = "Gain"
    RETENUE = "Retenue"

class StatutPaiement(str, enum.Enum):
    EN_ATTENTE = "En attente"
    PAYE = "Payé"
    VIREMENT = "Virement"
    MOBILE_MONEY = "Mobile Money"
    CASH = "Cash"

class ZonePaiement(str, enum.Enum):
    URBAINE = "Urbaine"
    RURALE = "Rurale"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.ACCOUNTANT)
    name = Column(String)

class Province(Base):
    __tablename__ = "provinces"
    id = Column(Integer, primary_key=True)
    nom = Column(String, unique=True)

class Grade(Base):
    __tablename__ = "grades"
    id = Column(Integer, primary_key=True)
    libelle = Column(String, unique=True)
    salaire_base = Column(Float, default=0.0)
    
    enseignants = relationship("Enseignant", back_populates="grade")

class Etablissement(Base):
    __tablename__ = "etablissements"
    id = Column(Integer, primary_key=True)
    nom_ecole = Column(String)
    province_id = Column(Integer, ForeignKey("provinces.id"))
    zone_paie = Column(Enum(ZonePaiement), default=ZonePaiement.URBAINE)
    
    enseignants = relationship("Enseignant", back_populates="ecole")

class Enseignant(Base):
    __tablename__ = "enseignants"
    id = Column(Integer, primary_key=True)
    matricule_dinacope = Column(String, unique=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    genre = Column(String)  # M/F
    grade_id = Column(Integer, ForeignKey("grades.id"))
    ecole_id = Column(Integer, ForeignKey("etablissements.id"))
    situation_familiale = Column(String)  # marié, célibataire, etc.
    nb_enfants = Column(Integer, default=0)
    password_hash = Column(String, nullable=True)
    
    grade = relationship("Grade", back_populates="enseignants")
    ecole = relationship("Etablissement", back_populates="enseignants")
    bulletins = relationship("Bulletin", back_populates="enseignant")

class ElementRemuneration(Base):
    __tablename__ = "elements_remuneration"
    id = Column(Integer, primary_key=True)
    nom_element = Column(String, nullable=False)
    type = Column(Enum(TypeElement), nullable=False)  # Gain ou Retenue
    montant_fixe = Column(Float, nullable=True)
    description = Column(String, nullable=True)

class Bulletin(Base):
    __tablename__ = "bulletins"
    id = Column(Integer, primary_key=True)
    enseignant_id = Column(Integer, ForeignKey("enseignants.id"))
    mois = Column(Integer, nullable=False)  # 1-12
    annee = Column(Integer, nullable=False)
    mois_annee = Column(String, index=True)  # Format: "2024-01"
    montant_brut = Column(Float, default=0.0)
    total_gains = Column(Float, default=0.0)
    total_retenues = Column(Float, default=0.0)
    montant_net = Column(Float, default=0.0)
    statut_paiement = Column(Enum(StatutPaiement), default=StatutPaiement.EN_ATTENTE)
    date_generation = Column(DateTime)
    date_paiement = Column(DateTime, nullable=True)
    mode_paiement = Column(String, nullable=True)  # Banque, Mobile Money, Cash
    
    enseignant = relationship("Enseignant", back_populates="bulletins")
    lignes = relationship("LigneBulletin", back_populates="bulletin")

class LigneBulletin(Base):
    __tablename__ = "lignes_bulletin"
    id = Column(Integer, primary_key=True)
    bulletin_id = Column(Integer, ForeignKey("bulletins.id"))
    element_id = Column(Integer, ForeignKey("elements_remuneration.id"))
    montant = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    
    element = relationship("ElementRemuneration")
    bulletin = relationship("Bulletin", back_populates="lignes")

# Anciens modèles pour compatibilité (à migrer)
class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    role = Column(String)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    status = Column(String)
    agent_id = Column(Integer, ForeignKey("agents.id"))