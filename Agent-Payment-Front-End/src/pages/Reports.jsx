import { useEffect, useState } from "react";
import { getAgents } from "../services/agents.js";
import { downloadAgentList, downloadDebtList, downloadPayslip } from "../services/reports.js";
import { useUI } from "../context/UIContext";

export default function Reports() {
  const { t, theme, showToast } = useUI();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      console.error("Error loading agents:", err);
      showToast("load_error", "error");
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
                showToast("select_agent", "error");
                return;
            }
            response = await downloadPayslip(params);
            filename = `payslip_${type}_${filters.agent_id}.pdf`;
        }

        // Verify response has data
        if (!response || !response.data) {
            console.error("No data received from server");
            showToast("Download failed - no data", "error");
            return;
        }

        // Create blob and download with proper PDF mime type
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup with delay to ensure download starts
        setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(url);
        }, 100);
        
        // Show success message
        showToast("Download started successfully", "success");
    } catch (err) {
        console.error("Download error:", err);
        // Error logged to console only, no toast notification
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem", color: "var(--text-color)" }}>{t("loading_agents")}...</div>;

  const years = [2024, 2025, 2026];

  return (
    <>
      <h2>{t("management_reports")}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        
        {/* GLOBAL REPORTS */}
        <div className="card" style={{ padding: "25px", backgroundColor: "var(--card-bg)", borderRadius: "12px", boxShadow: "var(--card-shadow)", color: "var(--text-color)" }}>
          <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: theme === "dark" ? "#fff" : "var(--primary-color)" }}>{t("general_reports")}</h3>
          <p style={{ opacity: theme === "dark" ? 1 : 0.85, marginBottom: "20px", fontSize: "0.95rem", color: theme === "dark" ? "#fff" : "inherit" }}>{t("general_reports_desc")}</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <button className="btn" onClick={() => handleDownload("agents")} style={{ backgroundColor: "var(--primary-color)", color: "white", padding: "12px" }}>
              {t("download_all_agents")}
            </button>
            <button className="btn" onClick={() => handleDownload("debts")} style={{ backgroundColor: "#2c3e50", color: "white", padding: "12px" }}>
              {t("download_all_debts")}
            </button>
          </div>
        </div>

        {/* PAYSLIPS SECTION */}
        <div className="card" style={{ padding: "25px", backgroundColor: "var(--card-bg)", borderRadius: "12px", boxShadow: "var(--card-shadow)", color: "var(--text-color)" }}>
          <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: theme === "dark" ? "#fff" : "#27ae60" }}>{t("agent_payslips")}</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="form-group">
              <label htmlFor="choose_agent">{t("select_agent")}</label>
              <select 
                id="choose_agent"
                value={filters.agent_id} 
                onChange={(e) => setFilters({...filters, agent_id: e.target.value})}
                style={{ width: "100%" }}
              >
                <option value="">-- {t("choose_agent")} --</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group">
                <label htmlFor="month_monthly">{t("month_for_monthly")}</label>
                <input 
                  id="month_monthly"
                  type="month" 
                  value={filters.month} 
                  onChange={(e) => setFilters({...filters, month: e.target.value})}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="year_yearly">{t("year_for_yearly")}</label>
                <select 
                  id="year_yearly"
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
                {t("monthly_pdf")}
              </button>
              <button className="btn btn-success" onClick={() => handleDownload("yearly", { year: filters.year })}>
                {t("yearly_pdf")}
              </button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <button className="btn" onClick={() => handleDownload("all")} style={{ backgroundColor: "#34495e", color: "white", width: "100%", padding: "12px" }}>
                {t("download_all_time")}
              </button>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: "40px", padding: "20px", background: "var(--card-bg)", borderRadius: "10px", border: "1px dashed var(--border-color)", textAlign: "center", color: "var(--text-color)" }}>
          <p style={{ opacity: theme === "dark" ? 1 : 0.85, fontSize: "0.95rem", color: theme === "dark" ? "#fff" : "inherit" }}>
            {t("payslip_note")}
          </p>
      </div>
    </>
  );
}
