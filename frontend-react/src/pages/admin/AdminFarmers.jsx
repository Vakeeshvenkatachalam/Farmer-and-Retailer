import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { 
  FiUser, FiSearch, FiCheck, FiX, FiFilter, 
  FiBox, FiShoppingBag, FiInfo, FiMapPin, FiMail, FiPhone 
} from "react-icons/fi";

function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState("profile"); // profile | products | orders

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await axiosInstance.get("/admin/all-farmers");
      setFarmers(response.data);
    } catch (error) {
      console.error("Error fetching farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Farmer products & orders when view details is opened
  const handleViewDetails = async (farmer) => {
    setSelectedFarmer(farmer);
    setLoadingDetails(true);
    setActiveDetailsTab("profile");
    try {
      const [prodRes, orderRes] = await Promise.all([
        axiosInstance.get(`/products/farmer/${farmer.id}`),
        axiosInstance.get(`/orders/farmer/${farmer.id}`)
      ]);
      setFarmerProducts(prodRes.data);
      setFarmerOrders(orderRes.data);
    } catch (err) {
      console.error("Failed to load details for farmer:", err);
      setFarmerProducts([]);
      setFarmerOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Farmers">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-green-200">
            <FiUser />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark">Registered Farmers</h2>
            <p className="text-sm text-text-medium">{farmers.length} total farmers on platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 md:w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search farmers..." 
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
                  <th className="py-4 px-6 font-semibold">Farmer Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Info</th>
                  <th className="py-4 px-6 font-semibold">Location</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.length > 0 ? (
                  filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                            {farmer.name?.charAt(0).toUpperCase() || "F"}
                          </div>
                          <div>
                            <p className="font-bold text-text-dark">{farmer.name}</p>
                            <p className="text-xs text-text-medium">ID: #{farmer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-text-dark">{farmer.email}</p>
                        <p className="text-xs text-text-medium">{farmer.phoneNumber || "No phone"}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-dark">
                        {farmer.address || "Address not provided"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          farmer.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          farmer.approvalStatus === 'PENDING' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {farmer.approvalStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleViewDetails(farmer)}
                          className="text-sm text-primary font-bold hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition-colors border border-green-100 hover:bg-green-100 shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-text-medium">
                      No farmers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[80vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-emerald-500 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                  {selectedFarmer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedFarmer.name}</h3>
                  <p className="text-xs text-green-100">Farmer profile details, inventory, and order analytics</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFarmer(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0 bg-gray-50">
              <button 
                onClick={() => setActiveDetailsTab("profile")}
                className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all ${
                  activeDetailsTab === "profile" 
                    ? "border-primary text-primary bg-white" 
                    : "border-transparent text-text-medium hover:text-text-dark"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FiInfo /> Overview</span>
              </button>
              <button 
                onClick={() => setActiveDetailsTab("products")}
                className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all ${
                  activeDetailsTab === "products" 
                    ? "border-primary text-primary bg-white" 
                    : "border-transparent text-text-medium hover:text-text-dark"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FiBox /> Listed Crops ({farmerProducts.length})</span>
              </button>
              <button 
                onClick={() => setActiveDetailsTab("orders")}
                className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all ${
                  activeDetailsTab === "orders" 
                    ? "border-primary text-primary bg-white" 
                    : "border-transparent text-text-medium hover:text-text-dark"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FiShoppingBag /> Received Orders ({farmerOrders.length})</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-base-cream/30">
              {loadingDetails ? (
                <div className="h-full flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {activeDetailsTab === "profile" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-text-dark text-base col-span-1 md:col-span-2 border-b border-gray-100 pb-2">Contact Details</h4>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiMail /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Email Address</p>
                            <p className="text-sm font-bold text-text-dark">{selectedFarmer.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiPhone /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Phone Number</p>
                            <p className="text-sm font-bold text-text-dark">{selectedFarmer.phoneNumber || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiMapPin /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Location Details</p>
                            <p className="text-sm font-bold text-text-dark">
                              {selectedFarmer.village ? `${selectedFarmer.village}, ` : ""}
                              {selectedFarmer.district ? `${selectedFarmer.district}, ` : ""}
                              {selectedFarmer.state || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiCheck /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Account Status</p>
                            <p className="text-sm font-bold text-text-dark uppercase">{selectedFarmer.approvalStatus}</p>
                          </div>
                        </div>
                      </div>

                      {/* Performance Mini-Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Active Crops</p>
                          <p className="text-2xl font-black text-primary">{farmerProducts.length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Total Sales Receipts</p>
                          <p className="text-2xl font-black text-blue-600">{farmerOrders.length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Earned Revenue</p>
                          <p className="text-2xl font-black text-green-600">
                            ₹{farmerOrders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalPrice : 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailsTab === "products" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {farmerProducts.length === 0 ? (
                        <p className="p-8 text-center text-text-medium">No crops cataloged yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-text-medium uppercase">
                                <th className="py-3 px-4">Crop Name</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                              {farmerProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-4 font-bold text-text-dark">{p.productName}</td>
                                  <td className="py-3 px-4 text-text-medium">{p.category}</td>
                                  <td className="py-3 px-4 font-bold text-green-600">₹{p.price}/{p.unit}</td>
                                  <td className="py-3 px-4 font-bold text-text-dark">{p.quantity} {p.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === "orders" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {farmerOrders.length === 0 ? (
                        <p className="p-8 text-center text-text-medium">No orders received yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-text-medium uppercase">
                                <th className="py-3 px-4">Order ID</th>
                                <th className="py-3 px-4">Product Name</th>
                                <th className="py-3 px-4">Buyer</th>
                                <th className="py-3 px-4">Qty</th>
                                <th className="py-3 px-4">Total</th>
                                <th className="py-3 px-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                              {farmerOrders.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-4 font-bold text-primary">#{o.id}</td>
                                  <td className="py-3 px-4 text-text-dark">{o.productName}</td>
                                  <td className="py-3 px-4 font-medium text-text-medium">{o.retailerName}</td>
                                  <td className="py-3 px-4 font-bold text-text-dark">{o.quantity}</td>
                                  <td className="py-3 px-4 font-bold text-green-600">₹{o.totalPrice}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      o.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-600 border border-green-200' :
                                      o.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' :
                                      'bg-orange-50 text-orange-600 border border-orange-200'
                                    }`}>
                                      {o.orderStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 shrink-0">
              <button 
                onClick={() => setSelectedFarmer(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-text-medium hover:bg-gray-50 rounded-xl font-bold transition-all text-sm shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default AdminFarmers;
