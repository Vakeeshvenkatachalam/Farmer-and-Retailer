import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  FiPlus, FiBox, FiStar, FiChevronDown, FiChevronUp, 
  FiEdit, FiTrash2, FiSave, FiX 
} from "react-icons/fi";

function FarmerMyProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({}); // productId -> feedbacks[]
  const [expanded, setExpanded] = useState(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    price: 0,
    quantity: 0,
    unit: "kg",
    description: "",
    imageUrl: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchFarmerProducts = async () => {
    if (!user?.id) return;
    try {
      const r = await axiosInstance.get(`/products/farmer/${user.id}`);
      setProducts(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerProducts();
  }, [user]);

  const loadFeedback = async (productId) => {
    if (feedbacks[productId]) {
      setExpanded(expanded === productId ? null : productId);
      return;
    }
    try {
      const res = await axiosInstance.get(`/feedback/product/${productId}`);
      setFeedbacks(prev => ({ ...prev, [productId]: res.data }));
      setExpanded(productId);
    } catch (e) {
      setFeedbacks(prev => ({ ...prev, [productId]: [] }));
      setExpanded(productId);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || "",
      category: product.category || "",
      price: product.price || 0,
      quantity: product.quantity || 0,
      unit: product.unit || "kg",
      description: product.description || "",
      imageUrl: product.imageUrl || ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaveLoading(true);
    try {
      await axiosInstance.put(`/products/update/${editingProduct.id}`, formData);
      setEditingProduct(null);
      fetchFarmerProducts(); // Refresh list
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this crop listing? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/products/delete/${id}`);
      fetchFarmerProducts(); // Refresh list
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const avgRating = (fbs) => fbs.length ? (fbs.reduce((s, f) => s + f.rating, 0) / fbs.length).toFixed(1) : null;

  return (
    <DashboardLayout title="My Products">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">My Products</h2>
          <p className="text-text-medium">Manage your listings and view customer reviews.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium shadow-sm shadow-primary/30"
          onClick={() => navigate("/farmer/add-product")}
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-6xl mb-4 text-gray-200"><FiBox /></div>
          <h3 className="text-xl font-bold text-text-dark mb-2">No Products Yet</h3>
          <p className="text-text-medium mb-6">Add your first product to start selling!</p>
          <button 
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-bold shadow-md"
            onClick={() => navigate("/farmer/add-product")}
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
          {products.map((p) => {
            const fbs = feedbacks[p.id] || [];
            const avg = avgRating(fbs);
            const isOpen = expanded === p.id;
            
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                {p.imageUrl ? (
                  <div className="h-48 overflow-hidden relative bg-gray-50">
                    <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover" />
                    {/* Action Float badging */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-2 bg-white/90 backdrop-blur text-orange-600 rounded-full hover:bg-white transition-all shadow-sm border border-orange-100"
                        title="Edit product details"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 bg-white/90 backdrop-blur text-red-650 rounded-full hover:bg-white transition-all shadow-sm border border-red-100"
                        title="Delete product"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gray-50 flex items-center justify-center text-gray-300 relative">
                    <FiBox size={48} />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-2 bg-white/95 text-orange-600 rounded-full hover:bg-white transition-all shadow-sm border border-orange-150"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 bg-white/95 text-red-600 rounded-full hover:bg-white transition-all shadow-sm border border-red-150"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{p.category}</span>
                    {p.isOrganic && (
                      <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">🌿 Organic</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-text-dark leading-tight mb-2">{p.productName}</h3>
                  
                  {p.description && (
                    <p className="text-text-medium text-sm mb-4 line-clamp-2 flex-1">
                      {p.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mb-4 pt-2">
                    <span className="font-bold text-green-600 text-lg font-bold">₹{p.price}<span className="text-xs text-text-medium font-normal">/{p.unit || "unit"}</span></span>
                    <span className="text-sm font-medium text-text-dark bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      <FiBox className="text-gray-400" /> {p.quantity} {p.unit || "kg"}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 text-text-dark hover:bg-gray-100 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200"
                      onClick={() => loadFeedback(p.id)}
                    >
                      {isOpen ? (
                        <><FiChevronUp /> Hide Reviews</>
                      ) : (
                        <><FiStar className="text-orange-400" /> Reviews {avg && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs">{avg}</span>}</>
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
                      {fbs.length === 0 ? (
                        <p className="text-sm text-center text-text-medium py-2">No reviews yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {fbs.map((f) => (
                            <div key={f.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-text-dark text-sm">{f.reviewerName || "Anonymous"}</span>
                                <span className="text-orange-400 text-xs tracking-widest">{stars(f.rating)}</span>
                              </div>
                              <p className="text-text-medium text-xs leading-relaxed mb-1">{f.comment}</p>
                              <span className="text-gray-400 text-[10px] block">{f.createdAt?.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-emerald-500 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FiEdit className="text-xl" />
                <h3 className="text-lg font-bold">Edit Crop Listing</h3>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Crop Name</label>
                <input 
                  type="text" 
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Category</label>
                  <select 
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm"
                  >
                    <option value="VEGETABLE">Vegetable</option>
                    <option value="FRUIT">Fruit</option>
                    <option value="GRAIN">Grain</option>
                    <option value="DAIRY">Dairy</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Unit</label>
                  <input 
                    type="text" 
                    name="unit"
                    required
                    placeholder="e.g. kg, bundle"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Price per Unit (₹)</label>
                  <input 
                    type="number" 
                    name="price"
                    required
                    min="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Available Quantity (Stock)</label>
                  <input 
                    type="number" 
                    name="quantity"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Product Image URL</label>
                <input 
                  type="text" 
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Description</label>
                <textarea 
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-text-medium rounded-xl font-bold transition-all text-sm shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-primary text-white hover:bg-green-600 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-sm shadow-primary/30"
                >
                  {saveLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default FarmerMyProducts;
