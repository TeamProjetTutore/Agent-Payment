import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/reports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaFilter } from "react-icons/fa";

export default function Dashboard() {
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

  if (loading) return <div>Loading dashboard...</div>;

  // Prepare Chart Data
  const chartData = [
    { name: 'Pending', count: stats.pending_count, color: '#ffc107' },
    { name: 'Completed', count: stats.completed_count, color: '#28a745' },
    { name: 'Failed', count: stats.failed_count, color: '#dc3545' },
    { name: 'Cancelled', count: stats.cancelled_count, color: '#6c757d' },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2>Dashboard</h2>

      {/* FILTER BAR - Styled Design */}
      <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "20px",
          backgroundColor: "white", 
          padding: "15px 25px", 
          borderRadius: "12px", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "30px",
          flexWrap: "wrap"
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555", fontWeight: "600" }}>
              <FaFilter /> <span>Filters:</span>
          </div>

          {/* Type Toggle */}
          <div style={{ display: "flex", backgroundColor: "#f0f2f5", borderRadius: "8px", padding: "4px" }}>
              <button 
                onClick={() => setTimeRange("all")} 
                style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    backgroundColor: timeRange === "all" ? "white" : "transparent",
                    color: timeRange === "all" ? "#1e3c72" : "#666",
                    boxShadow: timeRange === "all" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                }}
              >
                  All Time
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
                    backgroundColor: timeRange === "month" ? "white" : "transparent",
                    color: timeRange === "month" ? "#1e3c72" : "#666",
                    boxShadow: timeRange === "month" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                }}
              >
                  Monthly
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
                        border: "1px solid #ddd",
                        backgroundColor: "white",
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
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Agents</h3>
          <p style={valStyle}>{stats.total_agents}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Monthly Payments</h3>
          <p style={valStyle}>${stats.monthly_payments?.toLocaleString()}</p>
        </div>
      </div>

      {/* STATUS CARDS */}
      <h3 style={{ color: "#444", marginBottom: "15px" }}>Payment Statuses</h3>
      <div className="dashboard-status-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <div style={{...cardStyle, borderLeft: "5px solid #ffc107"}}>
          <h4 style={statusTitleStyle}>Pending</h4>
          <p style={valStyle}>{stats.pending_count}</p>
        </div>
        <div style={{...cardStyle, borderLeft: "5px solid #28a745"}}>
          <h4 style={statusTitleStyle}>Completed</h4>
          <p style={valStyle}>{stats.completed_count}</p>
        </div>
        <div style={{...cardStyle, borderLeft: "5px solid #dc3545"}}>
          <h4 style={statusTitleStyle}>Failed</h4>
          <p style={valStyle}>{stats.failed_count}</p>
        </div>
        <div style={{...cardStyle, borderLeft: "5px solid #6c757d"}}>
          <h4 style={statusTitleStyle}>Cancelled</h4>
          <p style={valStyle}>{stats.cancelled_count}</p>
        </div>
      </div>

      {/* CHART */}
      <h3 style={{ color: "#444", marginBottom: "15px" }}>Payment Distribution</h3>
      <div style={{ height: "400px", width: "100%", backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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

    </div>
  );
}

const cardStyle = {
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  textAlign: "center",
  transition: "transform 0.2s",
  cursor: "default"
};

const cardTitleStyle = {
    margin: "0 0 10px 0",
    color: "#666",
    fontSize: "1em",
    fontWeight: "500"
};

const statusTitleStyle = {
    margin: "0 0 5px 0",
    color: "#555",
    fontSize: "0.9em"
};

const valStyle = {
  fontSize: "2.2em",
  fontWeight: "700",
  margin: "0",
  color: "#333"
};
