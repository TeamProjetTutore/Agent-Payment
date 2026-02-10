export default function Dashboard() {
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome, {user?.name || "User"}</p>
      </header>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Agents</h3>
          <p>24</p>
        </div>

        <div className="card">
          <h3>Payments This Month</h3>
          <p>$3,200</p>
        </div>

        <div className="card">
          <h3>Pending Payments</h3>
          <p>5</p>
        </div>
      </div>
    </div>
  );
}
