from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from app.models import Bulletin
import os

def generate_bulletin_pdf(bulletin: Bulletin) -> str:
    """Génère un PDF de fiche de paie"""
    
    filename = f"temp_bulletin_{bulletin.id}.pdf"
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    elements = []
    
    # En-tête
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e3c72'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    elements.append(Paragraph("FICHE DE PAIE", title_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Informations enseignant
    enseignant = bulletin.enseignant
    
    info_data = [
        ["Matricule:", enseignant.matricule_dinacope, "Période:", f"{bulletin.mois:02d}/{bulletin.annee}"],
        ["Nom:", f"{enseignant.nom} {enseignant.prenom}", "Grade:", enseignant.grade.libelle if enseignant.grade else "N/A"],
        ["Établissement:", enseignant.ecole.nom_ecole if enseignant.ecole else "N/A", "Zone:", enseignant.ecole.zone_paie.value if enseignant.ecole else "N/A"],
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 6*cm, 3*cm, 3*cm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1e3c72')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 1*cm))
    
    # Tableau des gains et retenues
    table_data = [["DESCRIPTION", "MONTANT (CDF)"]]
    
    # Section Gains
    table_data.append(["GAINS", ""])
    for ligne in bulletin.lignes:
        if ligne.element and ligne.element.type.value == "Gain":
            table_data.append([f"  {ligne.description or ligne.element.nom_element}", f"{ligne.montant:,.2f}"])
    
    table_data.append(["Salaire de base", f"{bulletin.montant_brut - bulletin.total_gains:,.2f}"])
    table_data.append(["TOTAL GAINS", f"{bulletin.montant_brut:,.2f}"])
    
    # Section Retenues
    table_data.append(["", ""])
    table_data.append(["RETENUES", ""])
    for ligne in bulletin.lignes:
        if ligne.element and ligne.element.type.value == "Retenue":
            table_data.append([f"  {ligne.description or ligne.element.nom_element}", f"{ligne.montant:,.2f}"])
        elif not ligne.element:  # CNSS, IPR
            table_data.append([f"  {ligne.description}", f"{ligne.montant:,.2f}"])
    
    table_data.append(["TOTAL RETENUES", f"{bulletin.total_retenues:,.2f}"])
    table_data.append(["", ""])
    table_data.append(["NET À PAYER", f"{bulletin.montant_net:,.2f}"])
    
    # Style du tableau
    paie_table = Table(table_data, colWidths=[10*cm, 6*cm])
    paie_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3c72')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -2), 1, colors.black),
        ('FONTNAME', (0, -6), (0, -6), 'Helvetica-Bold'),  # GAINS
        ('FONTNAME', (0, -4), (0, -4), 'Helvetica-Bold'),  # RETENUES
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),  # NET
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#2a5298')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
        ('FONTSIZE', (0, -1), (-1, -1), 14),
    ]))
    
    elements.append(paie_table)
    elements.append(Spacer(1, 1*cm))
    
    # Statut de paiement
    status_color = colors.green if bulletin.statut_paiement.value == "Payé" else colors.orange
    elements.append(Paragraph(
        f"Statut: {bulletin.statut_paiement.value}",
        ParagraphStyle('Status', parent=styles['Normal'], textColor=status_color, fontSize=12)
    ))
    
    if bulletin.mode_paiement:
        elements.append(Paragraph(f"Mode de paiement: {bulletin.mode_paiement}", styles['Normal']))
    
    # Footer
    elements.append(Spacer(1, 2*cm))
    elements.append(Paragraph(
        "Ce document est généré automatiquement par le système SchoolPay.",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(elements)
    return filename