import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "../../styles/theme.css";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    farmType: "",
    farmerId: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    if (!role) {
      setError("Please select a role");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = {
        ...formData,
        role: role.toUpperCase()
      };

      const response = await axiosInstance.post("/auth/register", data);

      if (role === "retailer") {
        alert("Registration Successful! Please login.");
        navigate("/login");
      } else {
        alert("Farmer registration sent for admin approval. You will be notified via email.");
        navigate("/login");
      }

    } catch (err) {
      setError(err.response?.data || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="glass-card" style={{ width: "500px" }}>

        {/* STEP 1 - CREATE ACCOUNT */}
        {step === 1 && (
          <>
            <h2 style={{ textAlign: "center" }}>Create Account</h2>

            {error && (
              <div style={{ color: "#ff6b6b", marginBottom: "10px", textAlign: "center" }}>
                {error}
              </div>
            )}

            <input
              name="name"
              placeholder="Name"
              style={inputStyle}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              name="email"
              placeholder="Email"
              style={inputStyle}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              style={inputStyle}
              onChange={handleChange}
              disabled={loading}
            />

            <button
              className="primary-btn"
              style={{ width: "100%" }}
              onClick={handleNext}
              disabled={loading}
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 - ROLE SELECTION */}
        {step === 2 && (
          <>
            <h2 style={{ textAlign: "center" }}>Select Role</h2>

            {error && (
              <div style={{ color: "#ff6b6b", marginBottom: "10px", textAlign: "center" }}>
                {error}
              </div>
            )}

            <select
              style={inputStyle}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Role --</option>
              <option value="farmer">Farmer</option>
              <option value="retailer">Retailer</option>
            </select>

            {/* RETAILER FORM */}
            {role === "retailer" && (
              <>
                <input
                  name="phone"
                  placeholder="Phone Number"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="village"
                  placeholder="Village"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="district"
                  placeholder="District"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="state"
                  placeholder="State"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
              </>
            )}

            {/* FARMER FORM */}
            {role === "farmer" && (
              <>
                <input
                  name="phone"
                  placeholder="Phone Number"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="village"
                  placeholder="Village"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="district"
                  placeholder="District"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="state"
                  placeholder="State"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="farmType"
                  placeholder="Farm Type / Crops"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  name="farmerId"
                  placeholder="Farmer ID / Govt Card"
                  style={inputStyle}
                  onChange={handleChange}
                  disabled={loading}
                />
              </>
            )}

            {role && (
              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "none"
};

export default Register;