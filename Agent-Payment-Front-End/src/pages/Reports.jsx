import { useEffect, useState } from "react";
import { getAgents } from "../services/agents.js";
import { downloadAgentList, downloadDebtList, downloadPayslip } from "../services/reports.js";

export default function Reports() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [filters, setFilters] = useState({
    agent_id: "",
    year: new Date().getFullYear(),
    month: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const res = await getAgents();
      setAgents(res.data);
    } catch (err) {
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (type, specificParams = {}) => {
    try {
        let response;
        let filename = "report.pdf";

        if (type === "agents") {
            response = await downloadAgentList();
            filename = "agents_list.pdf";
        } else if (type === "debts") {
            response = await downloadDebtList();
            filename = "debts_list.pdf";
        } else {
            const params = {
                agent_id: filters.agent_id,
                type: type, // monthly, yearly, all
                ...specificParams
            };
            if (!params.agent_id) {
                return;
            }
            response = await downloadPayslip(params);
            filename = `payslip_${type}_${filters.agent_id}.pdf`;
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error("Download failed:", err);
    }
  };

  if (loading) return <div className="content">Loading agents...</div>;

  const years = [2024, 2025, 2026];

  return (
    <div className="content">
      <h2>Management Reports</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        
        {/* GLOBAL REPORTS */}
        <div className="card" style={{ padding: "25px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ borderBottom: "2px solid #f0f2f5", paddingBottom: "10px", marginBottom: "20px", color: "#1e3c72" }}>General Reports</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>Generate global lists for system data.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <button className="btn" onClick={() => handleDownload("agents")} style={{ backgroundColor: "#1e3c72", color: "white", padding: "12px" }}>
              Download All Agents (PDF)
            </button>
            <button className="btn" onClick={() => handleDownload("debts")} style={{ backgroundColor: "#2c3e50", color: "white", padding: "12px" }}>
              Download All Debts (PDF)
            </button>
          </div>
        </div>

        {/* PAYSLIPS SECTION */}
        <div className="card" style={{ padding: "25px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ borderBottom: "2px solid #f0f2f5", paddingBottom: "10px", marginBottom: "20px", color: "#27ae60" }}>Agent Payslips</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "600" }}>Select Agent</label>
              <select 
                value={filters.agent_id} 
                onChange={(e) => setFilters({...filters, agent_id: e.target.value})}
                style={{ width: "100%" }}
              >
                <option value="">-- Choose Agent --</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Month for Monthly</label>
                <input 
                  type="month" 
                  value={filters.month} 
                  onChange={(e) => setFilters({...filters, month: e.target.value})}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Year for Yearly</label>
                <select 
                  value={filters.year} 
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  style={{ width: "100%" }}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="btn btn-success" onClick={() => handleDownload("monthly", { month: filters.month })}>
                Monthly PDF
              </button>
              <button className="btn btn-success" onClick={() => handleDownload("yearly", { year: filters.year })}>
                Yearly PDF
              </button>
            </div>
            <button className="btn" onClick={() => handleDownload("all")} style={{ backgroundColor: "#34495e", color: "white" }}>
              Download All-Time History
            </button>
          </div>
        </div>

      </div>

      <div style={{ marginTop: "40px", padding: "20px", background: "#f8f9fa", borderRadius: "10px", border: "1px dashed #ccc", textAlign: "center" }}>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Note: All payslips only include <strong>"Completed"</strong> payments. Pending or Cancelled payments are excluded from the earnings calculation.
          </p>
      </div>
    </div>
  );
}
