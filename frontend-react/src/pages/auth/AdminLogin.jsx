import { useNavigate } from "react-router-dom";
import { useState } from "react";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "admin@farm.com" && password === "admin123") {

      localStorage.setItem("role", "ADMIN");

      navigate("/admin");

    } else {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div className="page-center">
      <div className="glass-card" style={{ width: "350px" }}>
        <h2 style={{ textAlign: "center" }}>Admin Login</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;