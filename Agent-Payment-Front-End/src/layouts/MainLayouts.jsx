import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu automatically when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="layout">
      <header className="topbar">
        <h2 className="logo">AgentPay</h2>

        <div className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={isMenuOpen ? "active" : ""}>
          <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
          <NavLink to="/agents" onClick={closeMenu}>Agents</NavLink>
          <NavLink to="/payments" onClick={closeMenu}>Payments</NavLink>
          <NavLink to="/debts" onClick={closeMenu}>Debts</NavLink>
          <NavLink to="/reports" onClick={closeMenu}>Reports</NavLink>
          
          <button className="logout-btn mobile-only" onClick={logout}>
            Logout
          </button>
        </nav>

        <button className="logout-btn desktop-only" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="content">
        <Outlet />
      </main>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </div>
  );
}
