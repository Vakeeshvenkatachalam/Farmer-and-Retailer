import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import "../../styles/theme.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please check both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
        role: "ADMIN",   // Hardcoded role for admin login portal
      });

      const userData = response.data;
      login(userData);

      if (userData.role?.toUpperCase() === "ADMIN") {
        navigate("/admin");
      } else {
        setError("You are not authorized as an Admin.");
      }

    } catch (err) {
      setError(err.response?.data || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="glass-card" style={{ width: "420px", borderTop: "4px solid #ff4757" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#ff4757" }}>🔐 Secure Admin Portal</h2>

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

        <label style={{ color: "#ccc", fontSize: "13px", display: "block", marginBottom: "4px" }}>
          Admin Email
        </label>
        <input
          type="email"
          placeholder="admin@platform.com"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label style={{ color: "#ccc", fontSize: "13px", display: "block", marginBottom: "4px", marginTop: "10px" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          className="danger-btn"
          style={{ width: "100%", marginTop: "16px", background: "#ff4757", color: "white", padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Admin Login"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0 6px",
  borderRadius: "6px",
  border: "1px solid #444",
  display: "block",
  boxSizing: "border-box",
  background: "#1a1a2e",
  color: "#fff"
};

export default AdminLogin;