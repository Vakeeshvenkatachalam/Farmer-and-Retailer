import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("");   // NEW: role selection
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role.toLowerCase());
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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
    <div className="min-h-screen flex bg-base-cream font-sans text-text-dark">
      {/* Left side illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+)] opacity-20"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-10 -left-10"></div>
        <div className="absolute w-96 h-96 bg-primary-light/20 rounded-full blur-3xl -bottom-10 -right-10"></div>
        
        <div className="relative z-10 text-center px-12 text-white">
          <div className="text-8xl mb-6">🌾</div>
          <h1 className="text-5xl font-bold mb-4">FarmConnect</h1>
          <p className="text-xl text-primary-light max-w-md mx-auto">Welcome back! Sign in to access your dashboard and continue growing your business.</p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark mb-2">Welcome Back</h2>
            <p className="text-text-medium">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Select Your Role</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50 text-text-dark"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Choose Role --</option>
                <option value="farmer">👨‍🌾 Farmer</option>
                <option value="retailer">🛒 Retailer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50 text-text-dark placeholder-gray-400"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50 text-text-dark placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-green-600 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-text-medium text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:text-green-600 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;