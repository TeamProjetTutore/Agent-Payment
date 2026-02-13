import { useEffect, useState } from "react";
import { getDebts, createDebt, deleteDebt } from "../services/debts";
import { getAgents } from "../services/agents";
import { useUI } from "../context/UIContext";

export default function Debts() {
  const { t, theme, showToast } = useUI();
  const [debts, setDebts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    agent_id: "",
    amount: "",
    reason: "",
    debt_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [debtsRes, agentsRes] = await Promise.all([
        getDebts(),
        getAgents()
      ]);
      setDebts(debtsRes.data);
      setAgents(agentsRes.data);
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
      const agentId = parseInt(form.agent_id);
      const amount = parseFloat(form.amount);
      const agent = agents.find(a => a.id === agentId);

      if (!agent) return;

      // Current month prefix (YYYY-MM)
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Calculate existing debts for this month
      const existingMonthlyDebts = debts
        .filter(d => d.agent_id === agentId && d.debt_date.startsWith(currentMonth))
        .reduce((sum, d) => sum + d.amount, 0);

      const totalPotentialDebt = existingMonthlyDebts + amount;
      const maxAllowedDebt = agent.salary * 0.8; // Must keep at least 20%

      if (totalPotentialDebt > maxAllowedDebt) {
        showToast("limit_exceeded", "error");
        return;
      }

      await createDebt({
        ...form,
        agent_id: agentId,
        amount: amount
      });
      showToast("debt_success", "success");
      
      setForm({
        agent_id: "",
        amount: "",
        reason: "",
        debt_date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (err) {
      console.error("Error creating debt:", err);
      showToast("Failed to create debt", "error");
    }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this record?")) {
      deleteDebt(id).then(() => {
        showToast("delete_success", "success");
        loadData();
      }).catch(err => {
        console.error("Error deleting debt:", err);
        showToast("delete_error", "error");
      });
    }
  }

  const getAgent = (id) => agents.find(a => a.id === id) || {};
  
  const selectedAgentId = parseInt(form.agent_id);
  const selectedAgent = getAgent(selectedAgentId);
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Calculate cumulative rest to receive for the current month
  const monthlyDebtsForAgent = debts
    .filter(d => d.agent_id === selectedAgentId && d.debt_date.startsWith(currentMonth))
    .reduce((sum, d) => sum + d.amount, 0);

  const maxAllowedDebt = selectedAgent.salary ? selectedAgent.salary * 0.8 : 0;
  const currentDebtAmount = parseFloat(form.amount) || 0;
  const isAmountValid = currentDebtAmount >= 0;
  const isWithinLimit = (monthlyDebtsForAgent + currentDebtAmount) <= maxAllowedDebt;

  const remainingSalary = selectedAgent.salary 
    ? selectedAgent.salary - monthlyDebtsForAgent - currentDebtAmount 
    : 0;

  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>Loading...</div>;


  return (
    <>
      <h2>{t("agent_debts")}</h2>

      <form className="animate-slide-up" onSubmit={handleSubmit} style={{ 
          marginBottom: "30px", 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
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
            value={form.agent_id} 
            onChange={(e) => setForm({...form, agent_id: e.target.value})}
            required
            style={{ width: "100%" }}
          >
            <option value="">{t("select_agent")}</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">{t("debt_amount")}</label>
          <input 
            id="amount"
            type="number" 
            placeholder={t("debt_amount")} 
            value={form.amount} 
            onChange={(e) => setForm({...form, amount: e.target.value})}
            required
            min="0"
            style={{ width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="debt_date">{t("date")}</label>
          <input 
            id="debt_date"
            type="date" 
            value={form.debt_date} 
            readOnly
            disabled
            style={{ width: "100%", opacity: 0.7 }}
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="reason">{t("reason")}</label>
          <textarea 
            id="reason"
            placeholder={t("reason")} 
            value={form.reason} 
            onChange={(e) => setForm({...form, reason: e.target.value})}
            required
            rows="3"
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <button type="submit" className="btn" style={{ backgroundColor: "var(--primary-color)", color: "white", padding: "12px 40px", fontSize: "1rem", minWidth: "220px" }}>
            {t("add_debt")}
          </button>
        </div>
      </form>

      {form.agent_id && (
        <div style={{ marginBottom: "20px", padding: "15px", background: theme === "dark" ? "#1a2a44" : "#e8f0fe", borderRadius: "8px", borderLeft: "5px solid var(--primary-color)", color: "var(--text-color)" }}>
            <strong>{t("calculation_for")} {selectedAgent.name || ""}:</strong> {t("base_salary")}: ${selectedAgent.salary?.toLocaleString() || 0} - {t("total_debts_month")}: ${(monthlyDebtsForAgent + currentDebtAmount).toLocaleString()} = 
            {isAmountValid && isWithinLimit && (
              <span style={{ fontSize: "1.2rem", color: "var(--primary-color)", fontWeight: "bold", marginLeft: "10px" }}>
                 {t("rest_to_receive")}: ${remainingSalary?.toLocaleString() || 0}
              </span>
            )}
            {!isWithinLimit && form.amount && (
              <span style={{ color: "#e74c3c", marginLeft: "10px", fontWeight: "bold" }}>
                [{t("limit_exceeded")}]
              </span>
            )}
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t("agents")}</th>
              <th>{t("debt_amount")}</th>
              <th>{t("reason")}</th>
              <th>{t("date")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {debts.map(d => (
              <tr key={d.id}>
                <td>{getAgent(d.agent_id).name || `ID: ${d.agent_id}`}</td>
                <td style={{ color: "#e74c3c", fontWeight: "bold" }}>-${d.amount}</td>
                <td>{d.reason}</td>
                <td>{d.debt_date}</td>
                <td>
                  <button className="btn danger" onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
