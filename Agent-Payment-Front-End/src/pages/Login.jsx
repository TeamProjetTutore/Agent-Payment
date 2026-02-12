import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.email || !formData.password) {
      return "Tous les champs sont requis";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Adresse email invalide";
    }
    if (formData.password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    setErrors("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      const backendError = err.response?.data?.detail;
      setErrors(
        typeof backendError === "string" 
          ? backendError 
          : "Échec de la connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">SchoolPay</h1>
        <p className="login-subtitle">Système de Paie des Enseignants</p>
        
        {errors && <p className="error-text">{errors}</p>}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="admin@school.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button className="login-btn" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}