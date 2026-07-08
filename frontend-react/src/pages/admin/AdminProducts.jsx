import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { FiBox, FiSearch, FiFilter, FiImage, FiX, FiEdit, FiTrash2, FiSave } from "react-icons/fi";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/admin/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
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
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product listing? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/products/delete/${id}`);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Products">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-orange-200">
            <FiBox />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark">All Products</h2>
            <p className="text-sm text-text-medium">{products.length} total listings</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 md:w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent border-none outline-none text-sm w-full text-text-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-text-medium hover:text-primary hover:border-primary/50 transition-colors shadow-sm">
            <FiFilter />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-text-medium">
                  <th className="py-4 px-6 font-semibold">Product</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold">Price</th>
                  <th className="py-4 px-6 font-semibold">Stock Level</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.productName} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                              <FiImage />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-text-dark">{product.productName}</p>
                            <p className="text-xs text-text-medium">ID: #{product.id} • Farmer: #{product.farmerId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-text-dark">
                        ₹{product.price} <span className="text-sm font-normal text-text-medium">/ {product.unit}</span>
                      </td>
                      <td className="py-4 px-6">
                        {product.quantity <= 0 ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold">Out of Stock</span>
                        ) : product.quantity <= 10 ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">Low: {product.quantity}</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-bold">In Stock: {product.quantity}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="text-sm text-orange-600 font-bold hover:text-orange-850 bg-orange-50 px-3.5 py-2 rounded-lg transition-colors border border-orange-100 hover:bg-orange-100 flex items-center gap-1 shadow-sm"
                          >
                            <FiEdit /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-sm text-red-600 font-bold hover:text-red-800 bg-red-50 px-3.5 py-2 rounded-lg transition-colors border border-red-100 hover:bg-red-100 flex items-center gap-1 shadow-sm"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-text-medium">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FiEdit className="text-xl" />
                <h3 className="text-lg font-bold">Edit Product Listing</h3>
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
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Product Name</label>
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
                    placeholder="e.g. kg, dozen, bundle"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Price (₹)</label>
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
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Quantity Stock</label>
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

export default AdminProducts;
