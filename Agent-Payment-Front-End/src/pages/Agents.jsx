import { useEffect, useState } from "react";
import { getAgents, createAgent, deleteAgent, updateAgent } from "../services/agents.js";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useUI } from "../context/UIContext";

export default function Agents() {
  const { t, language, showToast } = useUI();
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    role: "Teacher", 
    salary: "",
    date_of_birth: "",
    email_address: "",
    phone_number: ""
  });
  const [editingId, setEditingId] = useState(null);

  function loadAgents() {
    getAgents().then((res) => setAgents(res.data)).catch(err => {
        console.error("Error loading agents:", err);
        showToast("load_error", "error");
    });
  }

  useEffect(() => {
    loadAgents();
  }, []);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email_address && !emailRegex.test(form.email_address)) {
        showToast("invalid_email", "error");
        return false;
    }

    // Phone validation (099..., 24399..., +24399...)
    const phoneRegex = /^(099|24399|\+24399)\d+$/;
    if (form.phone_number && !phoneRegex.test(form.phone_number)) {
        showToast("invalid_phone_format", "error");
        return false;
    }

    // Date of birth validation (not exceed today and year <= 2006)
    if (form.date_of_birth) {
        const selectedDate = new Date(form.date_of_birth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            showToast("future_dob_error", "error");
            return false;
        }
        
        if (selectedDate.getFullYear() > 2006) {
            showToast("birth_year_error", "error");
            return false;
        }
    }

    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const data = {
        ...form,
        salary: parseFloat(form.salary) || 0
    };

    try {
        if (editingId) {
            await updateAgent(editingId, data);
            setEditingId(null);
        } else {
            await createAgent(data);
        }
        showToast("save_success", "success");
        setForm({ 
            name: "", 
            role: "Teacher", 
            salary: "",
            date_of_birth: "",
            email_address: "",
            phone_number: ""
        });
        loadAgents();
    } catch (err) {
        console.error("Error saving agent:", err);
        const detail = err.response?.data?.detail;
        const errorMessage = detail ? (Array.isArray(detail) ? detail[0].msg : detail) : "Failed to save agent";
        showToast(errorMessage, "error");
    }
  }

  function handleEdit(agent) {
      setForm({ 
          name: agent.name, 
          role: agent.role || "Teacher", 
          salary: agent.salary,
          date_of_birth: agent.date_of_birth || "",
          email_address: agent.email_address || "",
          phone_number: agent.phone_number || ""
      });
      setEditingId(agent.id);
  }

  function handleCancelEdit() {
      setForm({ 
          name: "", 
          role: "Teacher", 
          salary: "",
          date_of_birth: "",
          email_address: "",
          phone_number: ""
      });
      setEditingId(null);
  }

  async function handleDelete(id) {
    if (confirm("Delete this agent?")) {
      try {
          await deleteAgent(id);
          showToast("delete_success", "success");
          loadAgents();
      } catch (err) {
          console.error("Error deleting agent:", err);
          showToast("delete_error", "error");
      }
    }
  }

  return (
    <>
      <h2>{t("agents")}</h2>

      {/* CREATE / EDIT FORM - Centered and 3 fields per line */}
      <form className="animate-slide-up" onSubmit={handleSubmit} style={{ 
          marginBottom: "30px", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px", 
          backgroundColor: "var(--card-bg)",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "var(--card-shadow)",
          maxWidth: "1000px",
          margin: "0 auto 40px auto"
      }}>
        <div className="form-group">
            <label htmlFor="name">{t("agent_name")}</label>
            <input
            id="name"
            name="name"
            placeholder={t("enter_full_name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            />
        </div>
        <div className="form-group">
            <label htmlFor="role">{t("role")}</label>
            <select
            id="role"
            name="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
            style={{ width: "100%" }}
            >
                <option value="Teacher">{language === "fr" ? "Enseignant" : "Teacher"}</option>
                <option value="Admin">Admin</option>
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="salary">{t("salary")}</label>
            <input
            id="salary"
            name="salary"
            type="number"
            placeholder={t("salary_amount")}
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            required
            />
        </div>
        <div className="form-group">
            <label htmlFor="date_of_birth">{t("date_of_birth")}</label>
            <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            max="2006-12-31"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
        </div>
        <div className="form-group">
            <label htmlFor="email_address">{t("email_address")}</label>
            <input
            id="email_address"
            name="email_address"
            type="email"
            placeholder="address@email.com"
            value={form.email_address}
            onChange={(e) => setForm({ ...form, email_address: e.target.value })}
            />
        </div>
        <div className="form-group">
            <label htmlFor="phone_number">{t("phone_number")}</label>
            <input
            id="phone_number"
            name="phone_number"
            placeholder="099... or +243..."
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
        </div>
        <div style={{ 
            display: "flex", 
            gap: "10px", 
            gridColumn: "1 / -1", 
            justifyContent: "center",
            marginTop: "10px"
        }}>
            <button type="submit" className="btn" style={{ 
                backgroundColor: "var(--primary-color)", 
                color: "white", 
                minWidth: "200px",
                height: "45px",
                fontSize: "1rem"
            }}>
                {editingId ? t("update_agent") : t("add_agent")}
            </button>
            {editingId && (
                <button type="button" className="btn" onClick={handleCancelEdit} style={{ 
                    backgroundColor: "#6c757d", 
                    color: "white", 
                    minWidth: "120px",
                    height: "45px" 
                }}>
                    {t("cancel")}
                </button>
            )}
        </div>
      </form>

      {/* LIST */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t("agent_name")}</th>
              <th>{t("role")}</th>
              <th>{t("salary")}</th>
              <th>{t("date_of_birth")}</th>
              <th>{t("email_address")}</th>
              <th>{t("phone_number")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.role}</td>
                <td>${a.salary?.toLocaleString() || 0}</td>
                <td>{a.date_of_birth || "-"}</td>
                <td style={{ fontSize: "0.9em" }}>{a.email_address || "-"}</td>
                <td>{a.phone_number || "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button className="btn btn-edit" onClick={() => handleEdit(a)}>
                        <span className="desktop-only">{t("edit")}</span>
                        <FaEdit className="mobile-only" />
                    </button>
                    <button className="btn danger" onClick={() => handleDelete(a.id)}>
                        <span className="desktop-only">{t("delete")}</span>
                        <FaTrash className="mobile-only" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
