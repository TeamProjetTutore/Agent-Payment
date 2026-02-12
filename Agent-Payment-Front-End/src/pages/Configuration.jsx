import { useEffect, useState } from "react";
import { getGrades, createGrade, deleteGrade } from "../services/grades";
import { getElements, createElement } from "../services/elements";
import { getProvinces, createProvince } from "../services/etablissements";
import { getEtablissements, createEtablissement } from "../services/etablissements";

export default function Configuration() {
  const [activeTab, setActiveTab] = useState("grades");
  const [grades, setGrades] = useState([]);
  const [elements, setElements] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [etablissements, setEtablissements] = useState([]);

  // Forms
  const [gradeForm, setGradeForm] = useState({ libelle: "", salaire_base: "" });
  const [elementForm, setElementForm] = useState({ 
    nom_element: "", 
    type: "Gain", 
    montant_fixe: "",
    description: ""
  });
  const [provinceForm, setProvinceForm] = useState({ nom: "" });
  const [etabForm, setEtabForm] = useState({ 
    nom_ecole: "", 
    province_id: "", 
    zone_paie: "Urbaine" 
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [g, e, p, et] = await Promise.all([
      getGrades(),
      getElements(),
      getProvinces(),
      getEtablissements()
    ]);
    setGrades(g.data || []);
    setElements(e.data || []);
    setProvinces(p.data || []);
    setEtablissements(et.data || []);
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    try {
      await createGrade({
        libelle: gradeForm.libelle,
        salaire_base: parseFloat(gradeForm.salaire_base)
      });
      setGradeForm({ libelle: "", salaire_base: "" });
      loadAll();
    } catch (error) {
      alert("Erreur: " + error.response?.data?.detail);
    }
  };

  const handleCreateElement = async (e) => {
    e.preventDefault();
    try {
      await createElement({
        ...elementForm,
        montant_fixe: elementForm.montant_fixe ? parseFloat(elementForm.montant_fixe) : null
      });
      setElementForm({ nom_element: "", type: "Gain", montant_fixe: "", description: "" });
      loadAll();
    } catch (error) {
      alert("Erreur");
    }
  };

  const handleCreateProvince = async (e) => {
    e.preventDefault();
    try {
      await createProvince(provinceForm);
      setProvinceForm({ nom: "" });
      loadAll();
    } catch (error) {
      alert("Erreur");
    }
  };

  const handleCreateEtab = async (e) => {
    e.preventDefault();
    try {
      await createEtablissement({
        ...etabForm,
        province_id: parseInt(etabForm.province_id)
      });
      setEtabForm({ nom_ecole: "", province_id: "", zone_paie: "Urbaine" });
      loadAll();
    } catch (error) {
      alert("Erreur");
    }
  };

  return (
    <div>
      <h2>Configuration du Système</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === "grades" ? "active" : ""} 
          onClick={() => setActiveTab("grades")}
        >
          Grades
        </button>
        <button 
          className={activeTab === "elements" ? "active" : ""} 
          onClick={() => setActiveTab("elements")}
        >
          Éléments de Rémunération
        </button>
        <button 
          className={activeTab === "provinces" ? "active" : ""} 
          onClick={() => setActiveTab("provinces")}
        >
          Provinces
        </button>
        <button 
          className={activeTab === "etablissements" ? "active" : ""} 
          onClick={() => setActiveTab("etablissements")}
        >
          Établissements
        </button>
      </div>

      {/* Grades */}
      {activeTab === "grades" && (
        <div className="tab-content">
          <form onSubmit={handleCreateGrade} className="form-inline">
            <input
              placeholder="Libellé du grade"
              value={gradeForm.libelle}
              onChange={(e) => setGradeForm({...gradeForm, libelle: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Salaire de base"
              value={gradeForm.salaire_base}
              onChange={(e) => setGradeForm({...gradeForm, salaire_base: e.target.value})}
              required
            />
            <button type="submit">Ajouter</button>
          </form>
          
          <table className="table">
            <thead>
              <tr><th>Grade</th><th>Salaire Base</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td>{g.libelle}</td>
                  <td>{g.salaire_base?.toLocaleString()} CDF</td>
                  <td>
                    <button onClick={() => deleteGrade(g.id).then(loadAll)} className="danger">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Éléments */}
      {activeTab === "elements" && (
        <div className="tab-content">
          <form onSubmit={handleCreateElement} className="form-inline">
            <input
              placeholder="Nom de l'élément"
              value={elementForm.nom_element}
              onChange={(e) => setElementForm({...elementForm, nom_element: e.target.value})}
              required
            />
            <select
              value={elementForm.type}
              onChange={(e) => setElementForm({...elementForm, type: e.target.value})}
            >
              <option value="Gain">Gain</option>
              <option value="Retenue">Retenue</option>
            </select>
            <input
              type="number"
              placeholder="Montant fixe (optionnel)"
              value={elementForm.montant_fixe}
              onChange={(e) => setElementForm({...elementForm, montant_fixe: e.target.value})}
            />
            <button type="submit">Ajouter</button>
          </form>
          
          <table className="table">
            <thead>
              <tr><th>Nom</th><th>Type</th><th>Montant</th></tr>
            </thead>
            <tbody>
              {elements.map((e) => (
                <tr key={e.id}>
                  <td>{e.nom_element}</td>
                  <td>{e.type}</td>
                  <td>{e.montant_fixe?.toLocaleString() || "Variable"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Provinces */}
      {activeTab === "provinces" && (
        <div className="tab-content">
          <form onSubmit={handleCreateProvince} className="form-inline">
            <input
              placeholder="Nom de la province"
              value={provinceForm.nom}
              onChange={(e) => setProvinceForm({...provinceForm, nom: e.target.value})}
              required
            />
            <button type="submit">Ajouter</button>
          </form>
          
          <ul className="list">
            {provinces.map((p) => (
              <li key={p.id}>{p.nom}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Établissements */}
      {activeTab === "etablissements" && (
        <div className="tab-content">
          <form onSubmit={handleCreateEtab} className="form-inline">
            <input
              placeholder="Nom de l'école"
              value={etabForm.nom_ecole}
              onChange={(e) => setEtabForm({...etabForm, nom_ecole: e.target.value})}
              required
            />
            <select
              value={etabForm.province_id}
              onChange={(e) => setEtabForm({...etabForm, province_id: e.target.value})}
              required
            >
              <option value="">Province...</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
            <select
              value={etabForm.zone_paie}
              onChange={(e) => setEtabForm({...etabForm, zone_paie: e.target.value})}
            >
              <option value="Urbaine">Urbaine</option>
              <option value="Rurale">Rurale</option>
            </select>
            <button type="submit">Ajouter</button>
          </form>
          
          <table className="table">
            <thead>
              <tr><th>École</th><th>Province</th><th>Zone</th></tr>
            </thead>
            <tbody>
              {etablissements.map((e) => (
                <tr key={e.id}>
                  <td>{e.nom_ecole}</td>
                  <td>{provinces.find(p => p.id === e.province_id)?.nom}</td>
                  <td>{e.zone_paie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}