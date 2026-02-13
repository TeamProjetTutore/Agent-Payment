import { Link } from "react-router-dom";
import { useUI } from "../context/UIContext";

export default function Home() {
  const { t } = useUI();

  return (
    <div className="home-container">
      <div className="home-content animate-slide-up">
        <h1 className="home-title animate-fade-in">
          {t("welcome")}
        </h1>
        <p style={{ 
          fontSize: "1.2rem", 
          marginBottom: "2.5rem", 
          color: "rgba(255, 255, 255, 0.8)",
          maxWidth: "600px" 
        }} className="animate-fade-in">
          {t("manage_agents_with_ease")}
        </p>
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/login" className="home-btn">
            {t("get_started")}
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "150px",
        height: "150px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "50%",
        zIndex: -1
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "10%",
        width: "250px",
        height: "250px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "50%",
        zIndex: -1
      }}></div>
    </div>
  );
}
