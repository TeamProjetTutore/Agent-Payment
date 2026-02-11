import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content animate-slide-up">
        <h1 className="home-title animate-fade-in">
          Welcome to AgentPay
        </h1>
        <p style={{ 
          fontSize: "1.2rem", 
          marginBottom: "2.5rem", 
          color: "rgba(255, 255, 255, 0.8)",
          maxWidth: "600px" 
        }} className="animate-fade-in">
          The ultimate platform for managing agent payments with ease, 
          security, and transparency. Join us today and streamline your 
          financial operations.
        </p>
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/login" className="home-btn">
            Get Started
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
