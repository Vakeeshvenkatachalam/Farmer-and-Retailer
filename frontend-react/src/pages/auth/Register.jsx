import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase, FiCreditCard, FiArrowRight, FiArrowLeft } from "react-icons/fi";

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
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill all account details.");
        return;
      }
    } else if (step === 2) {
      if (!role) {
        setError("Please select a role to continue.");
        return;
      }
    }
    
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const data = {
        ...formData,
        role: role.toUpperCase()
      };

      await axiosInstance.post("/auth/register", data);

      if (role === "retailer") {
        alert("Registration Successful! Please login.");
        navigate("/login");
      } else {
        alert("Farmer registration sent for admin approval. You will be notified via email.");
        navigate("/login");
      }

    } catch (err) {
      if (err.response && err.response.data) {
          setError(typeof err.response.data === 'string' ? err.response.data : "Registration Failed.");
      } else {
          setError("Server unreachable or network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base-cream font-sans text-text-dark justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 z-10 relative">
        <div className="text-center">
          <div className="flex justify-center text-4xl mb-2">🌾</div>
          <h2 className="text-3xl font-extrabold text-text-dark">Create Your Account</h2>
          <p className="mt-2 text-sm text-text-medium">
            Join the FarmConnect community today.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-4 pb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Account</span>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Role</span>
            <span className={`text-xs font-semibold ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>Details</span>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
            <div style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* STEP 1 - ACCOUNT DETAILS */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiUser />
                </div>
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="Create Password"
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-primary hover:bg-green-600 transition-all font-bold mt-6"
              >
                Continue <FiArrowRight />
              </button>
            </div>
          )}

          {/* STEP 2 - ROLE SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole("farmer")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                    role === "farmer" ? "border-primary bg-primary/5 text-primary" : "border-gray-100 hover:border-gray-200 text-gray-500"
                  }`}
                >
                  <span className="text-4xl mb-3">👨‍🌾</span>
                  <span className="font-bold">I am a Farmer</span>
                  <span className="text-xs text-center mt-2 text-gray-400">Sell your crops directly</span>
                </button>
                
                <button
                  onClick={() => setRole("retailer")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                    role === "retailer" ? "border-accent-orange bg-accent-orange/5 text-accent-orange" : "border-gray-100 hover:border-gray-200 text-gray-500"
                  }`}
                >
                  <span className="text-4xl mb-3">🛒</span>
                  <span className="font-bold">I am a Retailer</span>
                  <span className="text-xs text-center mt-2 text-gray-400">Buy fresh farm products</span>
                </button>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border border-gray-200 rounded-xl text-text-dark bg-white hover:bg-gray-50 transition-all font-bold"
                >
                  <FiArrowLeft /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-primary hover:bg-green-600 transition-all font-bold"
                >
                  Continue <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiPhone /></div>
                  <input name="phone" placeholder="Phone Number" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.phone} onChange={handleChange} />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiMapPin /></div>
                  <input name="village" placeholder="Village / City" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.village} onChange={handleChange} />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiMapPin /></div>
                  <input name="district" placeholder="District" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.district} onChange={handleChange} />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiMapPin /></div>
                  <input name="state" placeholder="State" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.state} onChange={handleChange} />
                </div>

                {role === "farmer" && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiBriefcase /></div>
                      <input name="farmType" placeholder="Farm Type / Crops" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.farmType} onChange={handleChange} />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FiCreditCard /></div>
                      <input name="farmerId" placeholder="Farmer ID / Govt Card" className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-gray-50" value={formData.farmerId} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border border-gray-200 rounded-xl text-text-dark bg-white hover:bg-gray-50 transition-all font-bold"
                  disabled={loading}
                >
                  <FiArrowLeft /> Back
                </button>
                <button
                  onClick={handleRegister}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-primary hover:bg-green-600 transition-all font-bold"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-text-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-green-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;