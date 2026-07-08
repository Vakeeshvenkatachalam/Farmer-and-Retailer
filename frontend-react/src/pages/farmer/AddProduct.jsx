import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiCamera, FiX, FiCheck } from "react-icons/fi";

function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: "",
    category: "",
    quantity: "",
    price: "",
    harvestDate: "",
    isOrganic: "false",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.productName || !form.category || !form.quantity || !form.price) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/products/add", {
        productName: form.productName,
        category: form.category,
        quantity: parseInt(form.quantity),
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
        farmerId: user.id
      });
      setSuccess("Product listed successfully!");
      setTimeout(() => navigate("/farmer/products"), 1500);
    } catch (err) {
      const respData = err.response?.data;
      if (typeof respData === "string") {
        setError(respData);
      } else if (respData && respData.message) {
        setError(respData.message);
      } else {
        setError("Failed to add product (Payload may be too large).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Product">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark mb-1">List a Product</h2>
        <p className="text-text-medium">Provide clear details so retailers know exactly what they're buying.</p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <FiX className="text-lg" /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
              <FiCheck className="text-lg" /> {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Product Name <span className="text-red-500">*</span></label>
            <input 
              name="productName" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark placeholder-gray-400" 
              placeholder="e.g. Organic Tomatoes" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Category <span className="text-red-500">*</span></label>
              <select 
                name="category" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark" 
                onChange={handleChange} 
                required
              >
                <option value="">Select Category</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Dairy">Dairy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Is Organic?</label>
              <select 
                name="isOrganic" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark" 
                onChange={handleChange}
              >
                <option value="false">Non-Organic</option>
                <option value="true">Organic 🌿</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Quantity Available (kg) <span className="text-red-500">*</span></label>
              <input 
                name="quantity" 
                type="number" 
                min="1" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark placeholder-gray-400" 
                placeholder="e.g. 100" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Price per unit (₹) <span className="text-red-500">*</span></label>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                min="1" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark placeholder-gray-400" 
                placeholder="e.g. 45.50" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Harvest Date</label>
            <input 
              name="harvestDate" 
              type="date" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark" 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Description</label>
            <textarea 
              name="description" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark placeholder-gray-400 resize-y" 
              placeholder="Tell buyers about the quality, origin, or specific details..." 
              onChange={handleChange} 
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Product Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
              {form.imageUrl ? (
                <div className="relative inline-block">
                  <img src={form.imageUrl} alt="Preview" className="max-h-64 object-contain rounded-xl" />
                  <button 
                    type="button" 
                    onClick={() => setForm({ ...form, imageUrl: "" })} 
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-4xl text-gray-300 mb-3"><FiCamera /></div>
                  <p className="text-text-medium text-sm mb-4">Upload a clear photo of your produce (Max 2MB)</p>
                  <label htmlFor="file-upload" className="cursor-pointer bg-white border border-gray-200 text-text-dark px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    Browse Files
                  </label>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/30 hover:bg-green-600 transition-colors disabled:opacity-70" 
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Listing"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddProduct;