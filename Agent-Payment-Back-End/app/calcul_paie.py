from sqlalchemy.orm import Session
from app.models import Enseignant, Grade, ElementRemuneration, Bulletin, LigneBulletin, TypeElement
from datetime import datetime
from typing import List, Dict, Tuple

# Barème IPR RDC (exemple simplifié - à adapter selon la législation)
TRANCHES_IPR = [
    (0, 524160, 0),
    (524161, 1428000, 0.10),
    (1428001, 2803200, 0.15),
    (2803201, 5044800, 0.20),
    (5044801, 8229600, 0.22),
    (8229601, 13200000, 0.25),
    (13200001, 18504000, 0.30),
    (18504001, float('inf'), 0.35)
]

def calculer_ipr(salaire_brut_annuel: float) -> float:
    """Calcule l'IPR selon les tranches fiscales RDC"""
    impot = 0
    for min_val, max_val, taux in TRANCHES_IPR:
        if salaire_brut_annuel > min_val:
            tranche = min(salaire_brut_annuel, max_val) - min_val
            impot += tranche * taux
    return impot / 12  # Retour mensuel

def calculer_cnss(salaire_brut: float) -> float:
    """Calcule la cotisation CNSS (5% du salaire brut plafonné)"""
    PLAFOND_CNSS = 180000  # À vérifier selon la législation
    base_cnss = min(salaire_brut, PLAFOND_CNSS)
    return base_cnss * 0.05

def generer_bulletin_paie(
    db: Session,
    enseignant_id: int,
    mois: int,
    annee: int,
    elements_ids: List[int] = None
) -> Tuple[Bulletin, Dict]:
    """
    Génère un bulletin de paie complet avec calculs automatiques
    """
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise ValueError("Enseignant non trouvé")
    
    if not enseignant.grade:
        raise ValueError("Grade non défini pour l'enseignant")
    
    # Salaire de base
    salaire_base = enseignant.grade.salaire_base
    
    # Récupérer les éléments de rémunération
    elements = []
    if elements_ids:
        elements = db.query(ElementRemuneration).filter(
            ElementRemuneration.id.in_(elements_ids)
        ).all()
    
    # Calcul des gains
    total_gains = 0
    gains_details = []
    
    # Prime de base selon zone
    zone_multiplier = 1.2 if enseignant.ecole and enseignant.ecole.zone_paie.value == "Rurale" else 1.0
    
    for elem in elements:
        if elem.type == TypeElement.GAIN:
            montant = elem.montant_fixe or 0
            # Application du coefficient zone si c'est une indemnité de brousse
            if "brousse" in elem.nom_element.lower() or "zone" in elem.nom_element.lower():
                montant *= zone_multiplier
            
            total_gains += montant
            gains_details.append({
                "element": elem,
                "montant": montant,
                "description": f"{elem.nom_element} - Zone: {enseignant.ecole.zone_paie.value if enseignant.ecole else 'N/A'}"
            })
    
    # Salaire brut
    salaire_brut = salaire_base + total_gains
    
    # Calcul des retenues obligatoires
    cnss = calculer_cnss(salaire_brut)
    
    # IPR sur base annuelle estimée
    salaire_brut_annuel = salaire_brut * 12
    ipr = calculer_ipr(salaire_brut_annuel)
    
    # Autres retenues
    total_retenues = cnss + ipr
    retenues_details = [
        {"element": None, "montant": cnss, "description": "CNSS (5%)"},
        {"element": None, "montant": ipr, "description": "IPR (Impôt Professionnel)"}
    ]
    
    # Ajouter les retenues sélectionnées
    for elem in elements:
        if elem.type == TypeElement.RETENUE:
            montant = elem.montant_fixe or 0
            total_retenues += montant
            retenues_details.append({
                "element": elem,
                "montant": montant,
                "description": elem.nom_element
            })
    
    # Salaire net
    salaire_net = salaire_brut - total_retenues
    
    # Création du bulletin
    bulletin = Bulletin(
        enseignant_id=enseignant_id,
        mois=mois,
        annee=annee,
        mois_annee=f"{annee}-{mois:02d}",
        montant_brut=salaire_brut,
        total_gains=total_gains,
        total_retenues=total_retenues,
        montant_net=salaire_net,
        date_generation=datetime.now(),
        statut_paiement="En attente"
    )
    
    db.add(bulletin)
    db.flush()  # Pour obtenir l'ID
    
    # Création des lignes de bulletin
    all_details = gains_details + retenues_details
    for detail in all_details:
        ligne = LigneBulletin(
            bulletin_id=bulletin.id,
            element_id=detail["element"].id if detail["element"] else None,
            montant=detail["montant"],
            description=detail["description"]
        )
        db.add(ligne)
    
    db.commit()
    db.refresh(bulletin)
    
    details = {
        "salaire_base": salaire_base,
        "total_gains": total_gains,
        "salaire_brut": salaire_brut,
        "cnss": cnss,
        "ipr": ipr,
        "total_retenues": total_retenues,
        "salaire_net": salaire_net,
        "zone_multiplier": zone_multiplier
    }
    
    return bulletin, details