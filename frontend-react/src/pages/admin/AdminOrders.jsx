import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { FiShoppingBag, FiSearch, FiFilter, FiActivity, FiXCircle, FiClock, FiPackage, FiTruck, FiCheck } from "react-icons/fi";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Stepper tracking toggle state
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiClock /> Pending</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiPackage /> Confirmed</span>;
      case 'SHIPPED':
        return <span className="bg-purple-100 text-purple-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiTruck /> Shipped</span>;
      case 'DELIVERED':
        return <span className="bg-green-100 text-green-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiCheck /> Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiXCircle /> Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-xs w-max">{status}</span>;
    }
  };

  const renderTimelineStepper = (status) => {
    const steps = [
      { key: "PENDING", label: "Placed", desc: "Awaiting confirmation" },
      { key: "CONFIRMED", label: "Confirmed", desc: "Farmer accepted & packing" },
      { key: "SHIPPED", label: "Shipped", desc: "In transit to retailer" },
      { key: "DELIVERED", label: "Delivered", desc: "Fulfillment complete" }
    ];
    
    const currentIdx = steps.findIndex(s => s.key === status);
    
    if (status === "CANCELLED") {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-650 rounded-xl border border-red-100 max-w-md mx-auto my-2 text-xs font-bold">
          <FiXCircle /> Order Cancelled.
        </div>
      );
    }

    return (
      <div className="py-4 px-6 bg-gray-50/70 border border-gray-100 rounded-xl max-w-2xl mx-auto my-2 animate-in slide-in-from-top-1">
        <div className="flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative text-center">
                {idx < steps.length - 1 && (
                  <div className={`absolute top-3 left-[50%] right-[-50%] h-0.5 z-0 ${
                    idx < currentIdx ? "bg-primary" : "bg-gray-200"
                  }`}></div>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 border transition-all ${
                  isCompleted 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-gray-400 border-gray-200"
                } ${isCurrent ? "scale-110 ring-2 ring-primary/20" : ""}`}>
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 uppercase ${
                  isCurrent ? "text-primary" : isCompleted ? "text-text-dark" : "text-text-medium"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const filteredOrders = orders.filter(o => 
    o.id?.toString().includes(searchTerm) || 
    o.orderStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Orders">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-purple-200">
            <FiShoppingBag />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark">Platform Orders</h2>
            <p className="text-sm text-text-medium">{orders.length} total transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 md:w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
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
                  <th className="py-4 px-6 font-semibold">Order ID & Date</th>
                  <th className="py-4 px-6 font-semibold">Participants</th>
                  <th className="py-4 px-6 font-semibold">Total Price</th>
                  <th className="py-4 px-6 font-semibold">Order Status</th>
                  <th className="py-4 px-6 font-semibold">Payment Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <>
                      <tr key={order.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${trackingOrderId === order.id ? "bg-gray-50/30" : ""}`}>
                        <td className="py-4 px-6">
                          <p className="font-bold text-text-dark">#{order.id}</p>
                          <p className="text-xs text-text-medium">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-text-dark font-medium">Retailer: #{order.retailerId}</p>
                          <p className="text-xs text-text-medium">Product: #{order.productId} (x{order.quantity})</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-text-dark">
                          ₹{order.totalPrice.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                            order.paymentStatus === 'PAID' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
                          }`}>
                            {order.paymentStatus || "PENDING"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors border flex items-center gap-1 ml-auto shadow-sm ${
                              trackingOrderId === order.id 
                                ? "bg-gray-150 text-text-dark border-gray-250 hover:bg-gray-200" 
                                : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
                            }`}
                          >
                            <FiActivity /> {trackingOrderId === order.id ? "Hide Tracker" : "Track"}
                          </button>
                        </td>
                      </tr>
                      {trackingOrderId === order.id && (
                        <tr className="bg-gray-50/40">
                          <td colSpan="6" className="px-6 py-2 border-b border-gray-100">
                            {renderTimelineStepper(order.orderStatus)}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-text-medium">
                      No orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}

export default AdminOrders;
