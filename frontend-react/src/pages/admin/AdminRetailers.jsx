import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { 
  FiUsers, FiSearch, FiFilter, FiX, 
  FiShoppingBag, FiInfo, FiMapPin, FiMail, FiPhone, FiCheck, FiClock 
} from "react-icons/fi";

function AdminRetailers() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [retailerOrders, setRetailerOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState("profile"); // profile | orders

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const response = await axiosInstance.get("/admin/retailers");
      setRetailers(response.data);
    } catch (error) {
      console.error("Error fetching retailers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Retailer orders when view orders is clicked
  const handleViewOrders = async (retailer) => {
    setSelectedRetailer(retailer);
    setLoadingDetails(true);
    setActiveDetailsTab("profile");
    try {
      const res = await axiosInstance.get(`/orders/retailer/${retailer.id}`);
      setRetailerOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders for retailer:", err);
      setRetailerOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredRetailers = retailers.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Retailers">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-200">
            <FiUsers />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark">Registered Retailers</h2>
            <p className="text-sm text-text-medium">{retailers.length} total buyers on platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 md:w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search retailers..." 
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
                  <th className="py-4 px-6 font-semibold">Retailer Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Info</th>
                  <th className="py-4 px-6 font-semibold">Business Address</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRetailers.length > 0 ? (
                  filteredRetailers.map((retailer) => (
                    <tr key={retailer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                            {retailer.name?.charAt(0).toUpperCase() || "R"}
                          </div>
                          <div>
                            <p className="font-bold text-text-dark">{retailer.name}</p>
                            <p className="text-xs text-text-medium">ID: #{retailer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-text-dark">{retailer.email}</p>
                        <p className="text-xs text-text-medium">{retailer.phoneNumber || "No phone"}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-dark">
                        {retailer.address || "Address not provided"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleViewOrders(retailer)}
                          className="text-sm text-blue-600 font-bold hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100 hover:bg-blue-100 shadow-sm"
                        >
                          View Orders
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-text-medium">
                      No retailers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details/Orders Modal */}
      {selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[80vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                  {selectedRetailer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedRetailer.name}</h3>
                  <p className="text-xs text-blue-100">Retailer profile details and purchase transactions</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRetailer(null)}
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
                    ? "border-blue-600 text-blue-600 bg-white" 
                    : "border-transparent text-text-medium hover:text-text-dark"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FiInfo /> Overview</span>
              </button>
              <button 
                onClick={() => setActiveDetailsTab("orders")}
                className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all ${
                  activeDetailsTab === "orders" 
                    ? "border-blue-600 text-blue-600 bg-white" 
                    : "border-transparent text-text-medium hover:text-text-dark"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FiShoppingBag /> Order History ({retailerOrders.length})</span>
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
                        <h4 className="font-bold text-text-dark text-base col-span-1 md:col-span-2 border-b border-gray-100 pb-2">Business &amp; Contact Details</h4>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiMail /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Email Address</p>
                            <p className="text-sm font-bold text-text-dark">{selectedRetailer.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 text-lg"><FiPhone /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Phone Number</p>
                            <p className="text-sm font-bold text-text-dark">{selectedRetailer.phoneNumber || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 col-span-1 md:col-span-2">
                          <div className="text-gray-400 text-lg"><FiMapPin /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-medium">Business Address</p>
                            <p className="text-sm font-bold text-text-dark">{selectedRetailer.address || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mini Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Total Purchases</p>
                          <p className="text-2xl font-black text-blue-600">{retailerOrders.length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Pending Orders</p>
                          <p className="text-2xl font-black text-orange-600">
                            {retailerOrders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length}
                          </p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-text-medium mb-1">Total Spent Amount</p>
                          <p className="text-2xl font-black text-green-600">
                            ₹{retailerOrders.reduce((sum, o) => sum + o.totalPrice, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailsTab === "orders" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {retailerOrders.length === 0 ? (
                        <p className="p-8 text-center text-text-medium">No order history available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-text-medium uppercase">
                                <th className="py-3 px-4">Order ID</th>
                                <th className="py-3 px-4">Crop Name</th>
                                <th className="py-3 px-4">Farmer</th>
                                <th className="py-3 px-4">Qty</th>
                                <th className="py-3 px-4">Total</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Payment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                              {retailerOrders.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-4 font-bold text-blue-600">#{o.id}</td>
                                  <td className="py-3 px-4 text-text-dark font-medium">{o.productName}</td>
                                  <td className="py-3 px-4 text-text-medium">{o.farmerName}</td>
                                  <td className="py-3 px-4 font-bold text-text-dark">{o.quantity} kg</td>
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
                                  <td className="py-3 px-4">
                                    {o.paymentStatus === "PAID" ? (
                                      <span className="text-green-600 font-bold flex items-center gap-0.5 text-xs"><FiCheck /> PAID</span>
                                    ) : (
                                      <span className="text-orange-600 font-bold flex items-center gap-0.5 text-xs"><FiClock /> PENDING</span>
                                    )}
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
                onClick={() => setSelectedRetailer(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-text-medium hover:bg-gray-50 rounded-xl font-bold transition-all text-sm shadow-sm"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default AdminRetailers;
