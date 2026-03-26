import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

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
    <DashboardLayout>
      <h2>Add New Product</h2>
      <div className="card" style={{ maxWidth: "500px" }}>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          {success && <p style={{ color: "#00ffcc" }}>{success}</p>}

          <input name="productName" placeholder="Product Name *" onChange={handleChange} style={inputStyle} required />
          <input name="category" placeholder="Category *" onChange={handleChange} style={inputStyle} required />
          <input name="quantity" type="number" placeholder="Quantity (kg) *" onChange={handleChange} style={inputStyle} required />
          <input name="price" type="number" step="0.01" placeholder="Price per unit ₹ *" onChange={handleChange} style={inputStyle} required />
          <input name="harvestDate" type="date" placeholder="Harvest Date" onChange={handleChange} style={inputStyle} />
          <input name="description" placeholder="Description" onChange={handleChange} style={inputStyle} />

          <select name="isOrganic" onChange={handleChange} style={inputStyle}>
            <option value="false">Non-Organic</option>
            <option value="true">Organic</option>
          </select>

          <label style={{ display: "block", color: "#ccc", margin: "10px 0 4px", fontSize: "14px" }}>Product Image (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={inputStyle} />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />
          )}

          <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: "16px" }} disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#1a1a2e",
  color: "#fff",
  display: "block",
};

export default AddProduct;