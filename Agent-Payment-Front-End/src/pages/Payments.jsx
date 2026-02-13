import { useEffect, useState } from "react";
import { getPayments, createPayment, updatePaymentStatus } from "../services/payments.js";
import { getAgents } from "../services/agents.js";
import { getDebts } from "../services/debts.js";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useUI } from "../context/UIContext";

export default function Payments() {
  const { t, theme, showToast } = useUI();
  const [payments, setPayments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [allDebts, setAllDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fixed form - defaults to pending, no status selection
  const [form, setForm] = useState({
    agent_id: "",
    amount: "",
    // Default to current month YYYY-MM
    payment_date: new Date().toISOString().slice(0, 7), 
  });

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login first", "error");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }
    
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load payments, agents, and debts in parallel
      const [paymentsRes, agentsRes, debtsRes] = await Promise.allSettled([
        getPayments(),
        getAgents(),
        getDebts()
      ]);

      // Handle payments response
      if (paymentsRes.status === "fulfilled") {
        setPayments(paymentsRes.value.data);
      } else {
        console.error("Failed to load payments:", paymentsRes.reason);
        if (paymentsRes.reason.response?.status === 401) {
          showToast("Session expired. Redirecting to login...", "error");
          localStorage.removeItem("token");
          setTimeout(() => window.location.href = "/login", 10000);
        }
      }

      // Handle agents response
      if (agentsRes.status === "fulfilled") {
        setAgents(agentsRes.value.data);
      } else {
        console.error("Failed to load agents:", agentsRes.reason);
      }

      // Handle debts response
      if (debtsRes.status === "fulfilled") {
        setAllDebts(debtsRes.value.data);
      } else {
        console.error("Failed to load debts:", debtsRes.reason);
      }

    } catch (err) {
      console.error("Error loading data:", err);
      showToast("load_error", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // Prepare data for backend
      const paymentData = {
        ...form,
        amount: parseFloat(form.amount),
        agent_id: parseInt(form.agent_id),
        status: "pending", // Default status
        // Append day to month string for backend compatibility
        payment_date: `${form.payment_date}-25`
      };
      
      await createPayment(paymentData);
      showToast("payment_success", "success");
      
      // Reset form
      setForm({
        agent_id: "",
        amount: "",
        payment_date: new Date().toISOString().slice(0, 7),
      });
      
      // Reload payments
      loadData();
      
    } catch (err) {
      console.error("Error creating payment:", err);
      const detail = err.response?.data?.detail;
      showToast(detail || "Failed to create payment", "error");
    }
  }

  // Handle Validate (Update Status)
  async function handleValidate(paymentId) {
    try {
        await updatePaymentStatus(paymentId, "Completed");
        showToast("payment_validated", "success");
        // Refresh list
        loadData();
    } catch (err) {
        console.error("Error validating payment:", err);
        showToast("Failed to validate payment", "error");
    }
  }

  // Handle Cancel
  async function handleCancel(paymentId) {
    if (!window.confirm("Are you sure you want to cancel this payment?")) return;

    try {
        await updatePaymentStatus(paymentId, "Cancelled");
        showToast("payment_cancelled", "success");
        loadData();
    } catch (err) {
        console.error("Error cancelling payment:", err);
        showToast("Failed to cancel payment", "error");
    }
  }

  // Helper to get agent name
  const getAgentName = (id) => {
      const agent = agents.find(a => a.id === id);
      return agent ? agent.name : `Agent #${id}`;
  };

  // Show loading state
  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>Loading payments...</div>;
  }

  // Max date for month picker (current month)
  const maxMonth = new Date().toISOString().slice(0, 7);

  return (
    <>
      <h2>{t("payments")}</h2>

      {/* CREATE FORM */}
      <form className="animate-slide-up" onSubmit={handleSubmit} style={{ 
          marginBottom: "30px", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "25px", 
          backgroundColor: "var(--card-bg)",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "var(--card-shadow)",
          maxWidth: "1000px",
          margin: "0 auto 40px auto"
      }}>
        <div className="form-group">
          <label htmlFor="agent_id">{t("agents")}</label>
          <select
            id="agent_id"
            name="agent_id"
            value={form.agent_id}
            onChange={(e) => {
                const agentId = parseInt(e.target.value);
                const agent = agents.find(a => a.id === agentId);
                const selectedMonth = form.payment_date;
                const agentDebtsInMonth = allDebts.filter(d => 
                    d.agent_id === agentId && 
                    d.debt_date.startsWith(selectedMonth)
                );
                const totalMonthDebt = agentDebtsInMonth.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
                const finalAmount = agent ? Math.max(0, agent.salary - totalMonthDebt) : "";

                setForm({ 
                    ...form, 
                    agent_id: e.target.value,
                    amount: finalAmount
                });
            }}
            required
            style={{ width: "100%" }}
          >
            <option value="">{t("select_agent")}</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">{t("salary")}</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            readOnly
            style={{ width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_date">{t("payment_month")}</label>
          <input
            id="payment_date"
            name="payment_date"
            type="month"
            max={maxMonth}
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            required
            style={{ width: "100%" }}
          />
        </div>

        {/* Removed Status Select - Defaults to Pending */}

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <button 
            type="submit"
            className="btn"
            style={{
              padding: "12px 40px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: "1rem",
              minWidth: "220px"
            }}
          >
            {t("add_payment")}
          </button>
        </div>
      </form>

      {/* PAYMENTS LIST */}
      <div style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <h3>{t("payment_list")} ({payments.length})</h3>
        </div>

        {payments.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border-color)" }}>
            {t("no_payments_found")}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("agents")}</th>
                  <th>{t("salary")}</th>
                  <th>{t("date")}</th>
                  <th>{t("status")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    {/* Display Agent Name */}
                    <td>{getAgentName(p.agent_id)}</td>
                    <td>${parseFloat(p.amount).toFixed(2)}</td>
                    <td>{p.payment_date}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: 
                          p.status === "Completed" ? "#d4edda" :
                          p.status === "Cancelled" ? "#e2e3e5" :
                          p.status === "pending" || p.status === "Pending" ? "#fff3cd" :
                          "#f8d7da",
                        color: 
                          p.status === "Completed" ? "#155724" :
                          p.status === "Cancelled" ? "#383d41" :
                          p.status === "pending" || p.status === "Pending" ? "#856404" :
                          "#721c24",
                        textTransform: "capitalize"
                      }}>
                        {t(p.status.toLowerCase())}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        {/* Show Validate Button only if Pending */}
                        {(p.status === "pending" || p.status === "Pending") && (
                          <>
                            <button
                              onClick={() => handleValidate(p.id)}
                              className="btn btn-success"
                            >
                                <span className="desktop-only">Validate</span>
                                <FaCheck className="mobile-only" />
                            </button>
                            
                            <button
                              onClick={() => handleCancel(p.id)}
                              className="btn btn-cancel"
                            >
                                <span className="desktop-only">Cancel</span>
                                <FaTimes className="mobile-only" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
