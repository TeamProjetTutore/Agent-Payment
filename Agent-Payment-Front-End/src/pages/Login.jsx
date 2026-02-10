import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!formData.email || !formData.password) {
      return "All fields are required";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Invalid email address";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    setErrors("");
    setLoading(true);

    login(formData.email, formData.password)
      .then((data) => {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      })
      .catch((err) => {
        const backendError = err.response?.data?.detail;
        if (Array.isArray(backendError)) {
          setErrors(backendError[0].msg);
        } else if (typeof backendError === "string") {
          setErrors(backendError);
        } else {
          setErrors("Login failed");
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">School Agent Payment</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {errors && <p className="error-text">{errors}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="admin@school.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
