import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { FiShield } from "react-icons/fi";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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
    <div className="min-h-screen flex bg-base-cream font-sans text-text-dark">
      {/* Left side illustration - Admin themed */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+)] opacity-20"></div>
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl -top-10 -left-10"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-10 -right-10"></div>
        
        <div className="relative z-10 text-center px-12 text-white">
          <div className="text-8xl mb-6 flex justify-center text-primary"><FiShield /></div>
          <h1 className="text-5xl font-bold mb-4">Secure Portal</h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto">Authorized personnel only. Manage platform approvals, analytics, and network operations.</p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-400"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark mb-2">Admin Access</h2>
            <p className="text-text-medium">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Admin Email Address</label>
              <input
                type="email"
                placeholder="admin@farmconnect.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-gray-50 text-text-dark placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-gray-50 text-text-dark placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to Portal"}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link to="/login" className="text-sm font-medium text-text-medium hover:text-text-dark transition-colors">
              &larr; Back to Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;