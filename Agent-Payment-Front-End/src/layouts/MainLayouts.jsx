import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaSun, FaMoon, FaGlobe } from "react-icons/fa";
import { useUI } from "../context/UIContext";
import Toast from "../components/Toast";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, language, changeLanguage, t } = useUI();
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

        <nav className={isMenuOpen ? "active" : ""}>
          <NavLink to="/dashboard" onClick={closeMenu}>{t("dashboard")}</NavLink>
          <NavLink to="/agents" onClick={closeMenu}>{t("agents")}</NavLink>
          <NavLink to="/payments" onClick={closeMenu}>{t("payments")}</NavLink>
          <NavLink to="/debts" onClick={closeMenu}>{t("debts")}</NavLink>
          <NavLink to="/reports" onClick={closeMenu}>{t("reports")}</NavLink>
          
          <button className="logout-btn mobile-only" onClick={logout}>
            {t("logout")}
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", color: "white" }} onClick={() => changeLanguage(language === "en" ? "fr" : "en")}>
                <FaGlobe />
                <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{language.toUpperCase()}</span>
            </div>
            
            <div style={{ cursor: "pointer", color: "white", fontSize: "1.2rem", display: "flex", alignItems: "center" }} onClick={toggleTheme}>
                {theme === "light" ? <FaMoon title={t("dark")} /> : <FaSun title={t("light")} />}
            </div>

            <div className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <button className="logout-btn desktop-only" onClick={logout}>
                {t("logout")}
            </button>
        </div>
      </header>

      <main className="content">
        <Toast />
        <Outlet />
      </main>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </div>
  );
}
