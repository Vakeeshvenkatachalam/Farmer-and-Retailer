import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import "../../styles/theme.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("");   // NEW: role selection
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError("");

    // Client-side guard: role must be selected
    if (!role) {
      setError("Please select your role before logging in.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
        role: role.toUpperCase(),
      });

      const userData = response.data;
      login(userData);

      if (userData.role === "RETAILER") navigate("/retailer");
      else if (userData.role === "FARMER")  navigate("/farmer");
      else if (userData.role === "ADMIN")   navigate("/admin");

    } catch (err) {
      if (err.response && err.response.data) {
          setError(typeof err.response.data === 'string' ? err.response.data : "Invalid email or password.");
      } else {
          setError("Server unreachable or network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="glass-card" style={{ width: "420px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🌾 Login</h2>

        {error && (
          <div style={{
            color: "#ff6b6b",
            background: "rgba(255,107,107,0.1)",
            border: "1px solid #ff6b6b",
            borderRadius: "6px",
            padding: "10px",
            marginBottom: "14px",
            textAlign: "center",
            fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        {/* Role selector — placed first so users pick role before credentials */}
        <label style={{ color: "#ccc", fontSize: "13px", display: "block", marginBottom: "4px" }}>
          Select Your Role *
        </label>
        <select
          style={{ ...inputStyle, background: "#1a1a2e", color: "#fff" }}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Select Role --</option>
          <option value="farmer">🌾 Farmer</option>
          <option value="retailer">🛒 Retailer</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          className="primary-btn"
          style={{ width: "100%", marginTop: "8px" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", color: "#aaa", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#00ffcc" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0 12px",
  borderRadius: "6px",
  border: "1px solid #444",
  display: "block",
  boxSizing: "border-box",
};

export default Login;