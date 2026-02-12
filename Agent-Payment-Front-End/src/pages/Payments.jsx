import { useEffect, useState } from "react";
import { getPayments, createPayment, updatePaymentStatus } from "../services/payments.js";
import { getAgents } from "../services/agents.js";
import { getDebts } from "../services/debts.js";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [allDebts, setAllDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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
      setError("Please login first");
      // Redirect to login after showing error
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
      setError("");
      
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
          setError("Session expired. Redirecting to login...");
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
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError("");
      
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
      setError(err.response?.data?.detail || "Failed to create payment");
    }
  }

  // Handle Validate (Update Status)
  async function handleValidate(paymentId) {
    try {
        await updatePaymentStatus(paymentId, "Completed");
        // Refresh list
        loadData();
    } catch (err) {
        console.error("Error validating payment:", err);
        alert("Failed to validate payment");
    }
  }

  // Handle Cancel
  async function handleCancel(paymentId) {
    if (!window.confirm("Are you sure you want to cancel this payment?")) return;

    try {
        await updatePaymentStatus(paymentId, "Cancelled");
        loadData();
    } catch (err) {
        console.error("Error cancelling payment:", err);
        alert("Failed to cancel payment");
    }
  }

  // Helper to get agent name
  const getAgentName = (id) => {
      const agent = agents.find(a => a.id === id);
      return agent ? agent.name : `Agent #${id}`;
  };

  // Show loading state
  if (loading) {
    return <div>Loading payments...</div>;
  }



  // Max date for month picker (current month)
  const maxMonth = new Date().toISOString().slice(0, 7);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Payments</h2>

      {error && (
        <div style={{ 
          color: "#721c24", 
          backgroundColor: "#f8d7da", 
          borderColor: "#f5c6cb",
          padding: "10px", 
          marginBottom: "20px",
          border: "1px solid transparent",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      {/* CREATE FORM */}
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          display: "flex", 
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "flex-end",
          justifyContent: "space-between",
          margin: "0 auto 20px auto",
          maxWidth: "100%",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          backgroundColor: "#fff"
        }}
      >
        <div>
          <label htmlFor="agent_id" style={{ display: "block", marginBottom: "5px" }}>
            Agent:
          </label>
          <select
            id="agent_id"
            name="agent_id"
            value={form.agent_id}
            onChange={(e) => {
                const agentId = parseInt(e.target.value);
                const agent = agents.find(a => a.id === agentId);
                
                // Calculate total debt for this agent in the SELECTED MONTH
                const selectedMonth = form.payment_date; // YYYY-MM
                const agentDebtsInMonth = allDebts.filter(d => 
                    d.agent_id === agentId && 
                    d.debt_date.startsWith(selectedMonth)
                );
                const totalMonthDebt = agentDebtsInMonth.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
                
                // Set amount to salary - total month debt
                const finalAmount = agent ? Math.max(0, agent.salary - totalMonthDebt) : "";

                setForm({ 
                    ...form, 
                    agent_id: e.target.value,
                    amount: finalAmount
                });
            }}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select Agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" style={{ display: "block", marginBottom: "5px" }}>
            Amount:
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            readOnly
            style={{ width: "100%", padding: "8px", backgroundColor: "#e9ecef" }}
          />
        </div>

        <div>
          <label htmlFor="payment_date" style={{ display: "block", marginBottom: "5px" }}>
            Payment Month:
          </label>
          <input
            id="payment_date"
            name="payment_date"
            type="month"
            max={maxMonth}
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            required
          />
        </div>

        {/* Removed Status Select - Defaults to Pending */}

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button 
            type="submit"
            className="btn"
            style={{
              padding: "10px 25px",
              backgroundColor: "#1e3c72",
              color: "white",
            }}
          >
            Add Payment
          </button>
        </div>
      </form>

      {/* PAYMENTS LIST */}
      <div style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <h3>Payment List ({payments.length})</h3>
        </div>

        {payments.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #ddd" }}>
            No payments found
          </div>
        ) : (
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ border: "none", padding: "8px", textAlign: "left" }}>Agent</th>
                  <th style={{ border: "none", padding: "8px", textAlign: "left" }}>Amount</th>
                  <th style={{ border: "none", padding: "8px", textAlign: "left" }}>Payment Date</th>
                  <th style={{ border: "none", padding: "8px", textAlign: "left" }}>Status</th>
                  <th style={{ border: "none", padding: "8px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    {/* Display Agent Name */}
                    <td style={{ border: "none", padding: "8px" }}>{getAgentName(p.agent_id)}</td>
                    <td style={{ border: "none", padding: "8px" }}>${parseFloat(p.amount).toFixed(2)}</td>
                    <td style={{ border: "none", padding: "8px" }}>{p.payment_date}</td>
                    <td style={{ border: "none", padding: "8px" }}>
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
                        {p.status}
                      </span>
                    </td>
                    <td style={{ border: "none", padding: "8px", display: "flex", gap: "5px" }}>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
