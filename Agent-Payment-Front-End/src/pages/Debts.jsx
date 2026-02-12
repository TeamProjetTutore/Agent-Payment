import { useEffect, useState } from "react";
import { getDebts, createDebt, deleteDebt } from "../services/debts";
import { getAgents } from "../services/agents";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

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
        setError(`Debt refused: This would leave the agent with less than 20% of their salary ($${(agent.salary * 0.2).toFixed(2)}). Max additional debt allowed: $${Math.max(0, maxAllowedDebt - existingMonthlyDebts).toFixed(2)}`);
        return;
      }

      await createDebt({
        ...form,
        agent_id: agentId,
        amount: amount
      });
      
      setForm({
        agent_id: "",
        amount: "",
        reason: "",
        debt_date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (err) {
      setError("Failed to create debt");
    }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this record?")) {
      deleteDebt(id).then(loadData);
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

  if (loading) return <div className="content">Loading...</div>;


  return (
    <div className="content">
      <h2>Agent Debts</h2>
      
      {error && <p className="error-text">{error}</p>}

      <form className="form-inline" onSubmit={handleSubmit} style={{ marginBottom: "30px", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Agent</label>
          <select 
            value={form.agent_id} 
            onChange={(e) => setForm({...form, agent_id: e.target.value})}
            required
            style={{ width: "100%" }}
          >
            <option value="">Select Agent</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Debt Amount</label>
          <input 
            type="number" 
            placeholder="Amount" 
            value={form.amount} 
            onChange={(e) => setForm({...form, amount: e.target.value})}
            required
            min="0"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ flex: 2 }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Reason</label>
          <input 
            type="text" 
            placeholder="Reason for debt" 
            value={form.reason} 
            onChange={(e) => setForm({...form, reason: e.target.value})}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Date</label>
          <input 
            type="date" 
            value={form.debt_date} 
            readOnly
            disabled
            style={{ width: "100%", backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit" className="btn" style={{ backgroundColor: "#1e3c72", color: "white", height: "42px", padding: "0 20px" }}>
            Add Debt
          </button>
        </div>
      </form>

      {form.agent_id && (
        <div style={{ marginBottom: "20px", padding: "15px", background: "#e8f0fe", borderRadius: "8px", borderLeft: "5px solid #1e3c72" }}>
            <strong>Calculation for {selectedAgent.name}:</strong> Base Salary: ${selectedAgent.salary.toLocaleString()} - Total Debts (Month): ${(monthlyDebtsForAgent + currentDebtAmount).toLocaleString()} = 
            {isAmountValid && isWithinLimit && (
              <span style={{ fontSize: "1.2rem", color: "#1e3c72", fontWeight: "bold", marginLeft: "10px" }}>
                 Rest to Receive: ${remainingSalary.toLocaleString()}
              </span>
            )}
            {!isWithinLimit && form.amount && (
              <span style={{ color: "#e74c3c", marginLeft: "10px", fontWeight: "bold" }}>
                [Limit Exceeded]
              </span>
            )}
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Action</th>
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
    </div>
  );
}
