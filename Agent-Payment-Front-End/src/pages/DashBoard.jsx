import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/reports.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaFilter } from "react-icons/fa";
import { useUI } from "../context/UIContext";

export default function Dashboard() {
  const { t, theme } = useUI();
  const [stats, setStats] = useState({
    total_agents: 0,
    monthly_payments: 0,
    pending_count: 0,
    completed_count: 0,
    failed_count: 0,
    cancelled_count: 0,
    recent_payments: [] 
  });
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [timeRange, setTimeRange] = useState("all"); // 'all' | 'month'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Generate months from current back to Jan 2024
  const getMonthsSince2024 = () => {
      const months = [];
      const today = new Date();
      // Start from first day of current month
      let d = new Date(today.getFullYear(), today.getMonth(), 1);
      const stopDate = new Date(2024, 0, 1); // Jan 1, 2024

      while (d >= stopDate) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const value = `${year}-${month}`;
          const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
          months.push({ value, label });
          
          // Decrement month
          d.setMonth(d.getMonth() - 1);
      }
      return months;
  };
  const monthOptions = getMonthsSince2024();

  useEffect(() => {
    async function loadStats() {
      try {
        const params = {};
        if (timeRange === "month") {
            params.month = selectedMonth;
        }

        const res = await getDashboardStats(params);
        setStats(res.data);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [timeRange, selectedMonth]);

  if (loading) return <div style={{ color: "var(--text-color)" }}>{t("loading_dashboard")}...</div>;

  // Prepare Chart Data
  const chartData = [
    { name: 'Pending', count: stats.pending_count, color: '#ffc107' },
    { name: 'Completed', count: stats.completed_count, color: '#28a745' },
    { name: 'Failed', count: stats.failed_count, color: '#dc3545' },
    { name: 'Cancelled', count: stats.cancelled_count, color: '#6c757d' },
  ];

  return (
    <>
      <h2>{t("dashboard")}</h2>

      {/* FILTER BAR - Styled Design */}
      <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "20px",
          backgroundColor: "var(--card-bg)", 
          padding: "15px 25px", 
          borderRadius: "12px", 
          boxShadow: "var(--card-shadow)",
          marginBottom: "30px",
          flexWrap: "wrap",
          color: "var(--text-color)"
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
              <FaFilter /> <span>{t("filters")}:</span>
          </div>

          {/* Type Toggle */}
          <div style={{ display: "flex", backgroundColor: "var(--border-color)", borderRadius: "8px", padding: "4px", opacity: 0.9 }}>
              <button 
                onClick={() => setTimeRange("all")} 
                style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    backgroundColor: timeRange === "all" ? "var(--bg-color)" : "transparent",
                    color: timeRange === "all" ? "var(--primary-color)" : "var(--text-color)",
                    boxShadow: timeRange === "all" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                }}
              >
                  {t("all_time")}
              </button>
              <button 
                onClick={() => setTimeRange("month")} 
                style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    backgroundColor: timeRange === "month" ? "var(--bg-color)" : "transparent",
                    color: timeRange === "month" ? "var(--primary-color)" : "var(--text-color)",
                    boxShadow: timeRange === "month" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                }}
              >
                  {t("monthly")}
              </button>
          </div>

          {/* Month Dropdown (Conditional) */}
          {timeRange === "month" && (
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <FaCalendarAlt style={{ position: "absolute", left: "12px", color: "#888" }} />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                        padding: "10px 15px 10px 35px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--card-bg)",
                        color: "var(--text-color)",
                        fontSize: "0.95em",
                        outline: "none",
                        cursor: "pointer",
                        minWidth: "180px"
                    }}
                  >
                      {monthOptions.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                  </select>
              </div>
          )}
      </div>

      {/* TOP CARDS */}
      <div className="dashboard-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={cardStyle(theme)}>
          <h3 style={cardTitleStyle(theme)}>{t("total_agents")}</h3>
          <p style={valStyle(theme)}>{stats.total_agents}</p>
        </div>
        <div style={cardStyle(theme)}>
          <h3 style={cardTitleStyle(theme)}>{t("monthly_payments")}</h3>
          <p style={valStyle(theme)}>${stats.monthly_payments?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* STATUS CARDS */}
      <h3 style={{ color: "var(--text-color)", marginBottom: "15px" }}>{t("payment_statuses")}</h3>
      <div className="dashboard-status-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <div style={{...cardStyle(theme), borderLeft: "5px solid #ffc107"}}>
          <h4 style={statusTitleStyle(theme)}>{t("pending")}</h4>
          <p style={valStyle(theme)}>{stats.pending_count}</p>
        </div>
        <div style={{...cardStyle(theme), borderLeft: "5px solid #28a745"}}>
          <h4 style={statusTitleStyle(theme)}>{t("completed")}</h4>
          <p style={valStyle(theme)}>{stats.completed_count}</p>
        </div>
        <div style={{...cardStyle(theme), borderLeft: "5px solid #dc3545"}}>
          <h4 style={statusTitleStyle(theme)}>{t("failed")}</h4>
          <p style={valStyle(theme)}>{stats.failed_count}</p>
        </div>
        <div style={{...cardStyle(theme), borderLeft: "5px solid #6c757d"}}>
          <h4 style={statusTitleStyle(theme)}>{t("cancelled")}</h4>
          <p style={valStyle(theme)}>{stats.cancelled_count}</p>
        </div>
      </div>

      {/* CHART */}
      <h3 style={{ color: "var(--text-color)", marginBottom: "15px" }}>{t("payment_distribution")}</h3>
      <div style={{ height: "400px", width: "100%", backgroundColor: "var(--card-bg)", padding: "20px", borderRadius: "12px", boxShadow: "var(--card-shadow)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#444" : "#eee"} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "var(--text-color)"}} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: "var(--text-color)"}} />
            <Tooltip 
                contentStyle={{ backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", color: "var(--text-color)" }}
                itemStyle={{ color: "var(--text-color)" }}
                cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </>
  );
}

const cardStyle = (theme) => ({
  padding: "20px",
  backgroundColor: "var(--card-bg)",
  borderRadius: "12px",
  boxShadow: "var(--card-shadow)",
  textAlign: "center",
  transition: "transform 0.2s",
  cursor: "default",
  color: "var(--text-color)"
});

const cardTitleStyle = (theme) => ({
    margin: "0 0 10px 0",
    color: "var(--text-color)",
    opacity: 0.7,
    fontSize: "1em",
    fontWeight: "500"
});

const statusTitleStyle = (theme) => ({
    margin: "0 0 5px 0",
    color: "var(--text-color)",
    opacity: 0.8,
    fontSize: "0.9em"
});

const valStyle = (theme) => ({
  fontSize: "2.2em",
  fontWeight: "700",
  margin: "0",
  color: "var(--primary-color)"
});
