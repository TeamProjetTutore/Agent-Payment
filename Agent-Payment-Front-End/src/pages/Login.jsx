import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.js";
import { useUI } from "../context/UIContext";

export default function Login() {
  const { t, showToast } = useUI();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!formData.email || !formData.password) {
      showToast("all_fields_required", "error");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showToast("invalid_email", "error");
      return false;
    }

    if (formData.password.length < 6) {
      showToast("password_too_short", "error");
      return false;
    }

    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    login(formData.email, formData.password)
      .then((data) => {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      })
      .catch((err) => {
        const backendError = err.response?.data?.detail;
        let errorMessage = "login_failed";
        
        if (Array.isArray(backendError)) {
          errorMessage = backendError[0].msg;
        } else if (typeof backendError === "string") {
          errorMessage = backendError;
        }
        
        showToast(errorMessage, "error");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">AgentPay</h1>
        <p className="login-subtitle">{t("sign_in")}</p>

        <div className="form-group">
          <label>{t("email")}</label>
          <input
            type="email"
            name="email"
            placeholder="admin@school.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>{t("password")}</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="login-btn" disabled={loading}>
          {loading ? t("logging_in") : t("login")}
        </button>
      </form>
    </div>
  );
}
