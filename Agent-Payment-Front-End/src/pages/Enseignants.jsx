import { useEffect, useState } from "react";
import { getEnseignants, createEnseignant, deleteEnseignant } from "../services/enseignants";
import { getGrades } from "../services/grades";
import { getEtablissements } from "../services/etablissements";

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [grades, setGrades] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    matricule_dinacope: "",
    nom: "",
    prenom: "",
    genre: "M",
    grade_id: "",
    ecole_id: "",
    situation_familiale: "Célibataire",
    nb_enfants: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ensRes, gradesRes, etabRes] = await Promise.all([
        getEnseignants(),
        getGrades(),
        getEtablissements()
      ]);
      setEnseignants(ensRes.data || []);
      setGrades(gradesRes.data || []);
      setEtablissements(etabRes.data || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.matricule_dinacope || form.matricule_dinacope.length < 3) {
      newErrors.matricule = "Matricule invalide (min 3 caractères)";
    }
    if (!form.nom || form.nom.length < 2) {
      newErrors.nom = "Nom trop court";
    }
    if (!form.prenom || form.prenom.length < 2) {
      newErrors.prenom = "Prénom trop court";
    }
    if (!form.grade_id) {
      newErrors.grade = "Veuillez sélectionner un grade";
    }
    if (!form.ecole_id) {
      newErrors.ecole = "Veuillez sélectionner un établissement";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createEnseignant({
        ...form,
        grade_id: parseInt(form.grade_id),
        ecole_id: parseInt(form.ecole_id),
        nb_enfants: parseInt(form.nb_enfants)
      });
      setForm({
        matricule_dinacope: "",
        nom: "",
        prenom: "",
        genre: "M",
        grade_id: "",
        ecole_id: "",
        situation_familiale: "Célibataire",
        nb_enfants: 0
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || "Erreur lors de la création");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet enseignant ?")) return;
    try {
      await deleteEnseignant(id);
      loadData();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      <h2>Gestion des Enseignants</h2>
      
      {/* Formulaire */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Nouvel Enseignant</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Matricule DINACOPE *</label>
            <input
              value={form.matricule_dinacope}
              onChange={(e) => setForm({...form, matricule_dinacope: e.target.value.toUpperCase()})}
              placeholder="EX: MAT-001"
            />
            {errors.matricule && <span className="error-field">{errors.matricule}</span>}
          </div>
          
          <div className="form-group">
            <label>Nom *</label>
            <input
              value={form.nom}
              onChange={(e) => setForm({...form, nom: e.target.value})}
            />
            {errors.nom && <span className="error-field">{errors.nom}</span>}
          </div>
          
          <div className="form-group">
            <label>Prénom *</label>
            <input
              value={form.prenom}
              onChange={(e) => setForm({...form, prenom: e.target.value})}
            />
            {errors.prenom && <span className="error-field">{errors.prenom}</span>}
          </div>
          
          <div className="form-group">
            <label>Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({...form, genre: e.target.value})}
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Grade *</label>
            <select
              value={form.grade_id}
              onChange={(e) => setForm({...form, grade_id: e.target.value})}
            >
              <option value="">Sélectionner...</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.libelle}</option>
              ))}
            </select>
            {errors.grade && <span className="error-field">{errors.grade}</span>}
          </div>
          
          <div className="form-group">
            <label>Établissement *</label>
            <select
              value={form.ecole_id}
              onChange={(e) => setForm({...form, ecole_id: e.target.value})}
            >
              <option value="">Sélectionner...</option>
              {etablissements.map((e) => (
                <option key={e.id} value={e.id}>{e.nom_ecole}</option>
              ))}
            </select>
            {errors.ecole && <span className="error-field">{errors.ecole}</span>}
          </div>
          
          <div className="form-group">
            <label>Situation familiale</label>
            <select
              value={form.situation_familiale}
              onChange={(e) => setForm({...form, situation_familiale: e.target.value})}
            >
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf/Veuve">Veuf/Veuve</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Nombre d'enfants</label>
            <input
              type="number"
              min="0"
              max="20"
              value={form.nb_enfants}
              onChange={(e) => setForm({...form, nb_enfants: e.target.value})}
            />
          </div>
        </div>
        
        <button type="submit" className="btn-primary">Ajouter</button>
      </form>

      {/* Liste */}
      <h3>Liste des Enseignants</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Grade</th>
              <th>Établissement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enseignants.map((e) => (
              <tr key={e.id}>
                <td>{e.matricule_dinacope}</td>
                <td>{e.nom}</td>
                <td>{e.prenom}</td>
                <td>{e.grade?.libelle}</td>
                <td>{e.ecole?.nom_ecole}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(e.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}