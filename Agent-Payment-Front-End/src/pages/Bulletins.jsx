import { useEffect, useState } from "react";
import { getBulletins, calculerBulletin, exportPDF, marquerPaye, deleteBulletin } from "../services/bulletins";
import { getEnseignants } from "../services/enseignants";
import { getElements } from "../services/elements";

export default function Bulletins() {
  const [bulletins, setBulletins] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    enseignant_id: "",
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    primes: [],
    retenues: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bullRes, ensRes, elemRes] = await Promise.all([
        getBulletins(),
        getEnseignants(),
        getElements()
      ]);
      setBulletins(bullRes.data || []);
      setEnseignants(ensRes.data || []);
      setElements(elemRes.data || []);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleCalculer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await calculerBulletin({
        enseignant_id: parseInt(form.enseignant_id),
        mois: parseInt(form.mois),
        annee: parseInt(form.annee),
        primes: form.primes.map(Number),
        retenues: form.retenues.map(Number)
      });
      loadData();
      alert("Bulletin généré avec succès !");
    } catch (error) {
      alert(error.response?.data?.detail || "Erreur lors du calcul");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (id) => {
    try {
      const response = await exportPDF(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulletin_${id}.pdf`;
      link.click();
    } catch (error) {
      alert("Erreur lors de l'export PDF");
    }
  };

  const handlePayer = async (id) => {
    const mode = prompt("Mode de paiement (Virement/Mobile Money/Cash):", "Virement");
    if (!mode) return;
    try {
      await marquerPaye(id, mode);
      loadData();
    } catch (error) {
      alert("Erreur");
    }
  };

  const toggleSelection = (id, type) => {
    const current = type === 'primes' ? form.primes : form.retenues;
    const updated = current.includes(id.toString())
      ? current.filter(x => x !== id.toString())
      : [...current, id.toString()];
    setForm({ ...form, [type]: updated });
  };

  return (
    <div>
      <h2>Gestion des Bulletins de Paie</h2>
      
      {/* Formulaire de calcul */}
      <form className="form-card" onSubmit={handleCalculer}>
        <h3>Générer un Bulletin</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Enseignant *</label>
            <select
              value={form.enseignant_id}
              onChange={(e) => setForm({...form, enseignant_id: e.target.value})}
              required
            >
              <option value="">Sélectionner...</option>
              {enseignants.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.matricule_dinacope} - {e.nom} {e.prenom}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Mois *</label>
            <select
              value={form.mois}
              onChange={(e) => setForm({...form, mois: e.target.value})}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Année *</label>
            <input
              type="number"
              value={form.annee}
              onChange={(e) => setForm({...form, annee: e.target.value})}
              min="2020"
              max="2100"
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Primes à appliquer:</h4>
          <div className="checkbox-grid">
            {elements.filter(e => e.type === "Gain").map((elem) => (
              <label key={elem.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.primes.includes(elem.id.toString())}
                  onChange={() => toggleSelection(elem.id, 'primes')}
                />
                {elem.nom_element} ({elem.montant_fixe?.toLocaleString()} CDF)
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h4>Retenues à appliquer:</h4>
          <div className="checkbox-grid">
            {elements.filter(e => e.type === "Retenue").map((elem) => (
              <label key={elem.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.retenues.includes(elem.id.toString())}
                  onChange={() => toggleSelection(elem.id, 'retenues')}
                />
                {elem.nom_element} ({elem.montant_fixe?.toLocaleString()} CDF)
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Calcul en cours..." : "Calculer et Générer"}
        </button>
      </form>

      {/* Liste des bulletins */}
      <h3>Historique des Bulletins</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Période</th>
            <th>Enseignant</th>
            <th>Brut</th>
            <th>Retenues</th>
            <th>Net</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bulletins.map((b) => (
            <tr key={b.id}>
              <td>{b.mois_annee}</td>
              <td>{b.enseignant?.nom} {b.enseignant?.prenom}</td>
              <td>{b.montant_brut?.toLocaleString()} CDF</td>
              <td>{b.total_retenues?.toLocaleString()} CDF</td>
              <td><strong>{b.montant_net?.toLocaleString()} CDF</strong></td>
              <td>
                <span className={`status-badge ${b.statut_paiement === 'Payé' ? 'paid' : 'pending'}`}>
                  {b.statut_paiement}
                </span>
              </td>
              <td>
                <button onClick={() => handleExportPDF(b.id)} className="btn-secondary">
                  PDF
                </button>
                {b.statut_paiement !== 'Payé' && (
                  <button onClick={() => handlePayer(b.id)} className="btn-success">
                    Payer
                  </button>
                )}
                <button onClick={() => deleteBulletin(b.id) && loadData()} className="danger">
                  Suppr
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}