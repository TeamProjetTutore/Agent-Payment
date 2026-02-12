import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">SchoolPay</h2>
        <nav>
          <NavLink to="/dashboard">Tableau de Bord</NavLink>
          <NavLink to="/enseignants">Enseignants</NavLink>
          <NavLink to="/bulletins">Bulletins de Paie</NavLink>
          <NavLink to="/configuration">Configuration</NavLink>
          {/* Legacy links */}
          <NavLink to="/agents">Agents (Legacy)</NavLink>
          <NavLink to="/payments">Paiements (Legacy)</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p>{user.name}</p>
          <p style={{fontSize: "0.8em", opacity: 0.7}}>{user.role}</p>
          <button className="logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}