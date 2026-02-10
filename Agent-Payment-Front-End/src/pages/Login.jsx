export default function Login() {
  return (
    <div className="login-container">
      <form className="login-card">
        <h1 className="login-title">School Agent Payment</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="admin@school.com" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
        </div>

        <button className="login-btn">Login</button>

        <p className="login-footer">
          © {new Date().getFullYear()} School Payment System
        </p>
      </form>
    </div>
  );
}

