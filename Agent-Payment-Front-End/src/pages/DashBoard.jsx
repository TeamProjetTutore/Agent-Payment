import { useEffect, useState } from "react";
import { getStats } from "../services/reports";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier si on a un token
    const token = localStorage.getItem("token");
    console.log("Dashboard - Token présent:", !!token);  // DEBUG
    
    if (!token) {
      console.log("Pas de token, redirection...");
      navigate("/");
      return;
    }
    
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      console.log("Chargement des stats...");  // DEBUG
      const res = await getStats();
      console.log("Stats reçues:", res.data);  // DEBUG
      setStats(res.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error.response?.status, error.response?.data);
      setError(error.response?.data?.detail || "Erreur de chargement");
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Redirection...</div>;
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Tableau de Bord</h2>
        <p>Bienvenue, {user?.name || "Utilisateur"}</p>
      </header>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Enseignants</h3>
          <p>{stats?.total_enseignants || 0}</p>
        </div>
        <div className="card">
          <h3>Bulletins Générés</h3>
          <p>{stats?.total_bulletins || 0}</p>
        </div>
        <div className="card">
          <h3>Masse Salariale ({stats?.mois_actuel})</h3>
          <p>{stats?.masse_salariale_mois?.toLocaleString() || 0} CDF</p>
        </div>
        <div className="card">
          <h3>Payé ce mois</h3>
          <p>{stats?.montant_paye_mois?.toLocaleString() || 0} CDF</p>
        </div>
      </div>
    </div>
  );
}