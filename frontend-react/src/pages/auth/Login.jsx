import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import "../../styles/theme.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const userData = response.data;
      login(userData); // This stores token, user data, etc.

      if (userData.role === "RETAILER") {
        navigate("/retailer");
      } else if (userData.role === "FARMER") {
        navigate("/farmer");
      } else if (userData.role === "ADMIN") {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="glass-card" style={{ width: "400px" }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        {error && (
          <div style={{ color: "#ff6b6b", marginBottom: "15px", textAlign: "center" }}>
            {error}
          </div>
        )}

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
        />

        <button
          className="primary-btn"
          style={{ width: "100%" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
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
  margin: "8px 0",
  borderRadius: "6px",
  border: "none",
};

export default Login;