import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiShoppingBag, FiClock, FiPackage, FiTruck, FiCheck, FiXCircle, FiCreditCard, FiStar, FiActivity } from "react-icons/fi";

function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order Tracking Toggle state
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await axiosInstance.get(`/orders/retailer/${user.id}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

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
      { key: "PENDING", label: "Placed", desc: "Order placed & awaiting confirmation" },
      { key: "CONFIRMED", label: "Confirmed", desc: "Farmer accepted & packing crop" },
      { key: "SHIPPED", label: "Shipped", desc: "Dispatched via transport" },
      { key: "DELIVERED", label: "Delivered", desc: "Crop package delivered" }
    ];
    
    const currentIdx = steps.findIndex(s => s.key === status);
    
    if (status === "CANCELLED") {
      return (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-650 rounded-2xl border border-red-100 max-w-md mx-auto my-2 text-sm font-bold">
          <FiXCircle className="text-lg" /> Order Cancelled. Refund (if paid) will be initiated.
        </div>
      );
    }

    return (
      <div className="py-6 px-8 bg-gray-50/70 border border-gray-100 rounded-2xl max-w-3xl mx-auto my-3 animate-in slide-in-from-top-2">
        <h4 className="font-extrabold text-xs text-text-medium uppercase mb-4 tracking-wider text-center">Fulfillment Journey</h4>
        <div className="flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative text-center">
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div className={`absolute top-4 left-[50%] right-[-50%] h-1 z-0 transition-colors duration-300 ${
                    idx < currentIdx ? "bg-primary" : "bg-gray-200"
                  }`}></div>
                )}
                
                {/* Node icon/circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm z-10 border transition-all duration-300 ${
                  isCompleted 
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                    : "bg-white text-gray-400 border-gray-200"
                } ${isCurrent ? "scale-110 ring-4 ring-primary/20" : ""}`}>
                  {isCompleted ? "✓" : idx + 1}
                </div>
                
                {/* Node Label */}
                <span className={`text-xs font-extrabold mt-2.5 ${
                  isCurrent ? "text-primary" : isCompleted ? "text-text-dark" : "text-text-medium"
                }`}>
                  {step.label}
                </span>
                
                {/* Node details */}
                <span className="text-[10px] text-gray-400 mt-1 max-w-[120px] hidden sm:block">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark mb-1">My Orders</h2>
        <p className="text-text-medium">Track your purchases and manage payments in real-time.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-100 shadow-sm">
          {orders.length} Total
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 shadow-sm">
          {orders.filter(o => o.paymentStatus === "PAID").length} Paid
        </div>
        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-bold border border-orange-100 shadow-sm">
          {orders.filter(o => o.paymentStatus !== "PAID").length} Pending
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 text-gray-200"><FiShoppingBag /></div>
            <h3 className="text-xl font-bold text-text-dark mb-2">No Orders Yet</h3>
            <p className="text-text-medium mb-6">Browse products and place your first order!</p>
            <button 
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-bold shadow-md shadow-primary/30"
              onClick={() => navigate("/retailer/browse")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Order Ref</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <>
                    <tr key={o.id} className={`hover:bg-gray-50/50 transition-colors ${trackingOrderId === o.id ? "bg-gray-50/30" : ""}`}>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary">#{o.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-text-dark">{o.productName || `Product ID: ${o.productId}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-text-medium text-sm flex items-center gap-1"><span className="text-lg">🌾</span> {o.farmerName || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-dark">{o.quantity}</span> <span className="text-xs text-text-medium">kg</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">₹{o.totalPrice}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(o.orderStatus)}
                      </td>
                      <td className="px-6 py-4">
                        {o.paymentStatus === "PAID" ? (
                          <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded flex items-center gap-1 w-max text-xs"><FiCheck /> PAID</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded flex items-center gap-1 w-max text-xs"><FiClock /> PENDING</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setTrackingOrderId(trackingOrderId === o.id ? null : o.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg transition-colors text-sm shadow-sm border ${
                              trackingOrderId === o.id 
                                ? "bg-gray-150 text-text-dark border-gray-250 hover:bg-gray-200" 
                                : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
                            }`}
                          >
                            <FiActivity /> {trackingOrderId === o.id ? "Hide Tracker" : "Track"}
                          </button>
                          {o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED" && (
                            <button 
                              className="flex items-center gap-1 px-3.5 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-sm shadow-sm"
                              onClick={() => navigate(`/retailer/payment/${o.id}`)}
                            >
                              <FiCreditCard /> Pay
                            </button>
                          )}
                          {o.orderStatus === "DELIVERED" && (
                            <button 
                              className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm shadow-sm"
                              onClick={() => navigate(`/retailer/feedback/${o.productId}`)}
                            >
                              <FiStar /> Feedback
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Collapsible Order Tracker Row */}
                    {trackingOrderId === o.id && (
                      <tr className="bg-gray-50/40">
                        <td colSpan="8" className="px-6 py-2 border-b border-gray-100">
                          {renderTimelineStepper(o.orderStatus)}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyOrders;